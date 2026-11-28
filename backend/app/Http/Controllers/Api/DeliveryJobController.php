<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryJob;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryJobController extends Controller
{
    // ==========================================
    // AVAILABLE DELIVERY JOBS
    // ==========================================

    public function available(Request $request)
    {
        $jobs = DeliveryJob::query()
            ->where('status', 'available')
            ->whereNull('deliveryperson_id')
            ->whereHas('order', function ($query) {
                $query->where('status', 'ready_for_pickup');
            })
            ->with([
                'order:id,order_number,canteen_id,campus_location_id,delivery_fee,status,placed_at',
                'order.canteen:id,name,physical_address',
                'order.campusLocation:id,name',
            ])
            ->orderBy('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    // ==========================================
    // DELIVERYPERSON'S ASSIGNED JOBS
    // ==========================================

    public function myJobs(Request $request)
    {
        $jobs = DeliveryJob::query()
            ->where('deliveryperson_id', $request->user()->id)
            ->with([
                'order.canteen',
                'order.campusLocation',
                'order.items',
            ])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    // ==========================================
    // CLAIM DELIVERY JOB
    // ==========================================

    public function claim(
        Request $request,
        DeliveryJob $deliveryJob
    ) {
        $job = DB::transaction(function () use (
            $request,
            $deliveryJob
        ) {
            $order = Order::whereKey($deliveryJob->order_id)
                ->lockForUpdate()
                ->firstOrFail();

            $job = DeliveryJob::whereKey($deliveryJob->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_if(
                $job->status !== 'available' ||
                $job->deliveryperson_id !== null,
                409,
                'This delivery job is no longer available.'
            );

            abort_if(
                $order->status !== 'ready_for_pickup',
                409,
                'This order is not ready for pickup.'
            );

            $job->update([
                'deliveryperson_id' => $request->user()->id,
                'status' => 'claimed',
                'claimed_at' => now(),
            ]);

            return $job->refresh()->load([
                'order.canteen',
                'order.campusLocation',
                'order.items',
            ]);
        }, 3);

        return response()->json([
            'success' => true,
            'message' => 'Delivery job claimed successfully.',
            'data' => $job,
        ]);
    }

    // ==========================================
    // PICK UP ORDER
    // ==========================================

    public function pickup(
        Request $request,
        DeliveryJob $deliveryJob
    ) {
        $job = DB::transaction(function () use (
            $request,
            $deliveryJob
        ) {
            $order = Order::whereKey($deliveryJob->order_id)
                ->lockForUpdate()
                ->firstOrFail();

            $job = DeliveryJob::whereKey($deliveryJob->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                (int) $job->deliveryperson_id ===
                (int) $request->user()->id,
                403,
                'You are not assigned to this delivery job.'
            );

            abort_if(
                $job->status !== 'claimed',
                409,
                'Only claimed delivery jobs can be picked up.'
            );

            abort_if(
                $order->status !== 'ready_for_pickup',
                409,
                'This order is not ready for pickup.'
            );

            $previousStatus = $order->status;
            $timestamp = now();

            $job->update([
                'status' => 'picked_up',
                'picked_up_at' => $timestamp,
            ]);

            $order->update([
                'status' => 'out_for_delivery',
            ]);

            $order->statusHistory()->create([
                'changed_by' => $request->user()->id,
                'previous_status' => $previousStatus,
                'new_status' => 'out_for_delivery',
                'remarks' => 'Order picked up by deliveryperson.',
            ]);

            return $job->refresh()->load([
                'order.canteen',
                'order.campusLocation',
                'order.items',
                'order.statusHistory',
            ]);
        }, 3);

        return response()->json([
            'success' => true,
            'message' => 'Order picked up successfully.',
            'data' => $job,
        ]);
    }

    // ==========================================
    // COMPLETE DELIVERY
    // ==========================================

    public function deliver(
        Request $request,
        DeliveryJob $deliveryJob
    ) {
        $validated = $request->validate([
            'remarks' => [
                'sometimes',
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $job = DB::transaction(function () use (
            $request,
            $deliveryJob,
            $validated
        ) {
            $order = Order::whereKey($deliveryJob->order_id)
                ->lockForUpdate()
                ->firstOrFail();

            $job = DeliveryJob::whereKey($deliveryJob->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                (int) $job->deliveryperson_id ===
                (int) $request->user()->id,
                403,
                'You are not assigned to this delivery job.'
            );

            abort_if(
                $job->status !== 'picked_up',
                409,
                'The order must be picked up before delivery.'
            );

            abort_if(
                $order->status !== 'out_for_delivery',
                409,
                'This order is not currently out for delivery.'
            );

            $previousStatus = $order->status;
            $timestamp = now();

            $job->update([
                'status' => 'delivered',
                'delivered_at' => $timestamp,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $order->update([
                'status' => 'delivered',
                'delivered_at' => $timestamp,
            ]);

            $order->statusHistory()->create([
                'changed_by' => $request->user()->id,
                'previous_status' => $previousStatus,
                'new_status' => 'delivered',
                'remarks' => $validated['remarks']
                    ?? 'Order delivered successfully.',
            ]);

            return $job->refresh()->load([
                'order.canteen',
                'order.campusLocation',
                'order.items',
                'order.statusHistory',
            ]);
        }, 3);

        return response()->json([
            'success' => true,
            'message' => 'Order delivered successfully.',
            'data' => $job,
        ]);
    }

    // ==========================================
    // ADMIN: VIEW ALL DELIVERY JOBS
    // ==========================================

    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => [
                'sometimes',
                'in:available,claimed,picked_up,delivered,cancelled',
            ],
        ]);

        $query = DeliveryJob::query()->with([
            'order.canteen',
            'order.campusLocation',
            'deliveryperson:id,name,username',
        ]);

        if (isset($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate(15),
        ]);
    }

    // ==========================================
    // ADMIN: VIEW SPECIFIC DELIVERY JOB
    // ==========================================

    public function show(DeliveryJob $deliveryJob)
    {
        return response()->json([
            'success' => true,
            'data' => $deliveryJob->load([
                'order.canteen',
                'order.campusLocation',
                'order.items',
                'order.statusHistory',
                'deliveryperson:id,name,username',
            ]),
        ]);
    }
}
