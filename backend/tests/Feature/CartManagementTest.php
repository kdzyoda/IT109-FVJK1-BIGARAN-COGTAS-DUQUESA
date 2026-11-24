<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesPaddlerGoData;
use Tests\TestCase;

class CartManagementTest extends TestCase
{
    use RefreshDatabase;
    use CreatesPaddlerGoData;

    public function test_customer_can_view_empty_cart(): void
    {
        $customer = User::factory()->customer()->create();

        Sanctum::actingAs($customer);

        $this->getJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer_id', $customer->id)
            ->assertJsonPath('data.canteen_id', null)
            ->assertJsonPath('data.total_items', 0)
            ->assertJsonPath('data.subtotal', '0.00')
            ->assertJsonPath('data.can_checkout', false)
            ->assertJsonCount(0, 'data.items');
    }

    public function test_customer_can_add_item_to_cart(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.canteen_id', $canteen->id)
            ->assertJsonPath('data.total_items', 2)
            ->assertJsonPath('data.subtotal', '44.00')
            ->assertJsonPath('data.can_checkout', true);

        $this->assertDatabaseHas('cart_items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ]);
    }

    public function test_cart_calculates_multiple_item_totals(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

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
        ])->assertOk()
            ->assertJsonPath('data.total_items', 3)
            ->assertJsonPath('data.subtotal', '59.00')
            ->assertJsonCount(2, 'data.items');
    }

    public function test_adding_same_item_increases_quantity(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ])->assertOk();

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 3,
        ])->assertOk()
            ->assertJsonPath('data.total_items', 5)
            ->assertJsonPath('data.subtotal', '110.00')
            ->assertJsonCount(1, 'data.items');

        $this->assertDatabaseCount('cart_items', 1);

        $this->assertDatabaseHas('cart_items', [
            'menu_item_id' => $item->id,
            'quantity' => 5,
        ]);
    }

    public function test_customer_can_update_cart_item_quantity(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ])->assertOk();

        $cartItemId = $response->json('data.items.0.id');

        $this->patchJson(
            "/api/cart/items/{$cartItemId}",
            ['quantity' => 4]
        )->assertOk()
            ->assertJsonPath('data.total_items', 4)
            ->assertJsonPath('data.subtotal', '88.00');

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItemId,
            'quantity' => 4,
        ]);
    }

    public function test_removing_last_item_resets_canteen(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ])->assertOk();

        $cartItemId = $response->json('data.items.0.id');

        $this->deleteJson(
            "/api/cart/items/{$cartItemId}"
        )->assertOk()
            ->assertJsonPath('data.canteen_id', null)
            ->assertJsonPath('data.total_items', 0)
            ->assertJsonPath('data.subtotal', '0.00')
            ->assertJsonPath('data.can_checkout', false);

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItemId,
        ]);
    }

    public function test_customer_can_clear_cart(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $first = $this->createMenuItem($canteen, [
            'name' => 'Chicken Pater',
        ]);

        $second = $this->createMenuItem($canteen, [
            'name' => 'Bottled Water',
            'price' => 15.00,
        ]);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $first->id,
            'quantity' => 2,
        ])->assertOk();

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $second->id,
            'quantity' => 1,
        ])->assertOk();

        $this->deleteJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('data.canteen_id', null)
            ->assertJsonPath('data.total_items', 0)
            ->assertJsonPath('data.subtotal', '0.00')
            ->assertJsonPath('data.can_checkout', false)
            ->assertJsonCount(0, 'data.items');

        $this->assertDatabaseCount('cart_items', 0);

        $this->assertDatabaseHas('carts', [
            'customer_id' => $customer->id,
            'canteen_id' => null,
        ]);
    }

    public function test_cart_rejects_items_from_different_canteens(): void
    {
        $customer = User::factory()->customer()->create();

        $firstCanteen = $this->createCanteen([
            'name' => 'First Canteen',
        ]);

        $secondCanteen = $this->createCanteen([
            'name' => 'Second Canteen',
        ]);

        $first = $this->createMenuItem($firstCanteen);
        $second = $this->createMenuItem($secondCanteen);

        Sanctum::actingAs($customer);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $first->id,
            'quantity' => 1,
        ])->assertOk();

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $second->id,
            'quantity' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['menu_item_id']);

        $this->assertDatabaseCount('cart_items', 1);

        $this->assertDatabaseHas('carts', [
            'customer_id' => $customer->id,
            'canteen_id' => $firstCanteen->id,
        ]);

        $this->assertDatabaseMissing('cart_items', [
            'menu_item_id' => $second->id,
        ]);
    }

    public function test_cart_rejects_invalid_quantities_and_unavailable_items(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $available = $this->createMenuItem($canteen);

        $unavailable = $this->createMenuItem($canteen, [
            'name' => 'Sold Out Meal',
            'availability_status' => 'sold_out',
        ]);

        Sanctum::actingAs($customer);

        foreach ([0, -1, 100] as $quantity) {
            $this->postJson('/api/cart/items', [
                'menu_item_id' => $available->id,
                'quantity' => $quantity,
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['quantity']);
        }

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $unavailable->id,
            'quantity' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['menu_item_id']);

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $available->id,
            'quantity' => 99,
        ])->assertOk();

        $this->postJson('/api/cart/items', [
            'menu_item_id' => $available->id,
            'quantity' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['quantity']);

        $this->assertDatabaseHas('cart_items', [
            'menu_item_id' => $available->id,
            'quantity' => 99,
        ]);

        $this->assertDatabaseMissing('cart_items', [
            'menu_item_id' => $unavailable->id,
        ]);
    }

    public function test_customer_cannot_access_another_customers_cart_items(): void
    {
        $owner = User::factory()->customer()->create();
        $otherCustomer = User::factory()->customer()->create();

        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($owner);

        $response = $this->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ])->assertOk();

        $cartItemId = $response->json('data.items.0.id');

        Sanctum::actingAs($otherCustomer);

        $this->getJson('/api/cart')
            ->assertOk()
            ->assertJsonCount(0, 'data.items');

        $this->patchJson(
            "/api/cart/items/{$cartItemId}",
            ['quantity' => 10]
        )->assertNotFound();

        $this->deleteJson(
            "/api/cart/items/{$cartItemId}"
        )->assertNotFound();

        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItemId,
            'quantity' => 2,
        ]);

        $vendor = User::factory()->vendor()->create();

        Sanctum::actingAs($vendor);

        $this->getJson('/api/cart')
            ->assertForbidden();
    }
}
