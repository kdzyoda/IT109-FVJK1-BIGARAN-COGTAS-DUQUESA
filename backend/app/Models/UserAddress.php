<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    protected $fillable = [
        'user_id',
        'campus_location_id',
        'label',
        'recipient_name',
        'contact_number',
        'address_details',
        'delivery_instructions',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function campusLocation(): BelongsTo
    {
        return $this->belongsTo(CampusLocation::class);
    }
}
