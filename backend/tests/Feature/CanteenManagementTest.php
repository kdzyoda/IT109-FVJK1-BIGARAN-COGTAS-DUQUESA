<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesPaddlerGoData;
use Tests\TestCase;

class CanteenManagementTest extends TestCase
{
    use RefreshDatabase;
    use CreatesPaddlerGoData;

    public function test_admin_can_create_canteen(): void
    {
        $admin = User::factory()->admin()->create();
        $vendor = User::factory()->vendor()->create();
        $location = $this->createCampusLocation();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/canteens', [
            'vendor_id' => $vendor->id,
            'campus_location_id' => $location->id,
            'name' => 'PaddlerGo Test Canteen',
            'description' => 'Student food stall.',
            'contact_number' => '09123456789',
            'physical_address' => 'Campus Stall 1',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('canteens', [
            'name' => 'PaddlerGo Test Canteen',
            'vendor_id' => $vendor->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_approve_pending_canteen(): void
    {
        $admin = User::factory()->admin()->create();

        $canteen = $this->createCanteen([
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson(
            "/api/admin/canteens/{$canteen->id}/approve"
        )->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('canteens', [
            'id' => $canteen->id,
            'status' => 'active',
            'approved_by' => $admin->id,
        ]);

        $this->assertNotNull(
            $canteen->fresh()->approved_at
        );
    }

    public function test_admin_can_list_canteens(): void
    {
        $admin = User::factory()->admin()->create();

        $this->createCanteen([
            'name' => 'Admin Visible Canteen',
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/canteens')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment([
                'name' => 'Admin Visible Canteen',
            ]);
    }

    public function test_customer_can_only_browse_active_canteens(): void
    {
        $customer = User::factory()->customer()->create();

        $this->createCanteen([
            'name' => 'Active Canteen',
        ]);

        $this->createCanteen([
            'name' => 'Pending Canteen',
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
        ]);

        Sanctum::actingAs($customer);

        $this->getJson('/api/canteens/active')
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'Active Canteen',
            ])
            ->assertJsonMissing([
                'name' => 'Pending Canteen',
            ]);
    }

    public function test_vendor_can_only_list_assigned_canteens(): void
    {
        $vendor = User::factory()->vendor()->create();

        $this->createCanteen([
            'vendor_id' => $vendor->id,
            'name' => 'My Assigned Canteen',
        ]);

        $this->createCanteen([
            'name' => 'Other Vendor Canteen',
        ]);

        Sanctum::actingAs($vendor);

        $this->getJson('/api/vendor/canteens')
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'My Assigned Canteen',
            ])
            ->assertJsonMissing([
                'name' => 'Other Vendor Canteen',
            ]);
    }

    public function test_vendor_can_update_assigned_canteen(): void
    {
        $vendor = User::factory()->vendor()->create();

        $canteen = $this->createCanteen([
            'vendor_id' => $vendor->id,
        ]);

        Sanctum::actingAs($vendor);

        $this->patchJson(
            "/api/canteens/{$canteen->id}",
            [
                'name' => 'Updated Vendor Canteen',
            ]
        )->assertOk();

        $this->assertDatabaseHas('canteens', [
            'id' => $canteen->id,
            'name' => 'Updated Vendor Canteen',
        ]);
    }

    public function test_vendor_cannot_update_another_vendors_canteen(): void
    {
        $vendor = User::factory()->vendor()->create();

        $canteen = $this->createCanteen([
            'name' => 'Protected Canteen',
        ]);

        Sanctum::actingAs($vendor);

        $this->patchJson(
            "/api/canteens/{$canteen->id}",
            [
                'name' => 'Unauthorized Update',
            ]
        )->assertForbidden();

        $this->assertDatabaseHas('canteens', [
            'id' => $canteen->id,
            'name' => 'Protected Canteen',
        ]);
    }

    public function test_customer_cannot_access_admin_canteen_management(): void
    {
        $customer = User::factory()->customer()->create();

        Sanctum::actingAs($customer);

        $this->getJson('/api/admin/canteens')
            ->assertForbidden();

        $this->postJson('/api/admin/canteens', [])
            ->assertForbidden();
    }
}
