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

## Excluded from this demo

- Checkout and payment were not tested because checkout is excluded from Activity 1.
- Image upload was not tested.

## QA summary

The Activity 1 authentication and role-access checks passed in the local environment. Invalid-password handling showed an error as expected. These notes record a local development check, not a production test.
