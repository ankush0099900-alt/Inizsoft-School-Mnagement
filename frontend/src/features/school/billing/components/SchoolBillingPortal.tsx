"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  useSchoolSubscription,
  useSchoolTransactions,
} from "../hooks/useSchoolBilling";

import SubscriptionBanner from "./SubscriptionBanner";
import CurrentSubscriptionCard from "./CurrentSubscriptionCard";
import SubscriptionPlans from "./SubscriptionPlans";
import TransactionHistory from "./TransactionHistory";

export default function SchoolBillingPortal() {
  const router = useRouter();

  const subscriptionQuery = useSchoolSubscription();
  const transactionsQuery = useSchoolTransactions();

  const billingData = subscriptionQuery.data;
  const transactions = transactionsQuery.data ?? [];

  const subscription = billingData?.subscription;
  const currentPlan = subscription?.plan;
  const availablePlans = billingData?.availablePlans ?? [];

  const daysRemaining = billingData?.daysRemaining ?? 0;
  const isExpired = billingData?.isExpired ?? false;

  const usage = billingData?.usage ?? {
    students: { current: 0, max: 0, percentage: 0 },
    teachers: { current: 0, max: 0, percentage: 0 },
    admins: { current: 0, max: 0, percentage: 0 },
  };

  const handleSelectPlan = (planId: string) => {
    router.push(`/school-admin/subscription/checkout?planId=${planId}`);
  };

  const handleBuySubscription = () => {
    if (availablePlans.length > 0) {
      handleSelectPlan(availablePlans[0].id);
    } else {
      toast.error("No subscription plans are currently available.");
    }
  };

  const handleRenewCurrentPlan = () => {
    if (currentPlan) {
      handleSelectPlan(currentPlan.id);
      return;
    }

    if (availablePlans[0]) {
      handleSelectPlan(availablePlans[0].id);
      return;
    }

    toast.error("No subscription plans are currently available.");
  };

  const handleUpgradePlan = () => {
    const higherPlan = availablePlans.find(
      (plan) => plan.isHigherTier || Number(plan.price) > Number(currentPlan?.price ?? 0),
    );

    if (higherPlan) {
      handleSelectPlan(higherPlan.id);
    } else {
      toast.info("No higher tier plans are currently available for upgrade.");
    }
  };

  const handleRefreshTransactions = () => {
    void transactionsQuery.refetch();
  };

  if (subscriptionQuery.isLoading) {
    return (
      <div className="py-20">
        <Loader text="Loading subscription details..." />
      </div>
    );
  }

  if (subscriptionQuery.isError || !billingData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <h2 className="text-lg font-semibold">
            Unable to load billing information
          </h2>

          <p className="max-w-md text-sm text-muted-foreground">
            We could not retrieve your school's subscription details.
            Please try again.
          </p>

          <Button
            onClick={() => void subscriptionQuery.refetch()}
            disabled={subscriptionQuery.isFetching}
          >
            {subscriptionQuery.isFetching
              ? "Retrying..."
              : "Retry"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">School Subscription & Billing</h1></div>

      <SubscriptionBanner
        isExpired={isExpired}
        daysRemaining={daysRemaining}
        onRenew={handleRenewCurrentPlan}
      />

      <CurrentSubscriptionCard
        subscription={subscription}
        usage={usage}
        daysRemaining={daysRemaining}
        availablePlans={availablePlans}
        onBuy={handleBuySubscription}
        onRenew={handleRenewCurrentPlan}
        onUpgrade={handleUpgradePlan}
      />

      <SubscriptionPlans
        plans={availablePlans}
        currentPlanId={currentPlan?.id}
        isExpired={isExpired}
        onSelectPlan={handleSelectPlan}
      />

      {transactionsQuery.isError && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Transaction history could not be loaded.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void transactionsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      <TransactionHistory
        transactions={transactions}
        isLoading={transactionsQuery.isLoading}
        isRefreshing={transactionsQuery.isFetching}
        onRefresh={handleRefreshTransactions}
      />
    </div>
  );
}