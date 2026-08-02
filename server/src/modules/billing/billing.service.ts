import mongoose from 'mongoose';
import Stripe from 'stripe';
import type { ServerEnv } from '../../config/env.js';
import { loadServerEnv } from '../../config/env.js';
import { writeAuditLog } from '../audit/audit.service.js';
import { User } from '../admin/user.model.js';
import { Tenant } from '../auth/tenant.model.js';
import { Employee } from '../employees/employee.model.js';
import { createInAppNotification } from '../notifications/notification.service.js';
import { enqueueEmail } from '../notifications/notification.queue.js';
import { Subscription, type SubscriptionStatus } from './subscription.model.js';
import { StripeEvent } from './stripe-event.model.js';

export interface BillingSubscriptionPublic {
  status: SubscriptionStatus;
  seatCount: number;
  activeEmployeeCount: number;
  currentPeriodEnd?: string;
  stripeCustomerId?: string;
}

export interface BillingStatusPublic {
  billingExempt: boolean;
  hasActiveSubscription: boolean;
  subscription: BillingSubscriptionPublic | null;
}

export interface BillingSessionPublic {
  url: string;
}

export interface TenantBillingSummary {
  billingExempt: boolean;
  subscriptionStatus: SubscriptionStatus | 'exempt' | 'none';
  seatCount?: number;
}

export class BillingServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'BillingServiceError';
  }
}

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['trialing', 'active'];

const getStripe = (env: ServerEnv): Stripe => {
  if (!env.stripeSecretKey) {
    throw new BillingServiceError('Stripe is not configured', 503);
  }

  return new Stripe(env.stripeSecretKey);
};

export const countActiveEmployees = async (tenantId: string): Promise<number> => {
  return Employee.countDocuments({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: 'active',
  });
};

const mapStripeStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    default:
      return 'incomplete';
  }
};

const toBillingSubscriptionPublic = (
  subscription: {
    status: SubscriptionStatus;
    seatCount: number;
    currentPeriodEnd?: Date;
    stripeCustomerId: string;
  },
  activeEmployeeCount: number
): BillingSubscriptionPublic => ({
  status: subscription.status,
  seatCount: subscription.seatCount,
  activeEmployeeCount,
  currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
  stripeCustomerId: subscription.stripeCustomerId,
});

export const getBillingStatus = async (tenantId: string): Promise<BillingStatusPublic> => {
  const tenant = await Tenant.findById(tenantId).select('billingExempt').lean();

  if (!tenant) {
    throw new BillingServiceError('Tenant not found', 404);
  }

  const activeEmployeeCount = await countActiveEmployees(tenantId);

  if (tenant.billingExempt) {
    return {
      billingExempt: true,
      hasActiveSubscription: true,
      subscription: {
        status: 'active',
        seatCount: activeEmployeeCount,
        activeEmployeeCount,
      },
    };
  }

  const subscription = await Subscription.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  }).lean();

  if (!subscription) {
    return {
      billingExempt: false,
      hasActiveSubscription: false,
      subscription: {
        status: 'incomplete',
        seatCount: Math.max(activeEmployeeCount, 1),
        activeEmployeeCount,
      },
    };
  }

  const hasActiveSubscription = ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status);

  return {
    billingExempt: false,
    hasActiveSubscription,
    subscription: toBillingSubscriptionPublic(subscription, activeEmployeeCount),
  };
};

export const getTenantBillingSummaries = async (
  tenantIds: string[]
): Promise<Map<string, TenantBillingSummary>> => {
  const result = new Map<string, TenantBillingSummary>();

  if (tenantIds.length === 0) {
    return result;
  }

  const objectIds = tenantIds.map((id) => new mongoose.Types.ObjectId(id));

  const [tenants, subscriptions] = await Promise.all([
    Tenant.find({ _id: { $in: objectIds } }).select('_id billingExempt').lean(),
    Subscription.find({ tenantId: { $in: objectIds } }).lean(),
  ]);

  const subscriptionByTenant = new Map(
    subscriptions.map((sub) => [sub.tenantId.toString(), sub])
  );

  for (const tenant of tenants) {
    const tenantId = tenant._id.toString();

    if (tenant.billingExempt) {
      result.set(tenantId, {
        billingExempt: true,
        subscriptionStatus: 'exempt',
      });
      continue;
    }

    const subscription = subscriptionByTenant.get(tenantId);

    if (!subscription) {
      result.set(tenantId, {
        billingExempt: false,
        subscriptionStatus: 'none',
      });
      continue;
    }

    result.set(tenantId, {
      billingExempt: false,
      subscriptionStatus: subscription.status,
      seatCount: subscription.seatCount,
    });
  }

  return result;
};

const findCompanyAdmin = async (tenantId: string) => {
  return User.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: 'company_admin',
  })
    .select('_id email firstName lastName')
    .lean();
};

const notifyCompanyAdmin = async (
  tenantId: string,
  env: ServerEnv,
  options: { type: string; title: string; body: string; emailSubject: string; emailHtml: string }
): Promise<void> => {
  const admin = await findCompanyAdmin(tenantId);

  if (!admin) {
    return;
  }

  await createInAppNotification({
    tenantId,
    userId: admin._id.toString(),
    type: options.type,
    title: options.title,
    body: options.body,
  });

  await enqueueEmail(env, {
    to: admin.email,
    subject: options.emailSubject,
    text: options.body,
    html: options.emailHtml,
  });
};

const getSubscriptionPeriodEnd = (stripeSubscription: Stripe.Subscription): Date | undefined => {
  const periodEnd = (stripeSubscription as unknown as { current_period_end?: number })
    .current_period_end;

  return periodEnd ? new Date(periodEnd * 1000) : undefined;
};

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice): string | null => {
  const subscription = (invoice as unknown as {
    subscription?: string | { id: string } | null;
  }).subscription;

  if (!subscription) {
    return null;
  }

  return typeof subscription === 'string' ? subscription : subscription.id;
};

const auditActorForTenant = async (tenantId: string): Promise<string> => {
  const admin = await findCompanyAdmin(tenantId);
  return admin?._id.toString() ?? tenantId;
};

const upsertSubscriptionFromStripe = async (
  tenantId: string,
  stripeSubscription: Stripe.Subscription,
  stripeCustomerId: string
): Promise<void> => {
  const item = stripeSubscription.items.data[0];
  const seatCount = item?.quantity ?? 1;
  const status = mapStripeStatus(stripeSubscription.status);
  const currentPeriodEnd = getSubscriptionPeriodEnd(stripeSubscription);

  const before = await Subscription.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  }).lean();

  const subscription = await Subscription.findOneAndUpdate(
    { tenantId: new mongoose.Types.ObjectId(tenantId) },
    {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscription.id,
      stripeSubscriptionItemId: item?.id,
      status,
      seatCount,
      currentPeriodEnd,
    },
    { upsert: true, new: true }
  );

  const auditUserId = await auditActorForTenant(tenantId);

  void writeAuditLog({
    tenantId,
    userId: auditUserId,
    action: before ? 'update' : 'create',
    entityType: 'Subscription',
    entityId: subscription._id.toString(),
    before: before
      ? {
          status: before.status,
          seatCount: before.seatCount,
          currentPeriodEnd: before.currentPeriodEnd?.toISOString(),
        }
      : null,
    after: {
      status: subscription.status,
      seatCount: subscription.seatCount,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
    },
  });
};

export const createCheckoutSession = async (
  tenantId: string,
  env: ServerEnv,
  options?: { successUrl?: string; cancelUrl?: string }
): Promise<BillingSessionPublic> => {
  if (!env.stripePriceId) {
    throw new BillingServiceError('Stripe price is not configured', 503);
  }

  const tenant = await Tenant.findById(tenantId).lean();

  if (!tenant) {
    throw new BillingServiceError('Tenant not found', 404);
  }

  if (tenant.billingExempt) {
    throw new BillingServiceError('This company is billing exempt', 409);
  }

  const stripe = getStripe(env);
  const seatCount = Math.max(await countActiveEmployees(tenantId), 1);

  let subscription = await Subscription.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const admin = await findCompanyAdmin(tenantId);

    const customer = await stripe.customers.create({
      email: admin?.email,
      name: tenant.name,
      metadata: { tenantId },
    });

    customerId = customer.id;
  }

  const successUrl =
    options?.successUrl ?? `${env.clientUrl}/dashboard/settings/billing?checkout=success`;
  const cancelUrl =
    options?.cancelUrl ?? `${env.clientUrl}/dashboard/settings/billing?checkout=canceled`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: env.stripePriceId, quantity: seatCount }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tenantId },
    subscription_data: {
      metadata: { tenantId },
    },
  });

  if (!session.url) {
    throw new BillingServiceError('Failed to create checkout session', 500);
  }

  return { url: session.url };
};

export const createPortalSession = async (
  tenantId: string,
  env: ServerEnv,
  options?: { returnUrl?: string }
): Promise<BillingSessionPublic> => {
  const tenant = await Tenant.findById(tenantId).select('billingExempt').lean();

  if (!tenant) {
    throw new BillingServiceError('Tenant not found', 404);
  }

  if (tenant.billingExempt) {
    throw new BillingServiceError('This company is billing exempt', 409);
  }

  const subscription = await Subscription.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!subscription?.stripeCustomerId) {
    throw new BillingServiceError('No billing account found. Subscribe first.', 404);
  }

  const stripe = getStripe(env);
  const returnUrl = options?.returnUrl ?? `${env.clientUrl}/dashboard/settings/billing`;

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return { url: session.url };
};

export const syncSeatCount = async (tenantId: string, env?: ServerEnv): Promise<void> => {
  const resolvedEnv = env ?? loadServerEnv();

  if (!resolvedEnv.stripeSecretKey) {
    return;
  }

  const tenant = await Tenant.findById(tenantId).select('billingExempt').lean();

  if (!tenant || tenant.billingExempt) {
    return;
  }

  const subscription = await Subscription.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (
    !subscription?.stripeSubscriptionId ||
    !ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)
  ) {
    return;
  }

  const seatCount = Math.max(await countActiveEmployees(tenantId), 1);

  if (subscription.seatCount === seatCount) {
    return;
  }

  const stripe = getStripe(resolvedEnv);

  if (subscription.stripeSubscriptionItemId) {
    await stripe.subscriptionItems.update(subscription.stripeSubscriptionItemId, {
      quantity: seatCount,
    });
  } else {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    const itemId = stripeSubscription.items.data[0]?.id;

    if (!itemId) {
      return;
    }

    await stripe.subscriptionItems.update(itemId, { quantity: seatCount });
    subscription.stripeSubscriptionItemId = itemId;
  }

  const beforeSeatCount = subscription.seatCount;
  subscription.seatCount = seatCount;
  await subscription.save();

  const auditUserId = await auditActorForTenant(tenantId);

  void writeAuditLog({
    tenantId,
    userId: auditUserId,
    action: 'update',
    entityType: 'Subscription',
    entityId: subscription._id.toString(),
    before: { seatCount: beforeSeatCount },
    after: { seatCount },
  });
};

const resolveTenantIdFromSubscription = (
  stripeSubscription: Stripe.Subscription
): string | null => {
  return stripeSubscription.metadata?.tenantId ?? null;
};

const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
  env: ServerEnv
): Promise<void> => {
  const tenantId = session.metadata?.tenantId;

  if (!tenantId || !session.subscription || !session.customer) {
    return;
  }

  const stripe = getStripe(env);
  const stripeSubscription = await stripe.subscriptions.retrieve(String(session.subscription));
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer.id;

  await upsertSubscriptionFromStripe(tenantId, stripeSubscription, customerId);

  await notifyCompanyAdmin(tenantId, env, {
    type: 'billing.activated',
    title: 'Subscription activated',
    body: 'Your company subscription is now active.',
    emailSubject: 'HR SaaS subscription activated',
    emailHtml: '<p>Your company subscription is now active. You can manage billing from Settings → Billing.</p>',
  });
};

const handleSubscriptionUpdated = async (
  stripeSubscription: Stripe.Subscription,
  env: ServerEnv
): Promise<void> => {
  const tenantId = resolveTenantIdFromSubscription(stripeSubscription);

  if (!tenantId) {
    return;
  }

  const customerId =
    typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

  await upsertSubscriptionFromStripe(tenantId, stripeSubscription, customerId);
};

const handleSubscriptionDeleted = async (
  stripeSubscription: Stripe.Subscription
): Promise<void> => {
  const tenantId = resolveTenantIdFromSubscription(stripeSubscription);

  if (!tenantId) {
    return;
  }

  const subscription = await Subscription.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!subscription) {
    return;
  }

  const before = {
    status: subscription.status,
    seatCount: subscription.seatCount,
  };

  subscription.status = 'canceled';
  await subscription.save();

  const auditUserId = await auditActorForTenant(tenantId);

  void writeAuditLog({
    tenantId,
    userId: auditUserId,
    action: 'update',
    entityType: 'Subscription',
    entityId: subscription._id.toString(),
    before,
    after: { status: 'canceled', seatCount: subscription.seatCount },
  });
};

const handlePaymentFailed = async (
  invoice: Stripe.Invoice,
  env: ServerEnv
): Promise<void> => {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return;
  }

  const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });

  if (!subscription) {
    return;
  }

  const tenantId = subscription.tenantId.toString();
  const beforeStatus = subscription.status;
  subscription.status = 'past_due';
  await subscription.save();

  const auditUserId = await auditActorForTenant(tenantId);

  void writeAuditLog({
    tenantId,
    userId: auditUserId,
    action: 'update',
    entityType: 'Subscription',
    entityId: subscription._id.toString(),
    before: { status: beforeStatus },
    after: { status: 'past_due' },
  });

  await notifyCompanyAdmin(tenantId, env, {
    type: 'billing.payment_failed',
    title: 'Payment failed',
    body: 'Your subscription payment failed. Please update your billing details.',
    emailSubject: 'HR SaaS subscription payment failed',
    emailHtml:
      '<p>Your subscription payment failed. Please open Billing settings and update your payment method.</p>',
  });
};

export const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string | undefined,
  env: ServerEnv
): Promise<void> => {
  if (!env.stripeWebhookSecret) {
    throw new BillingServiceError('Stripe webhook secret is not configured', 503);
  }

  if (!signature) {
    throw new BillingServiceError('Missing Stripe signature', 400);
  }

  const stripe = getStripe(env);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch {
    throw new BillingServiceError('Invalid Stripe signature', 400);
  }

  const existing = await StripeEvent.findOne({ eventId: event.id }).lean();

  if (existing) {
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, env);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, env);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice, env);
      break;
    default:
      break;
  }

  await StripeEvent.create({ eventId: event.id });
};
