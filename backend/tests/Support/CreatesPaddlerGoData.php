<?php

namespace Tests\Support;

use App\Models\User;
use App\Models\CampusLocation;
use App\Models\Canteen;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\UserAddress;

trait CreatesPaddlerGoData
{
    protected function createCampusLocation(
        array $attributes = []
    ): CampusLocation {
        return CampusLocation::create(array_merge([
            'name' => 'Test Campus Location',
            'location_type' => 'landmark',
            'parent_location_id' => null,
            'description' => 'Automated testing location.',
            'is_active' => true,
        ], $attributes));
    }

    protected function createCanteen(
        array $attributes = []
    ): Canteen {
        $vendor = User::factory()->vendor()->create();
        $admin = User::factory()->admin()->create();
        $location = $this->createCampusLocation();
        return Canteen::forceCreate(array_merge([
            'vendor_id' => $vendor->id,
            'campus_location_id' => $location->id,
            'name' => 'Test Canteen',
            'description' => 'Automated testing canteen.',
            'contact_number' => '09123456789',
            'physical_address' => 'Main Campus Stall 1',
            'status' => 'active',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ], $attributes));
    }

    protected function createCategory(
        Canteen $canteen,
        array $attributes = []
    ): MenuCategory {
        return MenuCategory::create(array_merge([
            'canteen_id' => $canteen->id,
            'name' => 'Rice Meals',
            'description' => 'Test menu category.',
            'display_order' => 0,
            'is_active' => true,
        ], $attributes));
    }

    protected function createMenuItem(
        Canteen $canteen,
        array $attributes = []
    ): MenuItem {
        $category = $canteen->menuCategories()->first()
            ?? $this->createCategory($canteen);

        return MenuItem::create(array_merge([
            'canteen_id' => $canteen->id,
            'category_id' => $category->id,
            'name' => 'Chicken Pater',
            'description' => 'Test menu item.',
            'price' => 22.00,
            'image_url' => null,
            'availability_status' => 'available',
        ], $attributes));
    }

    protected function createAddress(
        User $customer,
        array $attributes = []
    ): UserAddress {
        $location = $this->createCampusLocation();

        return UserAddress::create(array_merge([
            'user_id' => $customer->id,
            'campus_location_id' => $location->id,
            'label' => 'Campus',
            'recipient_name' => $customer->name,
            'contact_number' => '09123456789',
            'address_details' => 'Building A, Room 101',
            'delivery_instructions' => 'Meet at entrance.',
            'is_default' => true,
        ], $attributes));
    }
}
