<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Canteen extends Model
{
    protected $fillable = [
        'name',
        'description',
        'contact_number',
        'physical_address',
        'logo_url',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Vendor assigned to this canteen.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'vendor_id'
        );
    }

    /**
     * Campus location of the canteen.
     */
    public function campusLocation(): BelongsTo
    {
        return $this->belongsTo(
            CampusLocation::class,
            'campus_location_id'
        );
    }

    /**
     * Administrator who approved the canteen.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'approved_by'
        );
    }

    /**
     * Menu categories of the canteen.
     */ 
    public function menuCategories(): HasMany
{
    return $this->hasMany(MenuCategory::class);
}

public function menuItems(): HasMany
{
    return $this->hasMany(MenuItem::class);
}

    public function carts(): HasMany
{
    return $this->hasMany(Cart::class);
}

public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}
}


