<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CanteenController extends Controller
{
    /**
     * List all canteens for administrators.
     */
    public function index(): JsonResponse
    {
        $canteens = Canteen::with([
            'vendor:id,name,username',
            'campusLocation:id,name,location_type',
        ])->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $canteens,
        ]);
    }

    /**
     * List active canteens for authenticated users.
     */
    public function active(): JsonResponse
    {
        $canteens = Canteen::with('campusLocation:id,name,location_type')
            ->where('status', 'active')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $canteens,
        ]);
    }

    /**
     * List only the authenticated vendor's canteens.
     */
    public function myCanteens(Request $request): JsonResponse
    {
        $canteens = Canteen::with('campusLocation:id,name,location_type')
            ->where('vendor_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $canteens,
        ]);
    }

    /**
     * Register a canteen.
     * Administrator only.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vendor_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', 'vendor'),
            ],
            'campus_location_id' => [
                'required',
                'integer',
                Rule::exists('campus_locations', 'id')
                    ->where('is_active', true),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'contact_number' => [
                'nullable',
                'string',
                'regex:/^\+?[0-9]{10,15}$/',
            ],
            'physical_address' => [
                'nullable', 'string', 'max:255',
            ],
        ]);

        $canteen = new Canteen();

        $canteen->fill(
            collect($validated)
                ->only([
                    'name',
                    'description',
                    'contact_number',
                    'physical_address',
                ])
                ->all()
        );

        $canteen->vendor_id = $validated['vendor_id'];
        $canteen->campus_location_id =
            $validated['campus_location_id'];

        // Administrator approval is a separate operation.
        $canteen->status = 'pending';

        $canteen->save();

        return response()->json([
            'success' => true,
            'message' => 'Canteen registered successfully.',
            'data' => $canteen->load([
                'vendor:id,name,username',
                'campusLocation:id,name,location_type',
            ]),
        ], 201);
    }

    /**
     * Retrieve a canteen.
     * Administrator only for unrestricted details.
     */
    public function show(Canteen $canteen): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $canteen->load([
                'vendor:id,name,username',
                'campusLocation:id,name,location_type',
                'approver:id,name',
            ]),
        ]);
    }

    /**
     * Update canteen information.
     * Administrator or assigned vendor.
     */
    public function update(
        Request $request,
        Canteen $canteen
    ): JsonResponse {
        $user = $request->user();

        if (
            $user->role !== 'admin' &&
            (int) $canteen->vendor_id !== (int) $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'contact_number' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^\+?[0-9]{10,15}$/',
            ],
            'physical_address' => [
                'sometimes', 'nullable', 'string', 'max:255',
            ],
        ]);

        $canteen->fill($validated);
        $canteen->save();

        return response()->json([
            'success' => true,
            'message' => 'Canteen updated successfully.',
            'data' => $canteen->fresh(),
        ]);
    }

    /**
     * Approve a pending canteen.
     * Administrator only.
     */
    public function approve(
        Request $request,
        Canteen $canteen
    ): JsonResponse {
        if ($canteen->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending canteens can be approved.',
            ], 409);
        }

        $canteen->status = 'active';
        $canteen->approved_by = $request->user()->id;
        $canteen->approved_at = now();
        $canteen->save();

        return response()->json([
            'success' => true,
            'message' => 'Canteen approved successfully.',
            'data' => $canteen->fresh(),
        ]);
    }

    /**
     * Deactivate a canteen without deleting it.
     * Administrator only.
     */
    public function destroy(Canteen $canteen): JsonResponse
    {
        if ($canteen->status === 'inactive') {
            return response()->json([
                'success' => false,
                'message' => 'Canteen is already inactive.',
            ], 409);
        }

        $canteen->status = 'inactive';
        $canteen->save();

        return response()->json([
            'success' => true,
            'message' => 'Canteen deactivated successfully.',
        ]);
    }
}
