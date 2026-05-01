# Frontend Report — Xatirchi-tibbiyot.uz

**Status:** Complete  
**Build:** ✅ Production build passes (329 kB JS, 25 kB CSS, gzip ~100 kB)

---

## Stack
- Vite 8 + React 19 + TailwindCSS v4 (`@tailwindcss/vite`)
- React Router v7 (client-side routing)
- Axios (JWT interceptors — auto-attach Bearer token, auto-redirect on 401)
- Lucide React (icons)
- Inter font (Google Fonts — Cyrillic/Uzbek support)

## Pages Built

| Route | Role | Description |
|---|---|---|
| `/login` | Public | Login form with show/hide password |
| `/admin` | admin | Dashboard — 4 stat cards + debtors table |
| `/admin/faculties` | admin | Faculty CRUD (add/edit/delete with confirm modal) |
| `/admin/groups` | admin | Group CRUD (assign faculty + course 1–4) |
| `/admin/students` | admin | Student CRUD + filter by faculty/group, debt badge |
| `/admin/payments` | admin | Payment entry — shows remaining debt live |
| `/director` | director | Read-only dashboard: stats, debt-by-faculty bar, student search/filter |

## Design Implemented
- Design spec from `.2d-agents/contracts/design.md` followed exactly
- Color palette: `#0D2B52` sidebar, `#1A4A8A` primary, `gray-50` bg
- Skeleton loading rows (not spinners)
- Empty states with CTA
- Confirm modals before delete
- Read-only banner on director dashboard
- Debt badges: To'langan / Qisman / Qarzdor with semantic colors
- Responsive sidebar (collapsible, mobile-ready)

## Auth
- JWT stored in `localStorage` under `token` + `user`
- Role-based route protection (`admin` / `director`)
- Auto-redirect to `/login` on 401

## API Integration
- Base URL: `VITE_API_URL` env var (default: `http://localhost:3000/api`)
- Copy `.env.example` → `.env` and set `VITE_API_URL` to backend URL

## File Structure
```
frontend/src/
  api/          axios.js, auth.js, faculties.js, groups.js, students.js, payments.js
  context/      AuthContext.jsx
  routes/       ProtectedRoute.jsx
  components/
    layout/     AppShell.jsx, Sidebar.jsx, Topbar.jsx
    ui/         Badge.jsx, Modal.jsx, StatCard.jsx, SkeletonRow.jsx, EmptyState.jsx, ReadOnlyBanner.jsx
  pages/
    Login.jsx
    admin/      Dashboard.jsx, Faculties.jsx, Groups.jsx, Students.jsx, Payments.jsx
    director/   Dashboard.jsx
```
