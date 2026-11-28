<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampusLocation extends Model
{
    /**
     * Mass-assignable attributes.
     */
    protected $fillable = [
        'parent_location_id',
        'name',
        'location_type',
        'description',
        'is_active',
    ];

    /**
     * Attribute casting.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Parent campus location.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            self::class,
            'parent_location_id'
        );
    }

    /**
     * Child campus locations.
     */
    public function children(): HasMany
    {
        return $this->hasMany(
            self::class,
            'parent_location_id'
        );
    }

    /**
     * Canteens located within this campus location.
     */
    public function canteens(): HasMany
    {
        return $this->hasMany(
            Canteen::class,
            'campus_location_id'
        );
    }

    public function userAddresses(): HasMany
{
    return $this->hasMany(UserAddress::class);
}

public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}
}
