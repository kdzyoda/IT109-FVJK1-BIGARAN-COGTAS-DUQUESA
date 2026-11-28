<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuCategoryController extends Controller
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
            'data' => $canteen->menuCategories()
                ->orderBy('display_order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function store(Request $request, Canteen $canteen)
    {
        $this->authorizeManagement($request, $canteen);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('menu_categories', 'name')
                    ->where('canteen_id', $canteen->id),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category = $canteen->menuCategories()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menu category created successfully.',
            'data' => $category->refresh(),
        ], 201);
    }

    public function update(Request $request, MenuCategory $category)
    {
        $this->authorizeManagement($request, $category->canteen);

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('menu_categories', 'name')
                    ->where('canteen_id', $category->canteen_id)
                    ->ignore($category->id),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menu category updated successfully.',
            'data' => $category->refresh(),
        ]);
    }

    public function destroy(Request $request, MenuCategory $category)
    {
        $this->authorizeManagement($request, $category->canteen);

        $category->update([
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu category deactivated successfully.',
        ]);
    }
}
