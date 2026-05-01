# QA Report — Xatirchi-tibbiyot.uz
**Date:** 2026-05-01  
**Reviewed by:** QA Engineer (static analysis + code walkthrough)

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical (blocker) | 2 | Must fix before any manual testing |
| Medium | 2 | Fix before release |
| Security | 2 | Fix before prod deploy |
| Minor / UX | 1 | Fix before release |

The app **cannot be functionally tested end-to-end** until BUG-1 and BUG-2 are resolved.

---

## Bugs Found

---

### BUG-1 — CRITICAL: API base URL mismatch (all calls will 404)

**File:** `frontend/src/api/axios.js:4` and `frontend/.env.example:1`

**Problem:**  
The Axios client is configured with base URL `http://localhost:3000/api` (the `/api` path prefix). The backend mounts all routes directly at `/` with no `/api` prefix (`/auth`, `/faculties`, `/groups`, `/students`, `/payments`).

Every frontend API call resolves to e.g. `http://localhost:3000/api/students` — the backend returns 404 for all of them.

**Evidence:**
```js
// axios.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// .env.example
VITE_API_URL=http://localhost:3000/api

// server.js — no /api prefix anywhere
app.use('/auth', authRouter);
app.use('/students', studentsRouter);
```

**Fix — Option A (recommended — change frontend):**  
Change the fallback in `axios.js` to `http://localhost:3000` and update `.env.example` to `VITE_API_URL=http://localhost:3000`.

**Fix — Option B (change backend):**  
Mount all routes under `/api` in `server.js`:
```js
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
// etc.
```

---

### BUG-2 — CRITICAL: Payment creation calls a non-existent endpoint

**File:** `frontend/src/api/payments.js:4` and `frontend/src/pages/admin/Payments.jsx:57-58`

**Problem:**  
The frontend creates a payment by calling `POST /payments` with body `{ student_id, amount }`.  
The backend has **no** `POST /payments` endpoint — it only has `POST /students/:id/payment` (student ID in the URL path, not the body).

The top-level `paymentsTopRouter` only handles `GET /payments`. The `POST /payments` call will return 404.

**Evidence:**
```js
// api/payments.js
export const createPayment = (data) => api.post('/payments', data)

// Payments.jsx:57
await createPayment({ student_id: Number(form.student_id), amount: Number(form.amount) })

// payments.js (backend) — topRouter only has:
topRouter.get('/', async (req, res) => { ... });   // ← GET only, no POST
// Actual create endpoint is:
router.post('/:id/payment', requireRole('admin'), ...)   // ← POST /students/:id/payment
```

**Fix:**  
Change `createPayment` in `frontend/src/api/payments.js`:
```js
// Before:
export const createPayment = (data) => api.post('/payments', data)

// After:
export const createPayment = ({ student_id, amount, note }) =>
  api.post(`/students/${student_id}/payment`, { amount, note })
```

---

### BUG-3 — MEDIUM: `contract_paid` is editable in Student form but silently ignored by backend

**Files:** `frontend/src/pages/admin/Students.jsx:23,279-287` and `backend/src/routes/students.js:106-125,129-153`

**Problem:**  
The "Talaba qo'shish/tahrirlash" modal shows a "To'langan summa" input field. The form sends `contract_paid` in the POST/PUT body. However, the backend silently ignores it:
- `POST /students` always sets `contract_paid = 0`
- `PUT /students/:id` never updates `contract_paid`

An admin editing a student will believe they can adjust the paid amount, but the field has no effect. This is a data integrity risk and a UX confusion.

**Fix:**  
Remove the `contract_paid` input field from the student add/edit form. `contract_paid` is only changed through the payments workflow (`POST /students/:id/payment`). The backend is correct; the frontend form is wrong.

---

### BUG-4 — MEDIUM: Payments list resolves student names via local lookup (breaks with >50 students)

**File:** `frontend/src/pages/admin/Payments.jsx:67,138`

**Problem:**  
The payments list calls `getStudentName(payment.student_id)` which does a `.find()` against the locally loaded students array. The `getStudents()` call has no pagination params — it defaults to `limit=50`. If the college has more than 50 students, any payment whose student falls outside the first page will show `—` as the name.

`GET /payments` already returns `student_name` in each payment record from the backend JOIN. The local lookup is redundant and fragile.

**Evidence:**
```js
// Payments.jsx:67
const getStudentName = (id) => students.find((s) => s.id === id)?.full_name || '—'
// ...used in row:
{getStudentName(payment.student_id)}

// But backend returns (payments.js:42):
s.full_name AS student_name
```

**Fix:**  
Replace `{getStudentName(payment.student_id)}` with `{payment.student_name}` and remove the `getStudents()` call from `load()` (the payments list no longer needs it — the student dropdown in the modal still needs it, so keep that fetch but only for the modal).

---

### BUG-5 — SECURITY: `/auth/register` is unauthenticated — anyone can create admin accounts

**File:** `backend/src/routes/auth.js:49-77`

**Problem:**  
`POST /auth/register` accepts `{ username, password, role }` with no authentication or authorization check. Any unauthenticated caller can create an `admin` or `director` account. The comment in the code says "protect at nginx level in prod" but there is no nginx config in this repo and no route-level guard either.

**Fix:**  
Add auth + admin-only middleware to the register route:
```js
router.post('/register', authenticate, requireRole('admin'), async (req, res) => {
```

---

### BUG-6 — SECURITY: CORS wildcard allows any origin

**File:** `backend/src/server.js:17`

**Problem:**  
`app.use(cors())` with no configuration allows any domain to send credentialed requests to the API.

**Fix:**  
Restrict to known origins via environment variable:
```js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```
Add `CORS_ORIGIN` to `.env.example`.

---

### BUG-7 — MINOR/UX: `max` attribute removed for fully-paid students in payment modal

**File:** `frontend/src/pages/admin/Payments.jsx:217`

**Problem:**  
The amount input uses `max={remainingDebt || undefined}`. When `remainingDebt === 0` (student fully paid), the expression evaluates to `undefined` (because `0` is falsy), so the HTML `max` attribute is removed. The user can type any amount; the backend will reject it with a 400, but the frontend shows only the generic "To'lov qo'shishda xatolik yuz berdi" error — no helpful message.

**Fix:**  
Change to `max={remainingDebt !== null ? remainingDebt : undefined}`. Also add a guard in `handleSave` to show an inline message if `remainingDebt === 0`.

---

## Test Coverage Assessment

No automated tests exist in either `backend/` or `frontend/`. The backend has no `test` script in `package.json`. Recommend adding at a minimum:

| Test area | Priority |
|-----------|----------|
| `POST /auth/login` (valid, invalid, missing fields) | High |
| `POST /students/:id/payment` (happy path, overpayment, 404) | High |
| Director cannot POST/PUT/DELETE (403 check) | High |
| CRUD happy paths for faculties/groups/students | Medium |
| `contract_paid` never updated via PUT /students | Medium |

---

## Checklist Against PM Requirements

| Requirement | Result |
|-------------|--------|
| Login — admin role | Code correct; blocked by BUG-1 |
| Login — director role | Code correct; blocked by BUG-1 |
| CRUD faculties (admin) | Code correct; blocked by BUG-1 |
| CRUD groups (admin) | Code correct; blocked by BUG-1 |
| CRUD students (admin) | Partially — BUG-3 (contract_paid misleading) |
| Payment entry + debt auto-calc | Backend: correct (transaction + generated column). Frontend: BUG-2 blocks creation |
| Director cannot edit data | Correctly enforced: route guards (backend 403) + ProtectedRoute redirect + no edit buttons in Director dashboard |
| Debt color badges | Implemented in `Badge.jsx` / `DebtBadge` |

---

## Recommended Fix Order

1. **BUG-1** — fix base URL (5 min, unblocks everything)
2. **BUG-2** — fix payment API call (5 min, unblocks payment feature)
3. **BUG-5** — protect `/auth/register` (10 min, security)
4. **BUG-3** — remove `contract_paid` from student form (15 min, avoids user confusion)
5. **BUG-4** — use `payment.student_name` directly (5 min)
6. **BUG-6** — restrict CORS origin (5 min)
7. **BUG-7** — fix `max` attribute logic (5 min)
