<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesPaddlerGoData;
use Tests\TestCase;

class MenuManagementTest extends TestCase
{
    use RefreshDatabase;
    use CreatesPaddlerGoData;

    public function test_vendor_can_create_menu_category(): void
    {
        $canteen = $this->createCanteen();

        Sanctum::actingAs($canteen->vendor);

        $this->postJson(
            "/api/canteens/{$canteen->id}/categories",
            [
                'name' => 'Beverages',
                'description' => 'Drinks and refreshments.',
                'display_order' => 1,
                'is_active' => true,
            ]
        )->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Beverages');

        $this->assertDatabaseHas('menu_categories', [
            'canteen_id' => $canteen->id,
            'name' => 'Beverages',
            'is_active' => true,
        ]);
    }

    public function test_vendor_can_update_menu_category(): void
    {
        $canteen = $this->createCanteen();
        $category = $this->createCategory($canteen);

        Sanctum::actingAs($canteen->vendor);

        $this->patchJson(
            "/api/menu-categories/{$category->id}",
            ['name' => 'Rice Meals and Combos']
        )->assertOk();

        $this->assertDatabaseHas('menu_categories', [
            'id' => $category->id,
            'name' => 'Rice Meals and Combos',
        ]);
    }

    public function test_vendor_can_create_menu_item(): void
    {
        $canteen = $this->createCanteen();
        $category = $this->createCategory($canteen);

        Sanctum::actingAs($canteen->vendor);

        $this->postJson(
            "/api/canteens/{$canteen->id}/menu-items",
            [
                'category_id' => $category->id,
                'name' => 'Chicken Pater',
                'description' => 'Chicken rice meal.',
                'price' => 22.00,
                'availability_status' => 'available',
            ]
        )->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Chicken Pater');

        $this->assertDatabaseHas('menu_items', [
            'canteen_id' => $canteen->id,
            'category_id' => $category->id,
            'name' => 'Chicken Pater',
            'price' => 22.00,
        ]);
    }

    public function test_vendor_can_update_menu_item_price(): void
    {
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($canteen->vendor);

        $this->patchJson(
            "/api/menu-items/{$item->id}",
            ['price' => 25.00]
        )->assertOk();

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'price' => 25.00,
        ]);
    }

    public function test_customer_can_only_view_available_menu_items(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();

        $this->createMenuItem($canteen, [
            'name' => 'Available Chicken Pater',
        ]);

        $this->createMenuItem($canteen, [
            'name' => 'Unavailable Adobo',
            'availability_status' => 'unavailable',
        ]);

        $this->createMenuItem($canteen, [
            'name' => 'Sold Out Sisig',
            'availability_status' => 'sold_out',
        ]);

        $inactiveCategory = $this->createCategory($canteen, [
            'name' => 'Inactive Category',
            'is_active' => false,
        ]);

        $this->createMenuItem($canteen, [
            'category_id' => $inactiveCategory->id,
            'name' => 'Hidden Rice Meal',
        ]);

        Sanctum::actingAs($customer);

        $this->getJson(
            "/api/canteens/{$canteen->id}/menu"
        )->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonFragment([
                'name' => 'Available Chicken Pater',
            ])
            ->assertJsonMissing([
                'name' => 'Unavailable Adobo',
            ])
            ->assertJsonMissing([
                'name' => 'Sold Out Sisig',
            ])
            ->assertJsonMissing([
                'name' => 'Hidden Rice Meal',
            ]);
    }

    public function test_vendor_can_change_item_availability(): void
    {
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($canteen->vendor);

        $this->patchJson(
            "/api/menu-items/{$item->id}",
            ['availability_status' => 'sold_out']
        )->assertOk();

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'availability_status' => 'sold_out',
        ]);

        $this->getJson(
            "/api/canteens/{$canteen->id}/menu"
        )->assertOk()
            ->assertJsonPath('data.total', 0);

        $this->patchJson(
            "/api/menu-items/{$item->id}",
            ['availability_status' => 'available']
        )->assertOk();

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'availability_status' => 'available',
        ]);

        $this->getJson(
            "/api/canteens/{$canteen->id}/menu"
        )->assertOk()
            ->assertJsonPath('data.total', 1);
    }

    public function test_negative_menu_item_price_is_rejected(): void
    {
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($canteen->vendor);

        $this->patchJson(
            "/api/menu-items/{$item->id}",
            ['price' => -50.00]
        )->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'price' => 22.00,
        ]);
    }

    public function test_customer_cannot_manage_menu(): void
    {
        $customer = User::factory()->customer()->create();
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($customer);

        $this->postJson(
            "/api/canteens/{$canteen->id}/categories",
            ['name' => 'Unauthorized Category']
        )->assertForbidden();

        $this->postJson(
            "/api/canteens/{$canteen->id}/menu-items",
            [
                'name' => 'Unauthorized Item',
                'price' => 50.00,
            ]
        )->assertForbidden();

        $this->patchJson(
            "/api/menu-items/{$item->id}",
            ['price' => 1.00]
        )->assertForbidden();

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'price' => 22.00,
        ]);
    }

    public function test_vendor_cannot_manage_another_vendors_menu(): void
    {
        $vendor = User::factory()->vendor()->create();
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);

        Sanctum::actingAs($vendor);

        $this->patchJson(
            "/api/menu-items/{$item->id}",
            ['price' => 1.00]
        )->assertForbidden();

        $this->postJson(
            "/api/canteens/{$canteen->id}/categories",
            ['name' => 'Unauthorized Category']
        )->assertForbidden();

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'price' => 22.00,
        ]);
    }

    public function test_vendor_can_deactivate_menu_item_and_category(): void
    {
        $canteen = $this->createCanteen();
        $item = $this->createMenuItem($canteen);
        $category = $item->category;

        Sanctum::actingAs($canteen->vendor);

        $this->deleteJson(
            "/api/menu-items/{$item->id}"
        )->assertOk();

        $this->assertDatabaseHas('menu_items', [
            'id' => $item->id,
            'availability_status' => 'unavailable',
        ]);

        $this->deleteJson(
            "/api/menu-categories/{$category->id}"
        )->assertOk();

        $this->assertDatabaseHas('menu_categories', [
            'id' => $category->id,
            'is_active' => false,
        ]);
    }
}
