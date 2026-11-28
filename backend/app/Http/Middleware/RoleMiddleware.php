<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
    ): Response {

        // 1. Get the authenticated user
        $user = $request->user();

        // 2. Verify authentication
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // 3. Check whether the user has an authorized role
        if (!in_array($user->role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Insufficient permissions.',
            ], 403);
        }

        // 4. Allow authorized requests to continue
        return $next($request);
    }
}
