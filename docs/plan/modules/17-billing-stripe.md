# Module: Billing (Stripe)

**Stage:** Stage 2 (S2-7)  
**Status:** Done  
**Depends on:** Auth & Tenant (Stage 1), Employee Management (seat count source)

---

## 1. Purpose

Monetize the platform with per-seat Stripe subscriptions. Each tenant subscribes; active employee count drives seat quantity. Company admins manage billing via Stripe Checkout and Customer Portal.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee | super_admin |
|------------|:-------------:|:----------:|:-------:|:--------:|:-----------:|
| `billing:manage` | ✅ | — | — | — | — |
| View tenant subscription | — | — | — | — | ✅ (read-only) |

---

## 3. Data Model

### Collection: `Subscription`

```js
{
  tenantId: ObjectId,         // unique
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete',
  seatCount: Number,          // synced from active employees
  currentPeriodEnd: Date,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId }` unique, `{ stripeCustomerId }`, `{ stripeSubscriptionId }`

### Tenant field

```js
{
  billingExempt: Boolean      // default false; true for demo/staging tenants
}
```

**Relationships:** Tenant → Subscription; Employee count drives `seatCount`

---

## 4. API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/billing/status` | company_admin | Current subscription status + seat count |
| POST | `/api/v1/billing/checkout-session` | company_admin | Create Stripe Checkout session; return URL |
| POST | `/api/v1/billing/portal-session` | company_admin | Create Customer Portal session; return URL |
| POST | `/api/v1/billing/webhook` | Public (Stripe signature) | Handle Stripe events |

### Webhook events to handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/update Subscription record |
| `customer.subscription.updated` | Sync status, period end, quantity |
| `customer.subscription.deleted` | Mark canceled |
| `invoice.payment_failed` | Mark past_due; notify admin |

### Seat sync

On employee activate/deactivate (status change), call Stripe API to update subscription quantity unless `billingExempt`.

---

## 5. Business Rules

1. `billingExempt` tenants skip all payment gates (Acme Ltd demo, staging).
2. Seat count = count of employees with `status: 'active'` (exclude terminated).
3. Webhook handler must verify Stripe signature (`STRIPE_WEBHOOK_SECRET`).
4. Idempotent webhook processing — use Stripe event ID to dedupe.
5. Non-exempt tenants without active subscription: show upgrade banner; block new employee create optional (client decision — default warn only in S2-7).
6. Super admin sees subscription status on registrations/companies list (read-only).
7. Use Stripe test mode for staging; document live mode cutover.

---

## 6. UI Screens & Flows

### Screen: Billing settings
- **Route:** `/dashboard/settings/billing`
- **Access:** company_admin
- **Elements:** current plan status, seat count, "Subscribe" or "Manage subscription" button, billing history link (portal)
- **States:** no subscription, active, past_due, canceled, exempt

### Screen: Super admin companies
- **Route:** `/super-admin/companies` (enhancement)
- **Elements:** subscription status column per tenant

### User flow

```
Company admin opens billing → Subscribe → Stripe Checkout → webhook activates
→ adds employees → seat count syncs → Manage via Customer Portal
```

---

## 7. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Payment failed | company_admin | in-app + email |
| Subscription activated | company_admin | in-app + email |

---

## 8. Audit & Compliance

- Log subscription status changes in audit log (entityType: Subscription)
- Do not store card details — Stripe handles PCI
- Invoice data lives in Stripe; link to portal for downloads

---

## 9. Stage 1 vs Stage 2

| Feature | Stage 1 | Stage 2 |
|---------|--------|---------|
| Stripe billing | — | ✅ |
| Free demo tenants | ✅ | ✅ via billingExempt |
| Usage-based tiers | — | Future |

---

## 10. Tasks Breakdown

### Backend
- [x] Subscription model + indexes
- [x] Stripe SDK integration
- [x] Checkout + portal session endpoints
- [x] Webhook handler with signature verify
- [x] Seat sync on employee status change
- [x] `billingExempt` on Tenant
- [x] Routes + RBAC

### Frontend
- [x] Billing settings page
- [x] Redirect to Checkout / Portal
- [x] Subscription status on super admin companies table

### Integration
- [x] Env vars in server/.env.example
- [ ] Stripe test webhook via CLI for local dev
- [x] OpenAPI + Postman

**Estimate:** 7–10 days

---

## 11. Open Questions

- [ ] Hard block vs soft warn when subscription inactive?
- [ ] Free trial period length?
- [ ] Annual vs monthly price IDs?

---

## 12. Acceptance Criteria

- [x] Company admin can complete Checkout in Stripe test mode
- [x] Webhook updates subscription status in MongoDB
- [x] Seat count syncs when employee activated/deactivated
- [x] Demo tenant with billingExempt bypasses payment
- [x] Super admin sees subscription status per tenant
- [x] OpenAPI and Postman updated
