<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\DeliveryJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesPaddlerGoData;
use Tests\TestCase;

class DeliveryJobTest extends TestCase
{
    use RefreshDatabase;
    use CreatesPaddlerGoData;

    private function createReadyDeliveryJob(): DeliveryJob
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

        $response = $this->postJson(
            '/api/orders/checkout',
            [
                'user_address_id' => $address->id,
            ]
        )->assertCreated();

        $orderId = $response->json('data.id');

        Sanctum::actingAs($canteen->vendor);

        foreach ([
            'accepted',
            'preparing',
            'ready_for_pickup',
        ] as $status) {
            $this->patchJson(
                "/api/orders/{$orderId}/status",
                ['status' => $status]
            )->assertOk();
        }

        return DeliveryJob::where(
            'order_id',
            $orderId
        )->firstOrFail();
    }

    private function claimJob(
        DeliveryJob $job,
        User $deliveryperson
    ): void {
        Sanctum::actingAs($deliveryperson);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/claim"
        )->assertOk();
    }

    private function pickupJob(
        DeliveryJob $job,
        User $deliveryperson
    ): void {
        $this->claimJob($job, $deliveryperson);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/pickup"
        )->assertOk();
    }

    public function test_deliveryperson_can_view_available_jobs(): void
    {
        $job = $this->createReadyDeliveryJob();

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        Sanctum::actingAs($deliveryperson);

        $this->getJson('/api/delivery/jobs/available')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.id', $job->id)
            ->assertJsonPath(
                'data.data.0.status',
                'available'
            )
            ->assertJsonPath(
                'data.data.0.deliveryperson_id',
                null
            );
    }

    public function test_available_jobs_hide_private_customer_details(): void
    {
        $this->createReadyDeliveryJob();

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        Sanctum::actingAs($deliveryperson);

        $response = $this->getJson(
            '/api/delivery/jobs/available'
        )->assertOk();

        $order = $response->json('data.data.0.order');

        $this->assertIsArray($order);

        $this->assertArrayNotHasKey(
            'recipient_name',
            $order
        );

        $this->assertArrayNotHasKey(
            'contact_number',
            $order
        );

        $this->assertArrayNotHasKey(
            'delivery_address',
            $order
        );

        $this->assertArrayNotHasKey(
            'delivery_instructions',
            $order
        );
    }

    public function test_deliveryperson_can_claim_available_job(): void
    {
        $job = $this->createReadyDeliveryJob();

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        Sanctum::actingAs($deliveryperson);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/claim"
        )->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'claimed');

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'deliveryperson_id' => $deliveryperson->id,
            'status' => 'claimed',
        ]);

        $this->assertNotNull(
            $job->fresh()->claimed_at
        );

        $this->assertDatabaseHas('orders', [
            'id' => $job->order_id,
            'status' => 'ready_for_pickup',
        ]);

        $this->getJson('/api/delivery/jobs/available')
            ->assertOk()
            ->assertJsonPath('data.total', 0);
    }

    public function test_claimed_job_cannot_be_claimed_again(): void
    {
        $job = $this->createReadyDeliveryJob();

        $first = User::factory()
            ->deliveryperson()
            ->create();

        $second = User::factory()
            ->deliveryperson()
            ->create();

        $this->claimJob($job, $first);

        Sanctum::actingAs($second);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/claim"
        )->assertStatus(409);

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'deliveryperson_id' => $first->id,
            'status' => 'claimed',
        ]);

        $this->assertDatabaseCount('delivery_jobs', 1);
    }

    public function test_deliveryperson_can_only_view_own_jobs(): void
    {
        $firstJob = $this->createReadyDeliveryJob();
        $secondJob = $this->createReadyDeliveryJob();

        $first = User::factory()
            ->deliveryperson()
            ->create();

        $second = User::factory()
            ->deliveryperson()
            ->create();

        $this->claimJob($firstJob, $first);
        $this->claimJob($secondJob, $second);

        Sanctum::actingAs($first);

        $this->getJson('/api/delivery/jobs/mine')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath(
                'data.data.0.id',
                $firstJob->id
            )
            ->assertJsonPath(
                'data.data.0.deliveryperson_id',
                $first->id
            );
    }

    public function test_deliveryperson_can_pickup_claimed_order(): void
    {
        $job = $this->createReadyDeliveryJob();

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        $this->claimJob($job, $deliveryperson);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/pickup"
        )->assertOk()
            ->assertJsonPath('data.status', 'picked_up');

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'status' => 'picked_up',
        ]);

        $this->assertNotNull(
            $job->fresh()->picked_up_at
        );

        $this->assertDatabaseHas('orders', [
            'id' => $job->order_id,
            'status' => 'out_for_delivery',
        ]);

        $this->assertDatabaseHas(
            'order_status_history',
            [
                'order_id' => $job->order_id,
                'changed_by' => $deliveryperson->id,
                'previous_status' => 'ready_for_pickup',
                'new_status' => 'out_for_delivery',
            ]
        );
    }

    public function test_deliveryperson_cannot_deliver_before_pickup(): void
    {
        $job = $this->createReadyDeliveryJob();

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        $this->claimJob($job, $deliveryperson);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/deliver"
        )->assertStatus(409);

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'status' => 'claimed',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $job->order_id,
            'status' => 'ready_for_pickup',
        ]);
    }

    public function test_deliveryperson_cannot_pickup_another_persons_job(): void
    {
        $job = $this->createReadyDeliveryJob();

        $owner = User::factory()
            ->deliveryperson()
            ->create();

        $other = User::factory()
            ->deliveryperson()
            ->create();

        $this->claimJob($job, $owner);

        Sanctum::actingAs($other);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/pickup"
        )->assertForbidden();

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'deliveryperson_id' => $owner->id,
            'status' => 'claimed',
        ]);
    }

    public function test_deliveryperson_cannot_deliver_another_persons_job(): void
    {
        $job = $this->createReadyDeliveryJob();

        $owner = User::factory()
            ->deliveryperson()
            ->create();

        $other = User::factory()
            ->deliveryperson()
            ->create();

        $this->pickupJob($job, $owner);

        Sanctum::actingAs($other);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/deliver"
        )->assertForbidden();

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'deliveryperson_id' => $owner->id,
            'status' => 'picked_up',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $job->order_id,
            'status' => 'out_for_delivery',
        ]);
    }

    public function test_deliveryperson_can_complete_delivery(): void
    {
        $job = $this->createReadyDeliveryJob();

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        $this->pickupJob($job, $deliveryperson);

        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/deliver",
            [
                'remarks' => 'Delivered to customer.',
            ]
        )->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'delivered');

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'deliveryperson_id' => $deliveryperson->id,
            'status' => 'delivered',
            'remarks' => 'Delivered to customer.',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $job->order_id,
            'status' => 'delivered',
        ]);

        $job->refresh();

        $this->assertNotNull($job->delivered_at);

        $this->assertNotNull(
            $job->order->delivered_at
        );

        $this->assertDatabaseHas(
            'order_status_history',
            [
                'order_id' => $job->order_id,
                'changed_by' => $deliveryperson->id,
                'previous_status' => 'out_for_delivery',
                'new_status' => 'delivered',
            ]
        );

        $this->assertSame(
            [
                'pending',
                'accepted',
                'preparing',
                'ready_for_pickup',
                'out_for_delivery',
                'delivered',
            ],
            $job->order->statusHistory()
                ->pluck('new_status')
                ->all()
        );

        // Completed deliveries cannot be repeated.
        $this->patchJson(
            "/api/delivery/jobs/{$job->id}/deliver"
        )->assertStatus(409);

        $this->assertSame(
            6,
            $job->order->statusHistory()->count()
        );

        // Customer can see the completed order.
        Sanctum::actingAs($job->order->customer);

        $this->getJson(
            "/api/orders/{$job->order_id}"
        )->assertOk()
            ->assertJsonPath('data.status', 'delivered');
    }

    public function test_admin_can_monitor_all_delivery_jobs(): void
    {
        $firstJob = $this->createReadyDeliveryJob();
        $secondJob = $this->createReadyDeliveryJob();

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        $admin = User::factory()->admin()->create();

        $this->claimJob($secondJob, $deliveryperson);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/delivery/jobs')
            ->assertOk()
            ->assertJsonPath('data.total', 2);

        $this->getJson(
            '/api/admin/delivery/jobs?status=available'
        )->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath(
                'data.data.0.id',
                $firstJob->id
            );

        $this->getJson(
            "/api/admin/delivery/jobs/{$secondJob->id}"
        )->assertOk()
            ->assertJsonPath('data.id', $secondJob->id)
            ->assertJsonPath('data.status', 'claimed')
            ->assertJsonPath(
                'data.deliveryperson_id',
                $deliveryperson->id
            );
    }

    public function test_delivery_routes_enforce_role_permissions(): void
    {
        $job = $this->createReadyDeliveryJob();

        $customer = User::factory()->customer()->create();
        $vendor = User::factory()->vendor()->create();
        $admin = User::factory()->admin()->create();

        foreach ([$customer, $vendor, $admin] as $user) {
            Sanctum::actingAs($user);

            $this->getJson(
                '/api/delivery/jobs/available'
            )->assertForbidden();

            $this->getJson(
                '/api/delivery/jobs/mine'
            )->assertForbidden();

            $this->patchJson(
                "/api/delivery/jobs/{$job->id}/claim"
            )->assertForbidden();

            $this->patchJson(
                "/api/delivery/jobs/{$job->id}/pickup"
            )->assertForbidden();

            $this->patchJson(
                "/api/delivery/jobs/{$job->id}/deliver"
            )->assertForbidden();
        }

        $deliveryperson = User::factory()
            ->deliveryperson()
            ->create();

        Sanctum::actingAs($deliveryperson);

        $this->getJson(
            '/api/admin/delivery/jobs'
        )->assertForbidden();

        $this->getJson(
            "/api/admin/delivery/jobs/{$job->id}"
        )->assertForbidden();

        $this->assertDatabaseHas('delivery_jobs', [
            'id' => $job->id,
            'deliveryperson_id' => null,
            'status' => 'available',
        ]);
    }
}
