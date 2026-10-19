"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  FileCheck,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/common/Loader";

import { useSchoolSubscription } from "../hooks/useSchoolBilling";
import type { SchoolPlan, SubscriptionOperation } from "../types/billing.types";
import { formatCurrency } from "../utils/billing.utils";

export default function PlanCheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId") || "";

  const { data: billingData, isLoading, isError, refetch } = useSchoolSubscription();

  const subscription = billingData?.subscription;
  const currentPlan = subscription?.plan;
  const availablePlans = billingData?.availablePlans ?? [];
  const isExpired = billingData?.isExpired ?? false;

  // Selected target plan
  const selectedPlan: SchoolPlan | undefined = useMemo(() => {
    if (planId) {
      const found = availablePlans.find((p) => p.id === planId);
      if (found) return found;
    }
    // Fallback: if user came without planId, select first available or current plan
    return currentPlan
      ? availablePlans.find((p) => p.id === currentPlan.id) || availablePlans[0]
      : availablePlans[0];
  }, [planId, availablePlans, currentPlan]);

  // Determine Operation: PURCHASE, RENEW, UPGRADE
  const operation: SubscriptionOperation = useMemo(() => {
    if (!selectedPlan || !currentPlan || isExpired || subscription?.status !== "ACTIVE") {
      return "PURCHASE";
    }
    if (selectedPlan.id === currentPlan.id) {
      return "RENEW";
    }
    if (Number(selectedPlan.price) > Number(currentPlan.price)) {
      return "UPGRADE";
    }
    return "PURCHASE";
  }, [selectedPlan, currentPlan, isExpired, subscription?.status]);

  // Determine Payable Amount
  const payableAmount = useMemo(() => {
    if (!selectedPlan) return 0;
    if (!currentPlan || isExpired || subscription?.status !== "ACTIVE") {
      return Number(selectedPlan.price);
    }
    if (selectedPlan.id === currentPlan.id) {
      return Number(selectedPlan.price);
    }
    if (Number(selectedPlan.price) > Number(currentPlan.price)) {
      if (typeof selectedPlan.upgradeDifference === "number") {
        return selectedPlan.upgradeDifference;
      }
      return Math.max(0, Number(selectedPlan.price) - Number(currentPlan.price));
    }
    return Number(selectedPlan.price);
  }, [selectedPlan, currentPlan, isExpired, subscription?.status]);

  if (isLoading) {
    return (
      <div className="py-20">
        <Loader text="Loading plan details..." />
      </div>
    );
  }

  if (isError || !billingData || !selectedPlan) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/60" />
          <h2 className="text-xl font-bold">Subscription Plan Not Found</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            The requested subscription plan could not be located or billing details are unavailable.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
            <Button asChild>
              <Link href="/school-admin/subscription">Back to Subscription Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getOperationBadge = () => {
    switch (operation) {
      case "PURCHASE":
        return (
          <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400">
            New Subscription
          </Badge>
        );
      case "RENEW":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            1-Year Renewal
          </Badge>
        );
      case "UPGRADE":
        return (
          <Badge className="border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-400">
            Tier Upgrade
          </Badge>
        );
    }
  };

  const getOperationTitle = () => {
    switch (operation) {
      case "PURCHASE":
        return `Purchase ${selectedPlan.name} Subscription`;
      case "RENEW":
        return `Renew ${selectedPlan.name} Subscription`;
      case "UPGRADE":
        return `Upgrade to ${selectedPlan.name}`;
    }
  };

  const handleProceedToPayment = () => {
    router.push(`/school-admin/subscription/payment?planId=${selectedPlan.id}`);
  };

  return (
    <div className="mx-auto max-auto space-y-6">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link
              href="/school-admin/subscription"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Subscription & Billing
            </Link>
            <span>/</span>
            <span className="text-foreground">Checkout Confirmation</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {getOperationTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Step 1 of 2
          </span>
          {getOperationBadge()}
        </div>
      </div>

      {/* Progress Step Bar */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 font-semibold text-primary">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
            1
          </div>
          <span>Plan Confirmation</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-muted-foreground">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/40 text-[10px] font-bold">
            2
          </div>
          <span>Offline Payment & Submission</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Plan Details & Limits (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Plan Specifications Card */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {operation === "UPGRADE" ? (
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Crown className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedPlan.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {selectedPlan.description || "Comprehensive School ERP package"}
                    </CardDescription>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-foreground">
                    {formatCurrency(selectedPlan.price, selectedPlan.currency || "INR")}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    / {selectedPlan.durationInDays} days
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Resource Quotas */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Included Resource Limits
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border bg-muted/30 p-3 text-center">
                    <Users className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <span className="block text-[11px] text-muted-foreground">Students</span>
                    <strong className="text-base text-foreground font-bold">
                      {selectedPlan.maxStudents.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-3 text-center">
                    <Users className="mx-auto mb-1 h-4 w-4 text-emerald-600" />
                    <span className="block text-[11px] text-muted-foreground">Teachers</span>
                    <strong className="text-base text-foreground font-bold">
                      {selectedPlan.maxTeachers}
                    </strong>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-3 text-center">
                    <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-blue-600" />
                    <span className="block text-[11px] text-muted-foreground">School Admins</span>
                    <strong className="text-base text-foreground font-bold">
                      {selectedPlan.maxAdmins}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Modules Included */}
              {selectedPlan.modules && selectedPlan.modules.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Included ERP Modules ({selectedPlan.modules.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    {selectedPlan.modules.map(({ module }) => (
                      <div
                        key={module.id}
                        className="flex items-center gap-2 rounded-lg border bg-background p-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate font-medium">{module.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upgrade Price Difference Breakdown */}
              {operation === "UPGRADE" && currentPlan && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-xs text-purple-950 dark:text-purple-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-100">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Tier Upgrade Price Calculation
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Plan ({currentPlan.name}):</span>
                      <span className="font-medium">{formatCurrency(currentPlan.price, "INR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Plan ({selectedPlan.name}):</span>
                      <span className="font-medium">{formatCurrency(selectedPlan.price, "INR")}</span>
                    </div>
                    <div className="flex justify-between border-t border-purple-400/30 pt-1 font-bold text-sm text-foreground">
                      <span>Net Payable Difference:</span>
                      <span className="text-purple-600 dark:text-purple-400">
                        {formatCurrency(payableAmount, "INR")}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    * Your existing subscription expiry date will remain unchanged. Higher limits and modules unlock upon payment verification.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policy Information Box */}
          <div className="rounded-xl border border-border/70 bg-card p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <FileCheck className="h-4 w-4 text-primary" />
              Manual Payment Process Guidelines
            </div>
            <p className="text-muted-foreground leading-relaxed">
              In Step 2, you will receive our verified Bank Account details, UPI ID, and QR code to complete the transfer via your bank portal or mobile payment app. Once transferred, submit your UTR/Reference number and upload the receipt proof for prompt Super Admin activation.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Card (1 col) */}
        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm sticky top-6">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
              <CardDescription className="text-xs">
                Review total amount due
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operation</span>
                  <span className="font-semibold">{operation}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Plan Price</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPlan.price, selectedPlan.currency || "INR")}
                  </span>
                </div>

                {operation === "UPGRADE" && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Current Tier Credit</span>
                    <span>-{formatCurrency(Number(currentPlan?.price ?? 0), "INR")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-semibold text-primary">Offline / Manual Transfer</span>
                </div>

                <div className="border-t pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-foreground">Total Payable</span>
                  <span className="text-2xl font-black text-foreground">
                    {formatCurrency(payableAmount, selectedPlan.currency || "INR")}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full gap-2 shadow-sm"
                  size="lg"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment Instructions
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/school-admin/subscription">
                    Choose a Different Plan
                  </Link>
                </Button>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground text-center">
                🔒 Safe & secure offline verification. Verified directly by Super Admin.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
