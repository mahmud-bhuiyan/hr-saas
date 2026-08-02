# Module: Document Storage

**Stage:** Stage 1  
**Status:** Ready for review  
**Depends on:** Auth & Tenant (Step 2), Employee Management (Step 4)

---

## 1. Purpose

HR teams store contracts, IDs, certifications, and other files per employee or at company level. Files live in S3-compatible storage; MongoDB holds metadata only. Supports optional expiry dates for right-to-work and certification tracking.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `document:manage` | ✅ | ✅ | — | — |
| `document:read:own` | ✅ | ✅ | — | ✅ |

---

## 3. Data Model

### Collection: `HrDocument`

```js
{
  tenantId: ObjectId,
  employeeId: ObjectId | null,  // null = company-wide
  category: 'contract' | 'id' | 'certification' | 'other',
  fileKey: String,              // S3 object key
  fileName: String,
  mimeType: String,
  fileSize: Number,
  uploadedBy: ObjectId,
  expiryDate: Date | null,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId, employeeId, category }`, `{ tenantId, expiryDate }`

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/documents` | scoped | List documents |
| POST | `/api/v1/documents/presign` | manage / read:own | Presigned upload URL |
| POST | `/api/v1/documents` | manage / read:own | Save metadata after upload |
| GET | `/api/v1/documents/expiring` | `document:manage` | Expiring within N days |
| GET | `/api/v1/documents/:id` | scoped | Get one |
| GET | `/api/v1/documents/:id/download` | scoped | Presigned download URL |
| DELETE | `/api/v1/documents/:id` | `document:manage` | Delete file + metadata |

---

## 5. Business Rules

1. Upload flow: presign → PUT to S3 → create metadata (verifies object exists).
2. File key is tenant-scoped: `{tenantId}/documents/{uuid}/{fileName}`.
3. Allowed types: PDF, images, Word, Excel; max 10 MB.
4. Employees may only list/download/upload to their own employee folder.
5. HR/admin may upload to any employee or company-wide (no employeeId).

---

## 6. UI Screens & Flows

### Screen: Documents
- **Route:** `/dashboard/documents`
- **Access:** company_admin, hr_manager, employee
- **Elements:** list, category/employee filters, upload modal, expiring tab (HR)
- **States:** loading, empty, error

---

## 7. Stage 1 vs Later

| Feature | Stage 1 | Later |
|---------|--------|-------|
| Upload/download | ✅ | |
| Categories | ✅ | |
| Optional expiry | ✅ | |
| Expiry reminder emails | — | Stage 2 |
| Audit log UI | — | Stage 2 |

---

## 8. Acceptance Criteria

- [x] HR uploads PDF to employee folder; employee can download own file
- [x] Permission checks on list, download, delete
- [x] Expiring documents tab for HR
- [x] OpenAPI + Postman updated

**Estimate:** 5–7 days
