<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Attributes that can be mass assigned.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
    ];

    /**
     * Attributes hidden from JSON responses.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Canteens assigned to this vendor.
     */
    public function canteens(): HasMany
    {
        return $this->hasMany(
            Canteen::class,
            'vendor_id'
        );
    }

    /**
     * Canteens approved by this administrator.
     */
    public function approvedCanteens(): HasMany
    {
        return $this->hasMany(
            Canteen::class,
            'approved_by'
        );
    }

    /**
     * Cart associated with this customer.
     */
    public function cart(): HasOne
{
    return $this->hasOne(Cart::class, 'customer_id');
}

    public function addresses(): HasMany
{
    return $this->hasMany(UserAddress::class);
}

public function orders(): HasMany
{
    return $this->hasMany(Order::class, 'customer_id');
}

    /**
 * Delivery jobs assigned to this deliveryperson.
 */
public function deliveryJobs(): HasMany
{
    return $this->hasMany(
        DeliveryJob::class,
        'deliveryperson_id'
    );
}
}
