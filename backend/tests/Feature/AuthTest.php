<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful customer registration.
     * Also verify that public registration cannot
     * assign an administrator role.
     */
    public function test_user_can_register_successfully(): void
    {
        $password = 'PaddlerGo2026!Test';

        $response = $this->postJson('/api/register', [
            'name' => 'PaddlerGo Test Student',
            'username' => 'test_student01',
            'email' => 'student01@example.test',
            'password' => $password,
            'password_confirmation' => $password,
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.username', 'test_student01')
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonStructure([
                'success',
                'message',
                'user' => [
                    'id',
                    'name',
                    'username',
                    'email',
                    'role',
                ],
                'token',
            ]);

        $user = User::where(
            'username',
            'test_student01'
        )->firstOrFail();

        // Verify password is properly hashed.
        $this->assertTrue(
            Hash::check($password, $user->password)
        );

        // Verify account information in database.
        $this->assertDatabaseHas('users', [
            'username' => 'test_student01',
            'email' => 'student01@example.test',
            'role' => 'customer',
        ]);

        // Verify that passwords are not exposed.
        $this->assertArrayNotHasKey(
            'password',
            $response->json('user')
        );
    }

    /**
     * Test login using username.
     */
    public function test_user_can_login_using_username(): void
    {
        $password = 'PaddlerGo2026!Test';

        User::factory()->create([
            'name' => 'Test Student',
            'username' => 'student_login',
            'email' => 'login@example.test',
            'password' => Hash::make($password),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'student_login',
            'password' => $password,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.username', 'student_login')
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure([
                'success',
                'message',
                'user',
                'token_type',
                'token',
            ]);
    }

    /**
     * Test login using email.
     */
    public function test_user_can_login_using_email(): void
    {
        $password = 'PaddlerGo2026!Test';

        User::factory()->create([
            'name' => 'Test Student',
            'username' => 'student_email',
            'email' => 'email_login@example.test',
            'password' => Hash::make($password),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'email_login@example.test',
            'password' => $password,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath(
                'user.email',
                'email_login@example.test'
            )
            ->assertJsonPath('user.username', 'student_email')
            ->assertJsonPath('token_type', 'Bearer');
    }

    /**
     * Test rejection of invalid credentials.
     */
    public function test_login_rejects_invalid_credentials(): void
    {
        $password = 'PaddlerGo2026!Test';

        User::factory()->create([
            'username' => 'invalid_test',
            'email' => 'invalid@example.test',
            'password' => Hash::make($password),
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'invalid_test',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertUnauthorized()
            ->assertJsonPath('success', false)
            ->assertJsonPath(
                'message',
                'Invalid login credentials.'
            );
    }

    /**
     * Test successful logout and token revocation.
     *
     * Verify that:
     * 1. The user can successfully log out.
     * 2. The current access token is deleted.
     * 3. The revoked token cannot be reused.
     */
    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::factory()->create([
            'username' => 'logout_test',
            'email' => 'logout@example.test',
            'role' => 'customer',
        ]);

        // Generate a Sanctum personal access token.
        $token = $user->createToken('test-token')->plainTextToken;

        // Authenticate and perform logout.
        $response = $this->withToken($token)
            ->postJson('/api/logout');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath(
                'message',
                'Logout successful. Your access token has been revoked.'
            );

        // Confirm that the token was deleted from MySQL/SQLite.
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'test-token',
        ]);

        // Clear cached authentication guards.
        // This ensures the next request performs
        // a fresh Sanctum token authentication check.
        app('auth')->forgetGuards();

        // Attempt to reuse the revoked token.
        $revokedTokenResponse = $this->withToken($token)
            ->getJson('/api/user');

        $revokedTokenResponse->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    /**
     * Test rejection of duplicate registration.
     */
    public function test_duplicate_username_is_rejected(): void
    {
        User::factory()->create([
            'username' => 'existing_user',
            'email' => 'existing@example.test',
        ]);

        $password = 'PaddlerGo2026!Test';

        $response = $this->postJson('/api/register', [
            'name' => 'Another Student',
            'username' => 'existing_user',
            'email' => 'another@example.test',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }
}
