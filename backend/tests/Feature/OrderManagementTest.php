<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Canteen;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesPaddlerGoData;
use Tests\TestCase;

class OrderManagementTest extends TestCase
{
    use RefreshDatabase;
    use CreatesPaddlerGoData;

    private function placeOrder(
        User $customer,
        Canteen $canteen
    ): Order {
        $address = $this->createAddress($customer);

        $item = $this->createMenuItem($canteen, [
            'price' => 22.00,
        ]);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ])->assertOk();

        $response = $this->postJson(
            '/api/orders/checkout',
            [
                'user_address_id' => $address->id,
                'customer_notes' => 'Please pack properly.',
            ]
        )->assertCreated();

        return Order::findOrFail(
            $response->json('data.id')
        );
    }

    public function test_customer_can_checkout_with_correct_totals(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();
        $address = $this->createAddress($customer);

        $pater = $this->createMenuItem($canteen, [
            'name' => 'Chicken Pater',
            'price' => 22.00,
        ]);

        $water = $this->createMenuItem($canteen, [
            'name' => 'Bottled Water',
            'price' => 15.00,
        ]);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $pater->id,
            'quantity' => 2,
        ])->assertOk();

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $water->id,
            'quantity' => 1,
        ])->assertOk();

        $response = $this->postJson(
            '/api/orders/checkout',
            [
                'user_address_id' => $address->id,
                'customer_notes' => 'Please pack properly.',
            ]
        )->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.subtotal', '59.00')
            ->assertJsonPath('data.delivery_fee', '0.00')
            ->assertJsonPath('data.total_amount', '59.00')
            ->assertJsonCount(2, 'data.items');

        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'customer_id' => $customer->id,
            'canteen_id' => $canteen->id,
            'total_amount' => 59.00,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'menu_item_id' => $pater->id,
            'quantity' => 2,
            'unit_price' => 22.00,
            'subtotal' => 44.00,
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'menu_item_id' => $water->id,
            'quantity' => 1,
            'unit_price' => 15.00,
            'subtotal' => 15.00,
        ]);

        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $orderId,
            'changed_by' => $customer->id,
            'previous_status' => null,
            'new_status' => 'pending',
        ]);

        $this->assertDatabaseCount('cart_items', 0);

        $this->assertDatabaseHas('carts', [
            'customer_id' => $customer->id,
            'canteen_id' => null,
        ]);
    }

    public function test_checkout_rejects_empty_cart(): void
    {
        $customer = User::factory()->customer()->create();
        $address = $this->createAddress($customer);

        Sanctum::actingAs($customer);

        $this->postJson('/api/orders/checkout', [
            'user_address_id' => $address->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['cart']);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_rejects_another_customers_address(): void
    {
        $customer = User::factory()->customer()->create();
        $otherCustomer = User::factory()->customer()->create();

        $address = $this->createAddress($otherCustomer);
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ])->assertOk();

        $this->postJson('/api/orders/checkout', [
            'user_address_id' => $address->id,
        ])->assertNotFound();

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('cart_items', 1);
    }

    public function test_checkout_rejects_item_that_became_unavailable(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();
        $address = $this->createAddress($customer);
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ])->assertOk();

        $item->forceFill([
            'availability_status' => 'sold_out',
        ])->save();

        $this->getJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('data.can_checkout', false);

        $this->postJson('/api/orders/checkout', [
            'user_address_id' => $address->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['cart']);

        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
        $this->assertDatabaseCount('cart_items', 1);
    }

    public function test_customer_can_only_view_own_orders(): void
    {
        $customer = User::factory()->customer()->create();
        $otherCustomer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $ownOrder = $this->placeOrder(
            $customer,
            $canteen
        );

        $otherOrder = $this->placeOrder(
            $otherCustomer,
            $canteen
        );

        Sanctum::actingAs($customer);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonFragment([
                'order_number' => $ownOrder->order_number,
            ])
            ->assertJsonMissing([
                'order_number' => $otherOrder->order_number,
            ]);

        $this->getJson("/api/orders/{$ownOrder->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $ownOrder->id);

        $this->getJson("/api/orders/{$otherOrder->id}")
            ->assertNotFound();
    }

    public function test_vendor_can_only_view_assigned_canteen_orders(): void
    {
        $customer = User::factory()->customer()->create();

        $firstCanteen = $this->createCanteen([
            'name' => 'First Canteen',
        ]);

        $secondCanteen = $this->createCanteen([
            'name' => 'Second Canteen',
        ]);

        $firstOrder = $this->placeOrder(
            $customer,
            $firstCanteen
        );

        $secondOrder = $this->placeOrder(
            $customer,
            $secondCanteen
        );

        Sanctum::actingAs($firstCanteen->vendor);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonFragment([
                'order_number' => $firstOrder->order_number,
            ])
            ->assertJsonMissing([
                'order_number' => $secondOrder->order_number,
            ]);

        $this->getJson("/api/orders/{$secondOrder->id}")
            ->assertNotFound();

        $this->patchJson(
            "/api/orders/{$secondOrder->id}/status",
            ['status' => 'accepted']
        )->assertNotFound();

        $this->assertDatabaseHas('orders', [
            'id' => $secondOrder->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_view_all_orders_but_cannot_change_status(): void
    {
        $customer = User::factory()->customer()->create();
        $admin = User::factory()->admin()->create();

        $firstCanteen = $this->createCanteen([
            'name' => 'First Canteen',
        ]);

        $secondCanteen = $this->createCanteen([
            'name' => 'Second Canteen',
        ]);

        $firstOrder = $this->placeOrder(
            $customer,
            $firstCanteen
        );

        $secondOrder = $this->placeOrder(
            $customer,
            $secondCanteen
        );

        Sanctum::actingAs($admin);

        $this->getJson('/api/orders')
            ->assertOk()
            ->assertJsonPath('data.total', 2)
            ->assertJsonFragment([
                'order_number' => $firstOrder->order_number,
            ])
            ->assertJsonFragment([
                'order_number' => $secondOrder->order_number,
            ]);

        $this->getJson('/api/orders?status=pending')
            ->assertOk()
            ->assertJsonPath('data.total', 2);

        $this->getJson("/api/orders/{$firstOrder->id}")
            ->assertOk();

        $this->patchJson(
            "/api/orders/{$firstOrder->id}/status",
            ['status' => 'accepted']
        )->assertForbidden();
    }

    public function test_customer_can_cancel_pending_order(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $order = $this->placeOrder(
            $customer,
            $canteen
        );

        $this->patchJson(
            "/api/orders/{$order->id}/cancel",
            ['reason' => 'Change of plans.']
        )->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'cancelled',
            'cancellation_reason' => 'Change of plans.',
        ]);

        $this->assertNotNull(
            $order->fresh()->cancelled_at
        );

        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $order->id,
            'changed_by' => $customer->id,
            'previous_status' => 'pending',
            'new_status' => 'cancelled',
        ]);
    }

    public function test_customer_cannot_cancel_accepted_order(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $order = $this->placeOrder(
            $customer,
            $canteen
        );

        Sanctum::actingAs($canteen->vendor);

        $this->patchJson(
            "/api/orders/{$order->id}/status",
            ['status' => 'accepted']
        )->assertOk();

        Sanctum::actingAs($customer);

        $this->patchJson(
            "/api/orders/{$order->id}/cancel",
            ['reason' => 'Change of plans.']
        )->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'accepted',
        ]);
    }

    public function test_vendor_can_process_order_and_create_delivery_job(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $order = $this->placeOrder(
            $customer,
            $canteen
        );

        Sanctum::actingAs($canteen->vendor);

        $transitions = [
            'pending' => 'accepted',
            'accepted' => 'preparing',
            'preparing' => 'ready_for_pickup',
        ];

        foreach ($transitions as $previous => $next) {
            $this->patchJson(
                "/api/orders/{$order->id}/status",
                ['status' => $next]
            )->assertOk()
                ->assertJsonPath('data.status', $next);

            $this->assertDatabaseHas(
                'order_status_history',
                [
                    'order_id' => $order->id,
                    'changed_by' => $canteen->vendor_id,
                    'previous_status' => $previous,
                    'new_status' => $next,
                ]
            );
        }

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'ready_for_pickup',
        ]);

        $this->assertNotNull(
            $order->fresh()->accepted_at
        );

        $this->assertDatabaseHas('delivery_jobs', [
            'order_id' => $order->id,
            'deliveryperson_id' => null,
            'status' => 'available',
        ]);

        $this->assertDatabaseCount('delivery_jobs', 1);

        $this->assertSame(
            4,
            $order->statusHistory()->count()
        );
    }

    public function test_invalid_order_transitions_are_rejected(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $order = $this->placeOrder(
            $customer,
            $canteen
        );

        $this->patchJson(
            "/api/orders/{$order->id}/status",
            ['status' => 'accepted']
        )->assertForbidden();

        Sanctum::actingAs($canteen->vendor);

        $this->patchJson(
            "/api/orders/{$order->id}/status",
            ['status' => 'ready_for_pickup']
        )->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->patchJson(
            "/api/orders/{$order->id}/status",
            ['status' => 'rejected']
        )->assertUnprocessable()
            ->assertJsonValidationErrors(['remarks']);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);

        $this->patchJson(
            "/api/orders/{$order->id}/status",
            [
                'status' => 'rejected',
                'remarks' => 'Ingredients unavailable.',
            ]
        )->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'rejected',
            'cancellation_reason' => 'Ingredients unavailable.',
        ]);

        $this->assertDatabaseCount('delivery_jobs', 0);
    }

    public function test_order_preserves_address_and_price_history(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $order = $this->placeOrder(
            $customer,
            $canteen
        );

        $originalAddress = $order->delivery_address;
        $originalRecipient = $order->recipient_name;
        $addressId = $order->user_address_id;

        $orderItem = $order->items()->firstOrFail();

        $orderItem->menuItem->forceFill([
            'name' => 'Renamed Meal',
            'price' => 50.00,
        ])->save();

        $this->patchJson(
            "/api/addresses/{$addressId}",
            [
                'recipient_name' => 'New Recipient',
                'address_details' => 'New Campus Address',
            ]
        )->assertOk();

        $this->deleteJson(
            "/api/addresses/{$addressId}"
        )->assertOk();

        $this->getJson("/api/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath(
                'data.delivery_address',
                $originalAddress
            )
            ->assertJsonPath(
                'data.recipient_name',
                $originalRecipient
            )
            ->assertJsonPath('data.user_address_id', null)
            ->assertJsonPath('data.total_amount', '44.00');

        $this->assertDatabaseHas('order_items', [
            'id' => $orderItem->id,
            'item_name' => $orderItem->item_name,
            'unit_price' => 22.00,
            'quantity' => 2,
            'subtotal' => 44.00,
        ]);

        $this->assertDatabaseMissing('user_addresses', [
            'id' => $addressId,
        ]);
    }
}
