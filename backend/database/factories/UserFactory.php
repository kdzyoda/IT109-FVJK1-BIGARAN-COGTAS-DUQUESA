<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),

            'username' => fake()->unique()->bothify('user_########'),

            'email' => fake()->unique()->safeEmail(),

            'email_verified_at' => now(),

            'password' => static::$password ??= Hash::make('password'),

            'role' => 'customer',

            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Create an administrator account.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    /**
     * Create a vendor account.
     */
    public function vendor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'vendor',
        ]);
    }

    /**
     * Create a deliveryperson account.
     */
    public function deliveryperson(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'deliveryperson',
        ]);
    }

    /**
     * Create a customer account.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'customer',
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
