<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserAddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->addresses()
                ->with('campusLocation')
                ->orderByDesc('is_default')
                ->orderBy('id')
                ->get(),
        ]);
    }

    private function rules(bool $updating = false): array
    {
        $required = $updating ? 'sometimes' : 'required';

        return [
            'campus_location_id' => [
                $required,
                'required',
                'integer',
                Rule::exists('campus_locations', 'id')
                    ->where('is_active', true),
            ],
            'label' => [
                $required, 'required', 'string', 'max:100',
            ],
            'recipient_name' => [
                $required, 'required', 'string', 'max:150',
            ],
            'contact_number' => [
                $required, 'required', 'string', 'max:30',
            ],
            'address_details' => [
                $required, 'required', 'string', 'max:2000',
            ],
            'delivery_instructions' => [
                'sometimes', 'nullable', 'string', 'max:2000',
            ],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $address = DB::transaction(function () use (
            $request,
            $validated
        ) {
            $user = User::whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($validated['is_default'] ?? false) {
                $user->addresses()->update([
                    'is_default' => false,
                ]);
            }

            $address = $user->addresses()
                ->create($validated)
                ->refresh()
                ->load('campusLocation');

            if (! $user->addresses()->where('is_default', true)->exists()) {
                $address->update(['is_default' => true]);
            }

            return $address;
        });

        return response()->json([
            'success' => true,
            'message' => 'Address created successfully.',
            'data' => $address,
        ], 201);
    }

    public function update(Request $request, int $address)
    {
        $validated = $request->validate($this->rules(true));

        $result = DB::transaction(function () use (
            $request,
            $address,
            $validated
        ) {
            $user = User::whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();

            $record = $user->addresses()->findOrFail($address);

            if ($validated['is_default'] ?? false) {
                $user->addresses()
                    ->where('id', '!=', $record->id)
                    ->update([
                        'is_default' => false,
                    ]);
            }

            $record->update($validated);

            if (! $user->addresses()->where('is_default', true)->exists()) {
                $user->addresses()
                    ->orderBy('id')
                    ->first()
                    ?->update(['is_default' => true]);
            }

            return $record->refresh()->load('campusLocation');
        });

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully.',
            'data' => $result,
        ]);
    }

    public function setDefault(Request $request, int $address)
    {
        $result = DB::transaction(function () use (
            $request,
            $address
        ) {
            $user = User::whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();

            $record = $user->addresses()
                ->findOrFail($address);

            $user->addresses()
                ->where('id', '!=', $record->id)
                ->update([
                    'is_default' => false,
                ]);

            $record->update([
                'is_default' => true,
            ]);

            return $record->refresh()
                ->load('campusLocation');
        });

        return response()->json([
            'success' => true,
            'message' => 'Default address updated successfully.',
            'data' => $result,
        ]);
    }

    public function destroy(Request $request, int $address)
    {
        DB::transaction(function () use ($request, $address) {
            $user = User::whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();

            $record = $user->addresses()
                ->findOrFail($address);

            $wasDefault = $record->is_default;

            Order::where('user_address_id', $record->id)
                ->update([
                    'user_address_id' => null,
                ]);

            $record->delete();

            if ($wasDefault) {
                $user->addresses()
                    ->orderBy('id')
                    ->first()
                    ?->update(['is_default' => true]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully.',
        ]);
    }
}
