<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Validation\ValidationException;

class OrderStatusService
{
    private const TRANSITIONS = [
        'pending' => [
            'accepted',
            'cancelled',
            'rejected',
        ],
        'accepted' => ['preparing'],
        'preparing' => ['ready_for_pickup'],
        'ready_for_pickup' => ['out_for_delivery'],
        'out_for_delivery' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
        'rejected' => [],
    ];

    public function record(
        Order $order,
        ?string $previousStatus,
        string $newStatus,
        ?int $changedBy,
        ?string $remarks = null
    ): void {
        $order->statusHistory()->create([
            'changed_by' => $changedBy,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'remarks' => $remarks,
        ]);
    }

    // Caller must authorize the action and lock the order
    // inside a database transaction before calling this method.
    public function transition(
        Order $order,
        string $newStatus,
        int $changedBy,
        ?string $remarks = null
    ): Order {
        $previousStatus = $order->status;

        $allowed = self::TRANSITIONS[$previousStatus] ?? [];

        if (!in_array($newStatus, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => [
                    "Cannot change order status from "
                    . "{$previousStatus} to {$newStatus}.",
                ],
            ]);
        }

        $updates = ['status' => $newStatus];

        if ($newStatus === 'accepted') {
            $updates['accepted_at'] = now();
        }

        if ($newStatus === 'delivered') {
            $updates['delivered_at'] = now();
        }

        if ($newStatus === 'cancelled') {
            $updates['cancelled_at'] = now();
            $updates['cancellation_reason'] = $remarks;
        }

        if ($newStatus === 'rejected') {
            $updates['cancellation_reason'] = $remarks;
        }

        $order->update($updates);

        $this->record(
            $order,
            $previousStatus,
            $newStatus,
            $changedBy,
            $remarks
        );

        return $order->refresh();
    }
}
