<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['admin01',    'Admin User',    'admin'],
            ['vendor01',   'Vendor User',   'vendor'],
            ['runner01',   'Runner User',   'deliveryperson'],
            ['customer01', 'Customer User', 'customer'],
        ];

        foreach ($accounts as [$username, $name, $role]) {
            $user = User::firstOrNew(['username' => $username]);
            $user->name = $name;
            $user->email = "{$username}@paddlergo.test";
            $user->password = Hash::make('Passw0rd!');
            $user->role = $role;
            $user->save();
        }
    }
}