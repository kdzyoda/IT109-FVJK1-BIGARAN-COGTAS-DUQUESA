# PaddlerGo

Campus food ordering system. This repository covers the **User Authentication & REST API Implementation** activity: registration, login, Regex validation and role-based access control.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (TypeScript) + Tailwind CSS + shadcn UI |
| Backend | Laravel (PHP) REST API |
| Database | MySQL |

## Team

- Duquesa: repository owner and lead backend developer
- Cogtas: frontend developer
- Bigaran: REST API integration and QA

## Structure

```
backend/    Laravel REST API
frontend/   Next.js app
docs/api-documentation.md   API contract
```

## Roles

`customer` (default for public registration), `vendor`, `runner`, `admin`.
The role is assigned by the backend and is never sent from the registration form.

## Run the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. In `frontend/src/lib/api.ts`, `USE_MOCK = true` uses a fake API. Set it to `false` to call the real Laravel API.

## Run the backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## Environment variables (no secret values here)

| File | Variable | Purpose |
|------|----------|---------|
| frontend/.env.local | NEXT_PUBLIC_API_BASE_URL | Laravel base URL, for example http://127.0.0.1:8000 |
| backend/.env | DB_DATABASE, DB_USERNAME, DB_PASSWORD | MySQL connection |

Never commit `.env` files, database passwords or tokens.

## API endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/register | Public |
| POST | /api/login | Public |
| POST | /api/logout | Authenticated |
| GET | /api/user | Authenticated |
| GET | /api/customer/dashboard | Customer only |
| GET | /api/vendor/dashboard | Vendor only |
| GET | /api/runner/dashboard | Runner only |
| GET | /api/admin/dashboard | Admin only |

## Branches

- `main`: stable, merged by Duquesa only
- `feature/backend-auth-duquesa`
- `feature/frontend-nextjs-cogtas`
- `feature/api-integration-bigaran`