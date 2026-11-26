# Activity 1 Authentication QA Notes

**Tester:** Queenith Jean Bigaran  
**Role:** API Integration & QA  
**Environment:** Local Next.js frontend with Laravel API and seeded SQLite data  
**Scope:** Authentication and role-based dashboard access. Checkout is excluded from the Activity 1 demo by team agreement.

## Results

| Check | Result | Notes |
|---|---|---|
| Sign in with valid credentials | Pass | Seeded customer account signed in successfully. |
| Sign in with an incorrect password | Pass | The app displays an error and does not sign in. |
| Session after page refresh | Pass | The signed-in session remains active after refresh. |
| Sign out | Pass | Sign-out succeeds. |
| Customer dashboard access | Pass | Customer account reaches the customer dashboard. |
| Role-specific dashboard access | Pass | Seeded roles reach their expected dashboards; cross-role access checks worked as expected. |
| Valid registration | Pass | API returned `201`, assigned the `customer` role, and returned a token. |
| Duplicate username or email | Pass | API returned `422` with field-specific validation errors. |
| Weak password or mismatched confirmation | Pass | API returned `422` with a password validation error. |
| Login with email | Pending retest | Cogtas added username-or-email support to the frontend in commit `d90e983`. The earlier API test hit the login throttle (`429`), so successful email sign-in has not yet been verified. |

## Excluded from this demo

- Checkout and payment were not tested because checkout is excluded from Activity 1.
- Image upload was not tested.

## Follow-up

- Retry email sign-in through the updated frontend after the login throttle window expires; record `Pass` only after a successful sign-in.
- The frontend reads `NEXT_PUBLIC_API_BASE_URL` and falls back to `http://127.0.0.1:8000`; set the environment variable to the team's confirmed Laravel base URL when running the integration.

## QA summary

The Activity 1 authentication and role-access checks passed in the local environment. Invalid-password handling showed an error as expected. These notes record a local development check, not a production test.
