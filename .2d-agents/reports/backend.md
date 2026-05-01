# Backend Report — Xatirchi-tibbiyot.uz

## Status: Complete

## What was built

Node.js + Express + PostgreSQL REST API at `backend/`.

### File layout
```
backend/
  src/
    config/db.js          — pg Pool setup
    middleware/
      auth.js             — JWT Bearer verification
      roleCheck.js        — requireRole() guard
    routes/
      auth.js             — POST /auth/login, POST /auth/register
      faculties.js        — CRUD /faculties
      groups.js           — CRUD /groups (filter by faculty/course)
      students.js         — CRUD /students (search, pagination)
      payments.js         — POST + GET /students/:id/payment(s)
    db/
      migrate.js          — migration runner
      migrations/
        001_init.sql      — all tables + triggers
    server.js             — Express app entry point
  .env.example
  package.json
```

### Key decisions
- **debt** is a PostgreSQL `GENERATED ALWAYS AS (contract_total - contract_paid) STORED` column — never stale, never computed in JS.
- **Payments** run inside a transaction with `FOR UPDATE` lock to prevent race conditions on concurrent top-ups.
- **Parameterized queries** everywhere — no string interpolation.
- **bcrypt** rounds from env (`BCRYPT_ROUNDS`), defaulting to 12.
- JWT expiry configurable via `JWT_EXPIRES_IN` env.
- Pagination on `/students`: page + limit query params, returns `meta.total/pages`.
- Proper FK constraint errors mapped to 409/400 responses (not 500).

### How to run
```bash
cp .env.example .env   # fill in DB credentials & JWT_SECRET
npm install
npm run migrate        # creates tables
npm start
```

## API contract
See `.2d-agents/contracts/backend-api.md` — ready for Frontend to consume.
