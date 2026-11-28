<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuItemController extends Controller
{
    private function authorizeManagement(Request $request, Canteen $canteen): void
    {
        $user = $request->user();

        abort_unless(
            $user->role === 'admin' ||
            ($user->role === 'vendor' &&
             (int) $canteen->vendor_id === (int) $user->id),
            403,
            'You are not authorized to manage this canteen.'
        );
    }

    public function index(Request $request, Canteen $canteen)
    {
        $this->authorizeManagement($request, $canteen);

        return response()->json([
            'success' => true,
            'data' => $canteen->menuItems()
                ->with('category')
                ->orderBy('name')
                ->paginate(15),
        ]);
    }

    public function available(Canteen $canteen)
    {
        abort_unless(
            $canteen->status === 'active',
            404,
            'Canteen is not available.'
        );

        $items = $canteen->menuItems()
            ->where('availability_status', 'available')
            ->where(function ($query) {
                $query->whereNull('category_id')
                    ->orWhereHas('category', function ($category) {
                        $category->where('is_active', true);
                    });
            })
            ->with('category')
            ->orderBy('name')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function store(Request $request, Canteen $canteen)
    {
        $this->authorizeManagement($request, $canteen);

        $validated = $request->validate([
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('menu_categories', 'id')
                    ->where('canteen_id', $canteen->id),
            ],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => [
                'required',
                'numeric',
                'min:0.01',
                'max:99999999.99',
                'decimal:0,2',
            ],
            'image_url' => ['nullable', 'url:http,https', 'max:2048'],
            'availability_status' => [
                'sometimes',
                Rule::in(['available', 'unavailable', 'sold_out']),
            ],
        ]);

        $item = $canteen->menuItems()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully.',
            'data' => $item->refresh()->load('category'),
        ], 201);
    }

    public function update(Request $request, MenuItem $item)
    {
        $this->authorizeManagement($request, $item->canteen);

        $validated = $request->validate([
            'category_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('menu_categories', 'id')
                    ->where('canteen_id', $item->canteen_id),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0.01',
                'max:99999999.99',
                'decimal:0,2',
            ],
            'image_url' => [
                'sometimes',
                'nullable',
                'url:http,https',
                'max:2048',
            ],
            'availability_status' => [
                'sometimes',
                Rule::in(['available', 'unavailable', 'sold_out']),
            ],
        ]);

        $item->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully.',
            'data' => $item->refresh()->load('category'),
        ]);
    }

    public function destroy(Request $request, MenuItem $item)
    {
        $this->authorizeManagement($request, $item->canteen);

        $item->update([
            'availability_status' => 'unavailable',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu item deactivated successfully.',
        ]);
    }
}
