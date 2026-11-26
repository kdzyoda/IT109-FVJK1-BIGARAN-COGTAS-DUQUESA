# PaddlerGo API Contract

This document records the Laravel API contract implemented on `feature/backend-auth-duquesa` and the integration mismatches found in `feature/frontend-nextjs-cogtas`. The API uses JSON and is served locally at `http://127.0.0.1:8000`; prepend `/api` to every route below. Authenticated requests use a Laravel Sanctum personal access token in `Authorization: Bearer <token>`.

## Authentication

| Method | Route | Access | Request | Success response |
|---|---|---|---|---|
| POST | `/register` | Public; throttled | `{ name, username, email, password, password_confirmation }` | `201 { success, message, user, token }`; role is assigned as `customer` by the server |
| POST | `/login` | Public; throttled | `{ login, password }`; `login` accepts username or email | `200 { success, message, user, token_type: "Bearer", token }` |
| GET | `/user` | Authenticated | Bearer token | `200 { success, user: { id, name, username, email, role } }` |
| POST | `/logout` | Authenticated | Bearer token | `200 { success, message }`; revokes the current token |

Registration validates usernames to 5–30 letters, numbers, or underscores. Passwords must be confirmed and contain at least eight characters, including lowercase, uppercase, a digit, and a special character. Validation failures return HTTP `422` with `message` and field-level `errors`; invalid credentials return `401`; unauthenticated requests return `401`; disallowed roles return `403`; throttling returns `429`.

## Application routes

All routes below require a valid Bearer token unless marked public. Role names are `customer`, `vendor`, `deliveryperson`, and `admin`.

| Method | Route | Role access | Purpose |
|---|---|---|---|
| GET | `/test/{customer\|vendor\|deliveryperson\|admin}` | Matching role | Role access smoke test |
| GET | `/canteens/active` | Any authenticated user | Browse active canteens |
| GET | `/vendor/canteens` | Vendor | View assigned canteens |
| GET, POST | `/admin/canteens` | Admin | List/create canteens |
| GET, DELETE | `/admin/canteens/{canteen}` | Admin | View/delete canteen |
| PATCH | `/admin/canteens/{canteen}/approve` | Admin | Approve canteen |
| PATCH | `/canteens/{canteen}` | Admin or vendor | Update canteen |
| GET | `/canteens/{canteen}/menu` | Any authenticated user | Browse available menu items |
| GET, POST | `/canteens/{canteen}/categories` | Admin or vendor | List/create menu categories |
| PATCH, DELETE | `/menu-categories/{category}` | Admin or vendor | Update/delete category |
| GET, POST | `/canteens/{canteen}/menu-items` | Admin or vendor | List/create menu items |
| PATCH, DELETE | `/menu-items/{item}` | Admin or vendor | Update/delete menu item |
| GET | `/cart` | Customer | Read cart |
| POST | `/cart/items` | Customer | Add item to cart |
| PATCH, DELETE | `/cart/items/{cartItem}` | Customer | Change quantity/delete item |
| DELETE | `/cart` | Customer | Clear cart |
| GET, POST | `/addresses` | Customer | List/create delivery addresses |
| PATCH, DELETE | `/addresses/{address}` | Customer | Update/delete address |
| POST | `/orders/checkout` | Customer | Place order from server-side cart |
| GET | `/orders`, `/orders/{order}` | Customer, vendor, admin | List/view authorized orders |
| PATCH | `/orders/{order}/cancel` | Customer | Cancel own order |
| PATCH | `/orders/{order}/status` | Vendor | Update order status |
| GET | `/delivery/jobs/available`, `/delivery/jobs/mine` | Deliveryperson | Browse available and assigned jobs |
| PATCH | `/delivery/jobs/{deliveryJob}/claim`, `/pickup`, `/deliver` | Deliveryperson | Claim or advance a delivery job |
| GET | `/admin/delivery/jobs`, `/admin/delivery/jobs/{deliveryJob}` | Admin | Monitor delivery jobs |

Resource request and response fields for canteens, menus, carts, addresses, orders, and delivery jobs are defined by their Laravel controllers. Responses use JSON; many successful resource operations wrap values in `{ success, message, data }`. Checkout accepts `{ user_address_id, customer_notes? }`, creates an order from the authenticated customer's server-side cart, clears that cart, and returns `201 { success, message, data }`. The server calculates prices and currently sets delivery fee to zero.

## Frontend integration findings

The frontend auth provider matches the auth contract: it sends `login` and `password`, registration sends `password_confirmation`, and protected calls send Bearer tokens. The UI maps backend role `deliveryperson` to its display role `runner`.

| Frontend call | Finding | Required integration action |
|---|---|---|
| `POST /api/orders` in checkout | No matching POST route exists. Backend checkout is `POST /api/orders/checkout`. | Call the checkout route and send `{ user_address_id, customer_notes? }`; populate the backend cart and address first. |
| Checkout expects `checkout_url`, CAPTCHA fields, and client-provided items | Backend checkout creates an order directly from server cart/address; it does not implement this PayMongo/CAPTCHA payload or return `checkout_url`. | Align the checkout UX with the implemented order contract or agree on backend scope changes before implementing payment. |
| `POST /api/uploads` | No upload route is defined in Laravel `routes/api.php`. | Do not rely on image upload against this API until an upload endpoint is implemented and its storage/response contract is agreed. |
| Authenticated browser calls | Frontend uses a different localhost origin and backend CORS configuration is not established in the current API bootstrap. | Verify CORS in browser-based QA; a browser CORS failure is separate from an API response failure. |

The backend routes and frontend call sites were inspected on their respective feature branches on 2026-11-26. Recheck this contract after those branches change or are merged.
