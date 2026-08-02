# Module: Reporting (Stage 2 slice)

**Stage:** Stage 2 (S2-6) — thin slice; full module in Stage 4  
**Status:** Done (S2-6)  
**Depends on:** Employee Management, Leave & Absence

---

## 1. Purpose

Basic operational reports for HR and company admins: headcount breakdown and absence summary. Stage 2 delivers a minimal reporting foundation; advanced analytics (Bradford Factor, turnover, exports) remain Stage 4.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `report:read` | ✅ | ✅ | — | — |

Managers may get team-scoped absence summary in Stage 4; Stage 2 is tenant-wide HR/admin only.

---

## 3. Data Model

No new collections in Stage 2. Reports are aggregation queries over existing:

- `Employee` — headcount by department, status
- `LeaveRequest` — absence days by type, period
- `Department` — join for department names

Stage 4 may add `ReportSnapshot` for precomputed nightly aggregates.

---

## 4. API Endpoints (Stage 2)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/reports/headcount` | `report:read` | Count by department and status |
| GET | `/api/v1/reports/absence-summary` | `report:read` | Leave days taken by type for date range |

### Query parameters — absence-summary

| Param | Type | Description |
|-------|------|-------------|
| `from` | date | Period start (ISO) |
| `to` | date | Period end (ISO) |
| `department` | string | Optional filter |

### Response example — headcount

```json
{
  "total": 42,
  "byDepartment": [
    { "department": "Engineering", "active": 12, "onLeave": 1, "terminated": 2 }
  ],
  "byStatus": { "active": 38, "on_leave": 2, "terminated": 2 }
}
```

---

## 5. Business Rules

1. All aggregations scoped by `tenantId` from JWT.
2. Headcount uses current employee status (point-in-time).
3. Absence summary counts approved leave days only; uses `calculateLeaveDays` logic.
4. Date range max 1 year per request.
5. No PII in export beyond names already visible to HR.

---

## 6. UI Screens & Flows

### Screen: Headcount report
- **Route:** `/dashboard/reports/headcount`
- **Access:** company_admin, hr_manager
- **Elements:** summary cards, bar chart by department (recharts), status breakdown

### Screen: Absence summary
- **Route:** `/dashboard/reports/absence`
- **Access:** company_admin, hr_manager
- **Elements:** date range picker, table by department/type, chart

### Dashboard integration
- Add quick links from dashboard to reports (optional in S2-6)

---

## 7. Notifications

None.

---

## 8. Audit & Compliance

- Report access not logged in S2-6 (read-only); consider Stage 4
- Aggregated data only — suitable for management reporting

---

## 9. Stage 2 vs Stage 4

| Feature | Stage 2 (S2-6) | Stage 4 |
|---------|----------------|---------|
| Headcount by department | ✅ | Enhanced trends |
| Absence summary | ✅ | Bradford Factor |
| Turnover rate | — | ✅ |
| CSV/PDF export | — | ✅ |
| Nightly precompute | — | ✅ |
| Custom report builder | — | ✅ |

---

## 10. Tasks Breakdown

### Backend
- [x] Headcount aggregation service
- [x] Absence summary aggregation service
- [x] Routes + RBAC
- [x] Add `report:read` permission

### Frontend
- [x] Headcount report page with recharts
- [x] Absence summary page with date filter
- [ ] Dashboard quick links (optional)

### Integration
- [x] OpenAPI + Postman

**Estimate:** 3 days (part of S2-6)

---

## 11. Open Questions

- [ ] Include pending leave in absence forecast view?
- [ ] Manager team-scoped reports in Stage 2 or Stage 4?

---

## 12. Acceptance Criteria

- [x] Headcount report matches employee directory counts
- [x] Absence summary totals match approved leave in date range
- [x] Charts render on desktop and tablet
- [x] OpenAPI and Postman updated
