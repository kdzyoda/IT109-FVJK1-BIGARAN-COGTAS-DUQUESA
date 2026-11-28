<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new PaddlerGo customer.
     */
    public function register(Request $request)
    {
        // 1. Validate registration information
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'username' => [
                'required',
                'string',
                'min:5',
                'max:30',
                function ($attribute, $value, $fail) {
                    if (! preg_match('/\A[A-Za-z0-9_]{5,30}\z/', $value)) {
                        $fail('Username must contain only letters, numbers, and underscores, with 5 to 30 characters.');
                    }
                },
                'unique:users,username',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/',
            ],
        ]);

        // 2. Create user using only mass-assignable attributes.
        $user = new User([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign the role explicitly on the server.
        $user->role = 'customer';

        $user->save();

        // 3. Generate Sanctum authentication token
        $token = $user->createToken('paddlergo-api')->plainTextToken;

        // 4. Return successful registration response
        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Welcome to PaddlerGo.',

            'user' => $user->only([
                'id',
                'name',
                'username',
                'email',
                'role',
            ]),

            'token' => $token,

        ], 201);
    }


    /**
     * Authenticate an existing PaddlerGo user.
     */
    public function login(Request $request)
    {
        // 1. Validate login credentials
        $validated = $request->validate([
            'login' => [
                'required',
                'string',
                'max:255',
            ],

            'password' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        // 2. Find user using username OR email
        $user = User::where('username', $validated['login'])
            ->orWhere('email', $validated['login'])
            ->first();

        // 3. Verify account and password
        if (!$user || !Hash::check(
            $validated['password'],
            $user->password
        )) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login credentials.',
            ], 401);
        }

        // 4. Generate Sanctum authentication token
        $token = $user->createToken('paddlergo-api')->plainTextToken;

        // 5. Return authenticated user information
        return response()->json([
            'success' => true,
            'message' => 'Login successful! Welcome back to PaddlerGo.',

            'user' => $user->only([
                'id',
                'name',
                'username',
                'email',
                'role',
            ]),

            'token_type' => 'Bearer',
            'token' => $token,

        ], 200);
    }

    /**
     * Logout the authenticated PaddlerGo user.
     */
    public function logout(Request $request)
    {
        // Retrieve the currently authenticated token
        $token = $request->user()->currentAccessToken();

        // Revoke only the current Sanctum personal access token
        if ($token instanceof \Laravel\Sanctum\PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout successful. Your access token has been revoked.',
        ], 200);
    }

}
