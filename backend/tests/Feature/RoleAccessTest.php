<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Verify that each role can access only
     * its corresponding protected endpoint.
     */
    public function test_each_role_can_access_only_its_own_endpoint(): void
    {
        $roles = [
            'admin',
            'vendor',
            'customer',
            'deliveryperson',
        ];

        foreach ($roles as $userRole) {

            $user = $this->createUserForRole($userRole);

            foreach ($roles as $endpointRole) {

                $response = $this
                    ->actingAs($user, 'sanctum')
                    ->getJson("/api/test/{$endpointRole}");

                if ($userRole === $endpointRole) {

                    $response->assertOk();

                } else {

                    $response->assertForbidden();

                }
            }
        }
    }

    /**
     * Verify that unauthenticated users
     * cannot access protected role endpoints.
     */
    public function test_unauthenticated_users_cannot_access_role_endpoints(): void
    {
        $roles = [
            'admin',
            'vendor',
            'customer',
            'deliveryperson',
        ];

        foreach ($roles as $role) {

            $response = $this->getJson("/api/test/{$role}");

            $response->assertUnauthorized();
        }
    }

    /**
     * Create a test user according to the specified role.
     */
    private function createUserForRole(string $role): User
    {
        return match ($role) {

            'admin' => User::factory()->admin()->create(),

            'vendor' => User::factory()->vendor()->create(),

            'customer' => User::factory()->customer()->create(),

            'deliveryperson' => User::factory()->deliveryperson()->create(),

            default => throw new \InvalidArgumentException(
                "Unsupported role: {$role}"
            ),
        };
    }
}
