import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  HiArrowTopRightOnSquare,
  HiCreditCard,
  HiSignal,
  HiUserGroup,
} from "react-icons/hi2";
import { Navigate, useSearchParams } from "react-router-dom";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { toast } from "react-toastify";
import { Button } from "../../../../components/ui/Button";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ApiError,
  createBillingCheckoutSession,
  createBillingPortalSession,
  fetchBillingStatus,
} from "../../../../lib/api";
import type { SubscriptionStatus } from "../../../../types";

const statusLabels: Record<SubscriptionStatus, string> = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  incomplete: "Not subscribed",
};

const statusTone: Record<SubscriptionStatus, string> = {
  trialing: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/15",
  active: "text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-500/15",
  past_due: "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/15",
  canceled: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
  incomplete:
    "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/15",
};

const formatDate = (iso?: string): string => {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const BillingPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const canManage = user?.role === "company_admin";

  const billingQuery = useQuery({
    queryKey: ["billing", "status"],
    queryFn: fetchBillingStatus,
    enabled: Boolean(canManage),
  });

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast.success("Subscription updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
      setSearchParams({}, { replace: true });
    } else if (checkout === "canceled") {
      toast.info("Checkout canceled");
      setSearchParams({}, { replace: true });
    }
  }, [queryClient, searchParams, setSearchParams]);

  const checkoutMutation = useMutation({
    mutationFn: createBillingCheckoutSession,
    onSuccess: (session) => {
      window.location.href = session.url;
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to start checkout",
      );
    },
  });

  const portalMutation = useMutation({
    mutationFn: createBillingPortalSession,
    onSuccess: (session) => {
      window.location.href = session.url;
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to open billing portal",
      );
    },
  });

  if (!canManage) {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  const billing = billingQuery.data;
  const subscription = billing?.subscription;
  const status = subscription?.status ?? "incomplete";
  const isExempt = billing?.billingExempt ?? false;
  const hasActive = billing?.hasActiveSubscription ?? false;
  const showSubscribe = !isExempt && !hasActive;
  const showManage = !isExempt && hasActive;

  return (
    <PageContainer>
      <SettingsPageHeader
        title="Billing"
        description="Manage your per-seat subscription. Seat count syncs with active employees."
      />

      {billingQuery.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          Failed to load billing status.
        </p>
      )}

      <div className="card-surface space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Plan status
            </p>
            <div className="mt-2 flex items-center gap-2">
              <HiSignal className="h-5 w-5 text-brand-600" />
              {isExempt ? (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Billing exempt
                </span>
              ) : (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusTone[status]}`}
                >
                  {statusLabels[status]}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {showSubscribe && (
              <Button
                loading={checkoutMutation.isPending}
                loadingText="Redirecting…"
                icon={<HiCreditCard className="h-4 w-4 text-white" />}
                onClick={() => checkoutMutation.mutate()}
              >
                Subscribe
              </Button>
            )}
            {showManage && (
              <Button
                variant="secondary"
                loading={portalMutation.isPending}
                loadingText="Opening…"
                icon={
                  <HiArrowTopRightOnSquare className="h-4 w-4 text-brand-600" />
                }
                onClick={() => portalMutation.mutate()}
              >
                Manage subscription
              </Button>
            )}
          </div>
        </div>

        {!hasActive && !isExempt && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Your company does not have an active subscription. You can continue
            using the product, but subscribe to enable billing for production
            use.
          </p>
        )}

        {isExempt && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
            This demo or staging company is exempt from billing. No payment is
            required.
          </p>
        )}

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <HiUserGroup className="h-4 w-4 text-brand-600" />
              Active employees
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {subscription?.activeEmployeeCount ?? "—"}
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <HiCreditCard className="h-4 w-4 text-brand-600" />
              Billed seats
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {subscription?.seatCount ?? "—"}
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 sm:col-span-2 dark:border-slate-700">
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              Current period ends
            </dt>
            <dd className="mt-2 text-base font-medium text-slate-900 dark:text-slate-100">
              {isExempt
                ? "N/A (exempt)"
                : formatDate(subscription?.currentPeriodEnd)}
            </dd>
          </div>
        </dl>
      </div>
    </PageContainer>
  );
};
