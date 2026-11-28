<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryJob extends Model
{
    protected $fillable = [
        'order_id',
        'deliveryperson_id',
        'status',
        'claimed_at',
        'picked_up_at',
        'delivered_at',
        'cancelled_at',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'claimed_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function deliveryperson(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'deliveryperson_id'
        );
    }
}
