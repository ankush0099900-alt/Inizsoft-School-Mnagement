"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Building2,
  FileText,
  IndianRupee,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import {
  getSchoolSubscription,
  getSchoolTransactions,
  submitManualPayment,
  createOnlineOrder,
  verifyOnlinePayment,
} from "../api/school-billing.api";

export default function SchoolBillingPortal() {
  const queryClient = useQueryClient();

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // Offline Payment Form State
  const [manualForm, setManualForm] = useState({
    channel: "MANUAL_UPI",
    transactionReference: "",
    proofDocumentUrl: "",
    notes: "",
  });

  // Queries
  const { data: billingData, isLoading: loadingSub } = useQuery({
    queryKey: ["school", "billing", "subscription"],
    queryFn: getSchoolSubscription,
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ["school", "billing", "transactions"],
    queryFn: getSchoolTransactions,
  });

  // Submit Manual Payment Mutation
  const manualMutation = useMutation({
    mutationFn: submitManualPayment,
    onSuccess: () => {
      toast.success(
        "Payment details submitted successfully! Super Admin will review and activate your plan.",
      );
      queryClient.invalidateQueries({ queryKey: ["school", "billing"] });
      setOfflineModalOpen(false);
      setUpgradeModalOpen(false);
      setManualForm({
        channel: "MANUAL_UPI",
        transactionReference: "",
        proofDocumentUrl: "",
        notes: "",
      });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to submit payment details.",
      );
    },
  });

  // Online Instant Simulation Mutation
  const onlineOrderMutation = useMutation({
    mutationFn: createOnlineOrder,
    onSuccess: async (orderData) => {
      try {
        toast.info("Processing gateway checkout...");
        // Auto verify for demonstration
        await verifyOnlinePayment({
          transactionId: orderData.transactionId,
          gatewayPaymentId: `pay_${Date.now()}`,
          gatewayOrderId: orderData.orderId,
        });
        toast.success("Payment confirmed! Your subscription is now active.");
        queryClient.invalidateQueries({ queryKey: ["school", "billing"] });
        setUpgradeModalOpen(false);
      } catch (err: any) {
        toast.error("Online payment verification failed");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to start payment order");
    },
  });

  if (loadingSub) {
    return (
      <div className="py-20">
        <Loader text="Loading subscription details..." />
      </div>
    );
  }

  const subscription = billingData?.subscription;
  const currentPlan = subscription?.plan;
  const usage = billingData?.usage;
  const daysRemaining = billingData?.daysRemaining ?? 0;
  const isExpired = billingData?.isExpired;
  const availablePlans = billingData?.availablePlans ?? [];

  const handleStartUpgrade = (planId: string) => {
    setSelectedPlanId(planId);
    setUpgradeModalOpen(true);
  };

  const handleSelectPaymentMethod = (mode: "online" | "offline") => {
    if (mode === "online") {
      onlineOrderMutation.mutate({ planId: selectedPlanId });
    } else {
      setUpgradeModalOpen(false);
      setOfflineModalOpen(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "COMPLETED":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Active</Badge>;
      case "TRIAL":
        return <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30">Free Trial</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Under Review</Badge>;
      case "EXPIRED":
      case "REJECTED":
      case "FAILED":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatChannel = (channel: string) => {
    return channel.replace("MANUAL_", "").replace("ONLINE_", "").replace("_", " ");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Expiry Warning */}
      {isExpired ? (
        <div className="bg-rose-500/15 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-semibold text-sm sm:text-base">Your Subscription has Expired</p>
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                School features may be restricted. Please renew or upgrade your plan to restore full access.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white shrink-0 ml-4"
            onClick={() => {
              if (availablePlans[0]) handleStartUpgrade(availablePlans[0].id);
            }}
          >
            Renew Now
          </Button>
        </div>
      ) : daysRemaining <= 15 && daysRemaining > 0 ? (
        <div className="bg-amber-500/15 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Subscription Expiring Soon</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                You have {daysRemaining} days remaining in your current subscription.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 ml-4"
            onClick={() => {
              if (currentPlan) handleStartUpgrade(currentPlan.id);
            }}
          >
            Extend Plan
          </Button>
        </div>
      ) : null}

      {/* Main Subscription Card */}
      <Card className="border border-border/60 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Current School Plan
                </span>
                {subscription?.status && getStatusBadge(subscription.status)}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                {currentPlan?.name ?? "No Active Plan"}
                <span className="text-xl font-medium text-muted-foreground">
                  ₹{Number(currentPlan?.price ?? 0).toLocaleString("en-IN")}/yr
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {subscription?.endDate
                  ? `Valid until ${new Date(subscription.endDate).toLocaleDateString()} (${daysRemaining} days remaining)`
                  : "Please choose a subscription plan to activate your school features."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  const targetPlan = availablePlans.find((p) => p.id !== currentPlan?.id) || availablePlans[0];
                  if (targetPlan) handleStartUpgrade(targetPlan.id);
                }}
                className="gap-2 shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade / Renew Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Quota Usage Bars */}
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Resource Usage & Quotas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Students Quota */}
            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Students Limit
                </span>
                <span className="font-bold text-foreground">
                  {usage?.students.current ?? 0} / {usage?.students.max ?? 250}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    (usage?.students.percentage ?? 0) >= 90
                      ? "bg-rose-500"
                      : (usage?.students.percentage ?? 0) >= 75
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, usage?.students.percentage ?? 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>{usage?.students.percentage ?? 0}% capacity used</span>
                {(usage?.students.percentage ?? 0) >= 90 && (
                  <span className="text-rose-500 font-semibold">Near limit</span>
                )}
              </div>
            </div>

            {/* Teachers Quota */}
            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Teachers Limit
                </span>
                <span className="font-bold text-foreground">
                  {usage?.teachers.current ?? 0} / {usage?.teachers.max ?? 20}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, usage?.teachers.percentage ?? 0)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground pt-1">
                {usage?.teachers.percentage ?? 0}% capacity used
              </div>
            </div>

            {/* Admins Quota */}
            <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-sky-600" />
                  Admin Accounts
                </span>
                <span className="font-bold text-foreground">
                  {usage?.admins.current ?? 0} / {usage?.admins.max ?? 3}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-sky-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, usage?.admins.percentage ?? 0)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground pt-1">
                {usage?.admins.percentage ?? 0}% capacity used
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans Matrix */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight">Available Subscription Tiers</h2>
          <p className="text-sm text-muted-foreground">
            Upgrade your plan anytime to unlock more student capacity, teachers, and ERP features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between border transition-all ${
                  isCurrent
                    ? "border-primary shadow-md bg-primary/[0.02]"
                    : "border-border/70 hover:border-primary/50"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5 rounded-full shadow-xs">
                    Current Plan
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs min-h-[32px]">
                    {plan.description || "Comprehensive school management package"}
                  </CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-extrabold">₹{Number(plan.price).toLocaleString("en-IN")}</span>
                    <span className="text-muted-foreground text-xs"> / year</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <div className="space-y-2 border-t pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Max Students</span>
                      <strong className="text-foreground">{plan.maxStudents.toLocaleString()}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Max Teachers</span>
                      <strong className="text-foreground">{plan.maxTeachers}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">School Admins</span>
                      <strong className="text-foreground">{plan.maxAdmins}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ERP Modules Included</span>
                      <strong className="text-foreground">{plan.modules?.length ?? 17}+ modules</strong>
                    </div>
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    className="w-full"
                    onClick={() => handleStartUpgrade(plan.id)}
                  >
                    {isCurrent ? "Renew This Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transaction & Invoices History */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Subscription Billing History</CardTitle>
          <CardDescription>
            Records of all subscription payments and invoices generated for your school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTx ? (
            <div className="py-8">
              <Loader text="Loading transaction records..." />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No previous payment transactions recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Channel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Proof Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold">{tx.plan?.name}</td>
                      <td className="py-3 px-4 font-bold">
                        ₹{Number(tx.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs uppercase text-muted-foreground font-medium">
                          {formatChannel(tx.channel)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {tx.transactionReference || "Auto"}
                      </td>
                      <td className="py-3 px-4">
                        {tx.proofDocumentUrl ? (
                          <a
                            href={tx.proofDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Receipt
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Checkout Choice Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Select Payment Method</CardTitle>
              <CardDescription>
                Choose how you would like to pay for{" "}
                <strong className="text-foreground">
                  {availablePlans.find((p) => p.id === selectedPlanId)?.name}
                </strong>{" "}
                (₹{Number(availablePlans.find((p) => p.id === selectedPlanId)?.price ?? 0).toLocaleString("en-IN")})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Online Card */}
                <div
                  onClick={() => handleSelectPaymentMethod("online")}
                  className="cursor-pointer border-2 border-border hover:border-primary p-4 rounded-xl space-y-2 transition-all hover:bg-muted/40"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm">Pay Online (Instant)</h4>
                  <p className="text-xs text-muted-foreground">
                    Credit/Debit Card, NetBanking, UPI Gateway. Immediate automatic activation.
                  </p>
                </div>

                {/* Offline Card */}
                <div
                  onClick={() => handleSelectPaymentMethod("offline")}
                  className="cursor-pointer border-2 border-border hover:border-primary p-4 rounded-xl space-y-2 transition-all hover:bg-muted/40"
                >
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-sm">Direct Bank / UPI Transfer</h4>
                  <p className="text-xs text-muted-foreground">
                    NEFT / IMPS / RTGS or UPI to company account. Upload deposit slip or UTR.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setUpgradeModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Manual Bank Transfer Submission Modal */}
      {offlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Submit Bank Transfer / UPI Details</CardTitle>
              <CardDescription>
                Transfer ₹{Number(availablePlans.find((p) => p.id === selectedPlanId)?.price ?? 0).toLocaleString("en-IN")} to our official company account and submit the reference below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company Bank Account Details Box */}
              <div className="p-3.5 bg-muted/70 rounded-xl text-xs space-y-1.5 border border-border/60">
                <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  Official Bank Account Details
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <strong className="text-foreground">INIZSOFT TECHNOLOGIES PVT LTD</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <strong className="text-foreground">HDFC Bank Ltd</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <strong className="text-foreground font-mono">50200088991234</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IFSC Code:</span>
                  <strong className="text-foreground font-mono">HDFC0001234</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UPI ID:</span>
                  <strong className="text-foreground font-mono">inizsoft@hdfcbank</strong>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Payment Channel *</label>
                  <select
                    value={manualForm.channel}
                    onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background"
                  >
                    <option value="MANUAL_UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="MANUAL_BANK_TRANSFER">NEFT / RTGS / IMPS Bank Transfer</option>
                    <option value="MANUAL_CHEQUE">Demand Draft / Cheque</option>
                    <option value="MANUAL_CASH">Direct Cash Deposit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Transaction Reference / UTR Number *</label>
                  <Input
                    placeholder="e.g. 329012345678 or Bank Ref No."
                    value={manualForm.transactionReference}
                    onChange={(e) => setManualForm({ ...manualForm, transactionReference: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Proof Slip URL or Document Link (Optional)</label>
                  <Input
                    placeholder="https://... or upload link to payment receipt"
                    value={manualForm.proofDocumentUrl}
                    onChange={(e) => setManualForm({ ...manualForm, proofDocumentUrl: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Additional Notes (Optional)</label>
                  <Input
                    placeholder="e.g. Deposited from State Bank account of Principal"
                    value={manualForm.notes}
                    onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOfflineModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!manualForm.transactionReference.trim() || manualMutation.isPending}
                  onClick={() => {
                    manualMutation.mutate({
                      planId: selectedPlanId,
                      channel: manualForm.channel,
                      transactionReference: manualForm.transactionReference,
                      proofDocumentUrl: manualForm.proofDocumentUrl || undefined,
                      notes: manualForm.notes || undefined,
                    });
                  }}
                >
                  {manualMutation.isPending ? "Submitting..." : "Submit Proof for Verification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
