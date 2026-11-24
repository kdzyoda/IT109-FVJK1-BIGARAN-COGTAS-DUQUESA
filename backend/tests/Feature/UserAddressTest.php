<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesPaddlerGoData;
use Tests\TestCase;

class UserAddressTest extends TestCase
{
    use RefreshDatabase;
    use CreatesPaddlerGoData;

    private function addressPayload(array $attributes = []): array
    {
        $location = $this->createCampusLocation();

        return array_merge([
            'campus_location_id' => $location->id,
            'label' => 'Campus',
            'recipient_name' => 'Test Student',
            'contact_number' => '09123456789',
            'address_details' => 'Building A, Room 101',
            'delivery_instructions' => 'Meet at entrance.',
            'is_default' => false,
        ], $attributes);
    }

    public function test_customer_can_create_address(): void
    {
        $customer = User::factory()->customer()->create();

        Sanctum::actingAs($customer);

        $this->postJson(
            '/api/addresses',
            $this->addressPayload()
        )->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.label', 'Campus');

        $this->assertDatabaseHas('user_addresses', [
            'user_id' => $customer->id,
            'label' => 'Campus',
            'is_default' => true,
        ]);
    }

    public function test_customer_can_only_view_own_addresses(): void
    {
        $customer = User::factory()->customer()->create();
        $otherCustomer = User::factory()->customer()->create();

        $this->createAddress($customer, [
            'label' => 'My Campus Address',
        ]);

        $this->createAddress($otherCustomer, [
            'label' => 'Private Address',
        ]);

        Sanctum::actingAs($customer);

        $this->getJson('/api/addresses')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment([
                'label' => 'My Campus Address',
            ])
            ->assertJsonMissing([
                'label' => 'Private Address',
            ]);
    }

    public function test_customer_can_update_own_address(): void
    {
        $customer = User::factory()->customer()->create();
        $address = $this->createAddress($customer);

        Sanctum::actingAs($customer);

        $this->patchJson(
            "/api/addresses/{$address->id}",
            [
                'label' => 'Updated Campus Address',
                'address_details' => 'Building B, Room 202',
            ]
        )->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('user_addresses', [
            'id' => $address->id,
            'label' => 'Updated Campus Address',
            'address_details' => 'Building B, Room 202',
        ]);
    }

    public function test_customer_can_change_default_address(): void
    {
        $customer = User::factory()->customer()->create();

        $first = $this->createAddress($customer, [
            'label' => 'First Address',
            'is_default' => true,
        ]);

        $second = $this->createAddress($customer, [
            'label' => 'Second Address',
            'is_default' => false,
        ]);

        Sanctum::actingAs($customer);

        $this->patchJson(
            "/api/addresses/{$second->id}",
            ['is_default' => true]
        )->assertOk();

        $this->assertDatabaseHas('user_addresses', [
            'id' => $first->id,
            'is_default' => false,
        ]);

        $this->assertDatabaseHas('user_addresses', [
            'id' => $second->id,
            'is_default' => true,
        ]);

        $this->assertSame(
            1,
            $customer->addresses()
                ->where('is_default', true)
                ->count()
        );
    }

    public function test_updating_default_address_preserves_default_status(): void
    {
        $customer = User::factory()->customer()->create();

        $first = $this->createAddress($customer, [
            'label' => 'First Address',
            'is_default' => false,
        ]);

        $second = $this->createAddress($customer, [
            'label' => 'Default Address',
            'is_default' => true,
        ]);

        Sanctum::actingAs($customer);

        $this->patchJson(
            "/api/addresses/{$second->id}",
            [
                'label' => 'Updated Default Address',
                'is_default' => true,
            ]
        )->assertOk();

        $this->assertDatabaseHas('user_addresses', [
            'id' => $first->id,
            'is_default' => false,
        ]);

        $this->assertDatabaseHas('user_addresses', [
            'id' => $second->id,
            'label' => 'Updated Default Address',
            'is_default' => true,
        ]);
    }

    public function test_customer_can_delete_own_address(): void
    {
        $customer = User::factory()->customer()->create();
        $address = $this->createAddress($customer);

        Sanctum::actingAs($customer);

        $this->deleteJson(
            "/api/addresses/{$address->id}"
        )->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('user_addresses', [
            'id' => $address->id,
        ]);
    }

    public function test_deleting_default_address_assigns_another_default(): void
    {
        $customer = User::factory()->customer()->create();

        $first = $this->createAddress($customer, [
            'label' => 'First Address',
            'is_default' => true,
        ]);

        $second = $this->createAddress($customer, [
            'label' => 'Second Address',
            'is_default' => false,
        ]);

        Sanctum::actingAs($customer);

        $this->deleteJson(
            "/api/addresses/{$first->id}"
        )->assertOk();

        $this->assertDatabaseMissing('user_addresses', [
            'id' => $first->id,
        ]);

        $this->assertDatabaseHas('user_addresses', [
            'id' => $second->id,
            'is_default' => true,
        ]);
    }

    public function test_customer_cannot_modify_another_customers_address(): void
    {
        $customer = User::factory()->customer()->create();
        $otherCustomer = User::factory()->customer()->create();

        $address = $this->createAddress($otherCustomer, [
            'label' => 'Protected Address',
        ]);

        Sanctum::actingAs($customer);

        $this->patchJson(
            "/api/addresses/{$address->id}",
            ['label' => 'Unauthorized Update']
        )->assertNotFound();

        $this->deleteJson(
            "/api/addresses/{$address->id}"
        )->assertNotFound();

        $this->assertDatabaseHas('user_addresses', [
            'id' => $address->id,
            'user_id' => $otherCustomer->id,
            'label' => 'Protected Address',
        ]);
    }

    public function test_inactive_campus_location_is_rejected(): void
    {
        $customer = User::factory()->customer()->create();

        $location = $this->createCampusLocation([
            'is_active' => false,
        ]);

        Sanctum::actingAs($customer);

        $this->postJson(
            '/api/addresses',
            $this->addressPayload([
                'campus_location_id' => $location->id,
            ])
        )->assertUnprocessable()
            ->assertJsonValidationErrors([
                'campus_location_id',
            ]);

        $this->assertDatabaseCount('user_addresses', 0);
    }
}
