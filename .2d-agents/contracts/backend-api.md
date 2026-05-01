# Backend API Contract — Xatirchi-tibbiyot.uz

Base URL: `http://localhost:3000`  
Auth: Bearer JWT in `Authorization` header (all routes except `/auth/login`).

---

## Auth

### POST /auth/login
**Body:** `{ "username": "...", "password": "..." }`  
**Response 200:** `{ "token": "<jwt>", "user": { "id", "username", "role" } }`  
Roles: `admin` | `director`

### POST /auth/register *(admin only — no route guard yet, protect at nginx level in prod)*
**Body:** `{ "username", "password", "role" }`  
**Response 201:** `{ "user": { "id", "username", "role" } }`

---

## Faculties

| Method | Path | Roles |
|--------|------|-------|
| GET | /faculties | all |
| GET | /faculties/:id | all |
| POST | /faculties | admin |
| PUT | /faculties/:id | admin |
| DELETE | /faculties/:id | admin |

**Faculty object:**
```json
{ "id": 1, "name": "Hamshiralik", "created_at": "...", "updated_at": "..." }
```

---

## Groups

| Method | Path | Roles |
|--------|------|-------|
| GET | /groups | all |
| GET | /groups/:id | all |
| POST | /groups | admin |
| PUT | /groups/:id | admin |
| DELETE | /groups/:id | admin |

**Query params (GET /groups):** `?faculty_id=1&course=2`

**Group object:**
```json
{
  "id": 1, "name": "HM-101", "course": 1,
  "faculty_id": 1, "faculty_name": "Hamshiralik",
  "created_at": "...", "updated_at": "..."
}
```

**POST/PUT body:**
```json
{ "name": "HM-101", "faculty_id": 1, "course": 2 }
```

---

## Students

| Method | Path | Roles |
|--------|------|-------|
| GET | /students | all |
| GET | /students/:id | all |
| POST | /students | admin |
| PUT | /students/:id | admin |
| DELETE | /students/:id | admin |

**Query params (GET /students):**  
`?group_id=1&faculty_id=1&search=Ali&page=1&limit=50`

**Student object:**
```json
{
  "id": 1,
  "full_name": "Ali Valiyev",
  "group_id": 1, "group_name": "HM-101",
  "course": 1,
  "faculty_id": 1, "faculty_name": "Hamshiralik",
  "contract_total": "12000000.00",
  "contract_paid": "6000000.00",
  "debt": "6000000.00",
  "created_at": "...", "updated_at": "..."
}
```

**GET /students response:**
```json
{
  "data": [...],
  "meta": { "total": 120, "page": 1, "limit": 50, "pages": 3 }
}
```

**POST body:**
```json
{ "full_name": "Ali Valiyev", "group_id": 1, "contract_total": 12000000 }
```

---

## Payments

### POST /students/:id/payment *(admin only)*
**Body:** `{ "amount": 500000, "note": "1-yarim yillik to'lov" }`  
**Response 201:**
```json
{
  "data": {
    "id": 1, "full_name": "Ali Valiyev",
    "contract_total": "12000000.00",
    "contract_paid": "6500000.00",
    "debt": "5500000.00"
  }
}
```
Validation: `amount > 0` and `contract_paid + amount ≤ contract_total`.

### GET /students/:id/payments *(all roles)*
Returns payment audit log for the student.

---

## Error format
```json
{ "error": "Human-readable message" }
```

HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 500.
