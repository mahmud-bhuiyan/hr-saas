# Keka-Inspired UI Design Plan

**Purpose:** Living design spec for gradually aligning the HR SaaS web UI with patterns from [Keka](https://www.keka.com/). Update this file as new screens or details are agreed — implementation follows the doc, one phase at a time.

**Related docs:**
- [keka-platform-reference.md](./keka-platform-reference.md) — Keka product/feature benchmark (not UI)

**Platform:** Web only (responsive). No native mobile app.

**Status:** Phase 1 implemented (2026-08-03)

---

## 1. Design direction (Keka reference)

From Keka’s dashboard shell (reference screenshot, Aug 2026):

| Element | Keka pattern | Our current app |
|---------|--------------|-----------------|
| Top bar | Brand green bar; company name left; **centred global search**; notifications + avatar right | White/dark header; brand in sidebar column; **no global search**; user menu + bell + theme toggle right |
| Sub-nav tabs | Dark strip under header (`DASHBOARD`, `WELCOME`, …) | None — sidebar only |
| Sidebar | Icon + label; compact dark rail | Text nav links in light/dark sidebar |
| Dashboard hero | Full-width **welcome banner** with user’s name on textured green background | Text-only `PageHeader`: “Welcome back, {name}” |
| Search placeholder | `Search employees or actions (Ex: Apply Leave)` + keyboard hint `Alt + K` | — |

**Overall Keka feel:** Strong brand green, dark chrome, centred command palette, personal welcome on landing — HR tool that feels approachable, not spreadsheet-like.

**Our approach:** Adopt patterns incrementally. Do **not** re-skin the entire app in one pass. Each phase should ship a usable slice without breaking existing pages.

---

## 2. Phases overview

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Global search bar in header + dashboard welcome banner | ✅ Done |
| Phase 2+ | TBD — client/design details to be added later | Not started |

> **Rule:** Until a phase is marked “In development” or “Done” here, no code changes for that phase.

---

## 3. Phase 1 — Global search + dashboard welcome

**Goal:** Two Keka-inspired touches only. **Everything else stays as-is** (sidebar, colors, other pages, summary cards, quick links).

### 3.1 Global search bar (header)

#### Placement
- Add a **single search control** in the top header bar (`AppShell`), centred (or flex-grow centre) between brand/company area and the right-side actions (user menu, notifications, theme toggle).
- Visible on **all authenticated dashboard routes** (same header as today).
- Do **not** remove or relocate existing header actions in Phase 1.

#### Behaviour (v1)
Search across two result types:

| Type | Examples | On select |
|------|----------|-----------|
| **Employees** | Match by name or email (tenant-scoped, role-respecting) | Navigate to employee profile/view |
| **Actions / pages** | Static catalogue of navigable routes + common tasks the user can access | Navigate to route (or open modal if task is in-page, e.g. “Apply leave” → `/dashboard/leave`) |

**Placeholder text (match Keka intent):**
```text
Search employees or actions (Ex: Apply Leave)
```

**Keyboard shortcut (optional v1, recommended):**
- `Alt + K` (Windows/Linux) / `Option + K` (macOS) — focus search from anywhere in the app shell
- Show small hint badge in the search field when unfocused (like Keka)

#### UX pattern
- **Command-palette style:** typing opens a dropdown/popover with grouped results:
  - **Employees** — avatar/initials, name, job title or email
  - **Actions** — icon, label, optional subtitle (e.g. “Leave” → “Request time off”)
- Debounce employee API search (~250–300 ms).
- Minimum 2 characters before employee search (actions can filter locally from first character).
- Empty state: “No employees or actions found”.
- Loading state while employee query runs.
- Respect RBAC: only show employees the user may view; only show action routes allowed for their role (mirror `navItems` roles in `AppShell.tsx`).

#### Actions catalogue (initial seed — expand later)

| Label | Route | Roles (same as nav) |
|-------|-------|---------------------|
| Apply leave | `/dashboard/leave` | company_admin, hr_manager, manager, employee |
| Clock in / attendance | `/dashboard/attendance` | all except super_admin-only paths |
| My timesheet | `/dashboard/timesheets` | … |
| Submit expense | `/dashboard/expenses` | … |
| Employees | `/dashboard/employees` | company_admin, hr_manager, manager |
| Documents | `/dashboard/documents` | … |
| Reports | `/dashboard/reports` | company_admin, hr_manager |
| Settings | `/dashboard/settings` | company_admin, hr_manager |
| … | … | Derive from existing sidebar `navItems` + common task aliases |

Aliases (examples): “apply leave”, “leave request”, “time off” → Apply leave action.

#### Technical notes (for implementation)
- **New component:** e.g. `client/src/components/GlobalSearch.tsx` (or `CommandSearch.tsx`)
- **Wire in:** `client/src/components/AppShell.tsx` header row only
- **Employee search API:** Reuse existing employees list endpoint with `search` query if available; otherwise `GET /api/v1/employees?search=…` — confirm OpenAPI before coding
- **Actions list:** Static config array duplicated near nav (or shared helper with `navItems`) — no new server endpoint for Phase 1
- **Accessibility:** Combobox pattern (`role="combobox"`, arrow keys, Enter to select, Escape to close)
- **Icons:** `HiMagnifyingGlass` on input; colorful icons on action rows per project conventions

#### Out of scope (Phase 1 search)
- Recent searches / search history
- Search documents, leave requests, or payroll periods
- Full-page search results view
- Mobile-specific bottom sheet (responsive dropdown is enough for v1)
- Replacing sidebar navigation

---

### 3.2 Dashboard welcome banner

#### Placement
- **Dashboard only** (`DashboardPage`) — first visual block inside main content, **above** existing summary cards and quick links.
- Do **not** change summary cards or quick links in Phase 1.

#### Content
Personalised greeting using the logged-in user’s display name (same logic as today):

```text
Welcome {FirstName LastName}!
```

Examples:
- `Welcome Mahmudur Bhuiyan!` (when first + last name set)
- `Welcome Alex!` (first name only)
- Fallback: email local-part or “there” if no name — same as current `displayName()` helper in `DashboardPage.tsx`

#### Visual (Keka-inspired, adapt to our theme)
- Full-width **hero banner** with rounded corners (e.g. `rounded-xl`)
- Background: brand green gradient or subtle textured pattern (CSS gradient acceptable for v1; custom asset optional later)
- Text: large, bold, white — e.g. `text-2xl` or `text-3xl font-semibold`
- Padding: generous vertical padding so it reads as a hero, not a thin strip

#### Relationship to existing PageHeader
Phase 1 options (pick one at implementation time):

| Option | Description |
|--------|-------------|
| **A (recommended)** | Replace current `PageHeader` title on dashboard with the banner; keep optional short description below banner or drop “Dashboard” label for cleaner Keka-like feel |
| **B** | Keep `PageHeader` and add banner above it (may feel redundant — avoid unless client wants both) |

**Default recommendation:** Option A — banner replaces the “Welcome back, …” `PageHeader` title; retain summary cards and quick links unchanged.

#### Technical notes (for implementation)
- **New component:** e.g. `client/src/pages/dashboard/components/DashboardWelcomeBanner.tsx`
- **Data:** `useAuth()` → `user.firstName`, `user.lastName`, `user.email`
- **No new API** for Phase 1

#### Out of scope (Phase 1 dashboard)
- Keka-style sub-tabs (`DASHBOARD` / `WELCOME`)
- Company name in header (“SJ INNOVATION HR TEAM” style) — future phase
- Onboarding checklist / “Welcome” tab content
- Changing dashboard summary cards or quick links layout

---

## 4. Files likely touched (Phase 1 only)

| File | Change |
|------|--------|
| `client/src/components/AppShell.tsx` | Insert global search in header |
| `client/src/components/GlobalSearch.tsx` | **New** — search UI + logic |
| `client/src/pages/dashboard/DashboardPage.tsx` | Swap/add welcome banner |
| `client/src/pages/dashboard/components/DashboardWelcomeBanner.tsx` | **New** — hero banner |
| `client/src/utils/global-search-actions.ts` (optional) | **New** — static actions catalogue + role filter |

**No server changes required** for Phase 1 unless employee search query param is missing from the API (verify first).

**No changes** to other pages, sidebar, theme tokens, OpenAPI, or Postman for Phase 1.

---

## 5. Acceptance criteria (Phase 1)

1. User sees a search field in the top header on every dashboard page.
2. Typing finds employees (by name/email) and navigable actions filtered by role.
3. Selecting a result navigates to the correct page (or employee profile).
4. `Alt + K` focuses search (if implemented).
5. Dashboard shows a full-width welcome banner with the user’s name.
6. Summary cards and quick links on dashboard behave exactly as before.
7. Sidebar, header actions (user menu, notifications, theme toggle), and all other routes look and behave as before.

---

## 6. Future phases (placeholder)

Details to be added when client provides direction. Candidates from Keka UI (not committed):

- [ ] Header: company/tenant name beside logo (uppercase strip)
- [ ] Brand green top bar + dark sub-nav tabs
- [ ] Sidebar: icon-first compact rail
- [ ] Dashboard: separate Welcome tab vs Dashboard tab
- [ ] Employee avatar in header (replace or augment user menu)
- [ ] Global search: documents, leave requests, settings keys
- [ ] Search recents and pinned actions

---

## 7. Open questions (fill in later)

| # | Question | Decision |
|---|----------|----------|
| 1 | Show company name in header in Phase 1? | **No** — Phase 1 is search + welcome only |
| 2 | Replace or keep dashboard `PageHeader`? | TBD — lean Option A |
| 3 | Employee search: navigate to profile view or edit? | TBD — likely view page |
| 4 | Include super_admin routes in actions catalogue? | TBD — yes, role-filtered |
| 5 | Custom welcome background asset vs CSS gradient? | TBD — CSS gradient for v1 |

---

## 8. Changelog

| Date | Change |
|------|--------|
| 2026-08-03 | Phase 1 implemented — `GlobalSearch`, `DashboardWelcomeBanner`, AppShell + dashboard wired |
