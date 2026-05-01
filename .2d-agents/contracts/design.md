# Design System — Xatirchi-tibbiyot.uz
**Version:** 1.0  
**Author:** Designer Agent  
**Date:** 2026-05-01

---

## 1. Brand Concept

**Feel:** Trustworthy, clear, government-grade — but modern and not heavy.  
**Metaphor:** A clean government office with a digital-first upgrade. Nothing flashy, everything purposeful.

---

## 2. Color Palette

### Primary
| Token | Hex | Usage |
|---|---|---|
| `primary-900` | `#0D2B52` | Sidebar background, primary headings |
| `primary-700` | `#1A4A8A` | Active nav items, primary buttons |
| `primary-500` | `#2563EB` | Links, focus rings, highlights |
| `primary-100` | `#DBEAFE` | Button hover backgrounds, selected row tint |
| `primary-50`  | `#EFF6FF` | Page section backgrounds |

### Neutral / Gray
| Token | Hex | Usage |
|---|---|---|
| `gray-900` | `#111827` | Body text |
| `gray-700` | `#374151` | Secondary text, labels |
| `gray-400` | `#9CA3AF` | Placeholder text, disabled |
| `gray-200` | `#E5E7EB` | Borders, dividers |
| `gray-100` | `#F3F4F6` | Table row alternating, input bg |
| `gray-50`  | `#F9FAFB` | Page background |
| `white`    | `#FFFFFF` | Card surfaces, sidebar text on dark |

### Semantic / Status
| Token | Hex | Usage |
|---|---|---|
| `success-600` | `#16A34A` | Paid in full badge |
| `success-100` | `#DCFCE7` | Paid badge background |
| `warning-600` | `#D97706` | Partial payment badge |
| `warning-100` | `#FEF3C7` | Partial badge background |
| `danger-600`  | `#DC2626` | Debt / overdue badge |
| `danger-100`  | `#FEE2E2` | Debt badge background |
| `info-600`    | `#0891B2` | Director read-only indicator |
| `info-100`    | `#CFFAFE` | Info badge background |

---

## 3. Typography

**Font Stack:**  
- Primary: `Inter` (Google Fonts — clean, excellent Cyrillic support for Uzbek)  
- Fallback: `ui-sans-serif, system-ui, -apple-system, sans-serif`

**Tailwind config:**
```js
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
}
```

### Type Scale
| Role | Size | Weight | Line Height | Token |
|---|---|---|---|---|
| Page title | 24px / 1.5rem | 700 | 1.3 | `text-2xl font-bold` |
| Section heading | 18px / 1.125rem | 600 | 1.4 | `text-lg font-semibold` |
| Card title | 16px / 1rem | 600 | 1.4 | `text-base font-semibold` |
| Body / table | 14px / 0.875rem | 400 | 1.5 | `text-sm` |
| Label / helper | 12px / 0.75rem | 500 | 1.5 | `text-xs font-medium` |
| Stat number (large) | 32px / 2rem | 700 | 1.2 | `text-3xl font-bold` |

---

## 4. Spacing Scale

Use Tailwind's default 4px base. Key values:

| Token | Value | Common use |
|---|---|---|
| `p-2` / `gap-2` | 8px | Tight inner padding (badges, chips) |
| `p-4` / `gap-4` | 16px | Card inner padding, form fields |
| `p-6` / `gap-6` | 24px | Card outer padding, section gaps |
| `p-8` | 32px | Page-level horizontal padding |
| `gap-8` | 32px | Main grid columns |

---

## 5. Layout

### Shell
```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed)  │  MAIN CONTENT (flex-1)    │
│  bg: primary-900        │  bg: gray-50              │
│  text: white            │                           │
│  ─────────────────────  │  ┌─ TOPBAR (56px) ──────┐ │
│  Logo + App name        │  │ Breadcrumb  |  User   │ │
│  ─────────────────────  │  └───────────────────────┘ │
│  Nav items              │                           │
│  (icon + label)         │  ┌─ PAGE CONTENT ───────┐ │
│                         │  │  p-6 or p-8           │ │
│  ─────────────────────  │  └───────────────────────┘ │
│  User info (bottom)     │                           │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- `< 768px`: Sidebar collapses to icon-only or bottom nav (mobile)
- `768px – 1024px`: Sidebar icon-only (64px), labels hidden
- `> 1024px`: Full sidebar (240px)

---

## 6. Component Styles

### 6.1 Sidebar Navigation

```
Active item:   bg-primary-700  text-white  rounded-lg  font-medium
Hover item:    bg-primary-800  text-white  rounded-lg
Inactive item: text-primary-200  hover:text-white
Icon size:     20px (w-5 h-5)
Item padding:  px-3 py-2.5
```

### 6.2 Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-primary-700 hover:bg-primary-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors` |
| Secondary | `bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm` |
| Danger | `bg-danger-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm` |
| Ghost | `text-primary-600 hover:bg-primary-50 font-medium px-3 py-2 rounded-lg text-sm` |
| Icon | `p-2 rounded-lg hover:bg-gray-100 text-gray-500` |

**Size modifiers:**
- SM: `px-3 py-1.5 text-xs`
- MD (default): `px-4 py-2 text-sm`
- LG: `px-5 py-2.5 text-base`

### 6.3 Cards

```
bg-white rounded-xl border border-gray-200 shadow-sm p-6
```

**Stat card (director dashboard):**
```
bg-white rounded-xl border border-gray-200 p-6
  ├── Icon block: w-12 h-12 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center
  ├── Label: text-xs font-medium text-gray-500 uppercase tracking-wide
  ├── Value: text-3xl font-bold text-gray-900
  └── Sub-label: text-sm text-gray-500
```

### 6.4 Form Inputs

```
border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900
bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
placeholder:text-gray-400
```

**Label:** `text-sm font-medium text-gray-700 mb-1 block`  
**Error state:** `border-danger-600 focus:ring-danger-600`  
**Helper text:** `text-xs text-gray-400 mt-1`

**Select:** Same as input + `appearance-none` with custom chevron icon

### 6.5 Tables

```
Table wrapper: bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden

Header row:    bg-gray-50 border-b border-gray-200
Header cell:   text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3

Body row:      border-b border-gray-100 hover:bg-primary-50 transition-colors
Body cell:     text-sm text-gray-700 px-4 py-3.5

Last row:      no border-b
```

### 6.6 Debt / Payment Badges

```
Base: inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
```

| Status | Classes |
|---|---|
| To'langan (Paid) | `bg-success-100 text-success-600` |
| Qisman (Partial) | `bg-warning-100 text-warning-600` |
| Qarzdor (Debt) | `bg-danger-100 text-danger-600` |
| Kutilmoqda | `bg-gray-100 text-gray-600` |

### 6.7 Director "Read-Only" Banner

```
bg-info-100 border border-info-200 text-info-600 rounded-lg px-4 py-2 text-sm font-medium
```
Text: `"Ko'rish rejimi — o'zgartirish mumkin emas"`  
Position: top of every admin-only page when logged in as director.

### 6.8 Modal / Dialog

```
Overlay:   fixed inset-0 bg-black/40 backdrop-blur-sm z-50
Container: bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6
Header:    text-lg font-semibold text-gray-900 mb-4
Footer:    flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100
```

### 6.9 Topbar

```
h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between
Breadcrumb: text-sm text-gray-500 > text-gray-900 font-medium
Avatar: w-8 h-8 rounded-full bg-primary-700 text-white text-xs font-bold
```

---

## 7. Iconography

Use **Lucide React** (`lucide-react`) — consistent, lightweight, Tailwind-friendly.

| Context | Icon |
|---|---|
| Faculties / yo'nalish | `GraduationCap` |
| Groups / guruhlar | `Users` |
| Students | `User` |
| Payments / to'lovlar | `CreditCard` |
| Dashboard / analytics | `LayoutDashboard` |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Search | `Search` |
| Filter | `Filter` |
| Logout | `LogOut` |
| Alert / debt | `AlertCircle` |
| Check / paid | `CheckCircle2` |

---

## 8. Dashboard Wireframe Descriptions

### 8.1 Admin Dashboard
- Left sidebar (240px, `primary-900`): Logo top, nav links with icons, user block bottom
- Topbar: Breadcrumb left, notification bell + avatar right
- Content area: 
  - Row 1: 4 stat cards — Total Students, Total Contract Revenue, Total Collected, Total Debt
  - Row 2: Table of recent students with debt status badges
  - Quick action buttons: "+ Talaba qo'shish", "+ Guruh qo'shish"

### 8.2 Director Dashboard (read-only)
- Same layout, but:
  - No add/edit/delete buttons
  - Read-only banner visible at top
  - Extra analytics card: Debt by Faculty (simple bar or list)
  - Stat cards emphasize collection rate as a percentage

---

## 9. Elevation / Shadows

| Level | Token | Use |
|---|---|---|
| 0 | `shadow-none` | Flat cards in tables |
| 1 | `shadow-sm` | Default cards |
| 2 | `shadow-md` | Hover state, dropdowns |
| 3 | `shadow-xl` | Modals, drawer overlays |

---

## 10. Border Radius

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 4px | Badges, chips |
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards |
| `rounded-2xl` | 16px | Modals |
| `rounded-full` | 9999px | Avatars, pill badges |

---

## 11. Tailwind Config Additions

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#2563EB',
          700: '#1A4A8A',
          800: '#153D75',
          900: '#0D2B52',
        },
        success: { 100: '#DCFCE7', 600: '#16A34A' },
        warning: { 100: '#FEF3C7', 600: '#D97706' },
        danger:  { 100: '#FEE2E2', 600: '#DC2626' },
        info:    { 100: '#CFFAFE', 200: '#A5F3FC', 600: '#0891B2' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

---

## 12. Key UX Decisions

1. **Debt is always visible** — debt column never hidden, always has color badge.
2. **Pagination on all tables** — 20 rows default, no infinite scroll (director prints reports).
3. **Search is always prominent** — full-width search bar above every table.
4. **Confirm before delete** — modal with `type-to-confirm` for bulk deletes.
5. **Empty states** — every table shows an illustrated empty state with CTA.
6. **Loading skeletons** — not spinners; skeleton rows maintain layout stability.
