"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  QrCode,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/common/Loader";

import {
  useManualPayment,
  useSchoolSubscription,
  useUploadPaymentSlip,
} from "../hooks/useSchoolBilling";
import type {
  ManualPaymentFormValues,
  PaymentChannel,
  SchoolPlan,
  SubscriptionOperation,
} from "../types/billing.types";
import { formatCurrency } from "../utils/billing.utils";
import { getImageUrl } from "@/lib/image-url";

const paymentChannels: {
  value: PaymentChannel;
  label: string;
}[] = [
  {
    value: "MANUAL_UPI",
    label: "UPI (Google Pay / PhonePe / Paytm)",
  },
  {
    value: "MANUAL_BANK_TRANSFER",
    label: "NEFT / RTGS / IMPS Bank Transfer",
  },
  {
    value: "MANUAL_CHEQUE",
    label: "Demand Draft / Cheque",
  },
  {
    value: "MANUAL_CASH",
    label: "Direct Cash Deposit at Office",
  },
];

export default function ManualPaymentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId") || "";

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: billingData, isLoading, isError, refetch } = useSchoolSubscription();

  const subscription = billingData?.subscription;
  const currentPlan = subscription?.plan;
  const availablePlans = billingData?.availablePlans ?? [];
  const isExpired = billingData?.isExpired ?? false;

  const paymentSettingsConfigured = billingData?.paymentSettingsConfigured ?? false;
  const paymentSettings = billingData?.paymentSettings ?? null;

  // Selected target plan
  const selectedPlan: SchoolPlan | undefined = useMemo(() => {
    if (planId) {
      const found = availablePlans.find((p) => p.id === planId);
      if (found) return found;
    }
    return currentPlan
      ? availablePlans.find((p) => p.id === currentPlan.id) || availablePlans[0]
      : availablePlans[0];
  }, [planId, availablePlans, currentPlan]);

  // Determine Operation
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

  const [form, setForm] = useState<ManualPaymentFormValues>({
    channel: "MANUAL_UPI",
    operation,
    paymentDate: todayStr,
    amount: payableAmount,
    transactionReference: "",
    proofDocumentUrl: "",
    notes: "",
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const manualPayment = useManualPayment();
  const uploadSlip = useUploadPaymentSlip();

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      operation,
      amount: payableAmount,
    }));
  }, [operation, payableAmount]);

  const updateField = <K extends keyof ManualPaymentFormValues>(
    key: K,
    value: ManualPaymentFormValues[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;

    const isAllowedType =
      file.type === "application/pdf" || file.type.startsWith("image/");

    if (!isAllowedType) {
      toast.error("Please select a valid image (JPG, PNG, WEBP) or PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Payment slip file size must not exceed 5 MB.");
      return;
    }

    uploadSlip.mutate(file, {
      onSuccess: (url) => {
        updateField("proofDocumentUrl", url);
        toast.success("Receipt proof uploaded successfully!");
      },
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!paymentSettingsConfigured || !paymentSettings) {
      toast.error(
        "Payment settings have not been configured by Super Admin yet. Please contact support.",
      );
      return;
    }

    if (!form.transactionReference.trim()) {
      toast.error("Please enter the UTR / transaction reference number.");
      return;
    }

    if (!selectedPlan) {
      toast.error("No valid subscription plan selected.");
      return;
    }

    manualPayment.mutate(
      {
        planId: selectedPlan.id,
        operation,
        paymentDate: form.paymentDate,
        channel: form.channel,
        transactionReference: form.transactionReference.trim(),
        proofDocumentUrl: form.proofDocumentUrl || undefined,
        notes: form.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.push("/school-admin/subscription");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <Loader text="Loading payment instructions..." />
      </div>
    );
  }

  if (isError || !billingData || !selectedPlan) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/60" />
          <h2 className="text-xl font-bold">Billing Details Unavailable</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            We could not retrieve subscription billing details. Please try again.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
            <Button asChild>
              <Link href="/school-admin/subscription">Back to Subscription</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isBusy = manualPayment.isPending || uploadSlip.isPending;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Navigation & Breadcrumbs */}
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
            <Link
              href={`/school-admin/subscription/checkout?planId=${selectedPlan.id}`}
              className="hover:text-foreground"
            >
              Plan Confirmation
            </Link>
            <span>/</span>
            <span className="text-foreground">Payment Submission</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Manual Payment Instructions & Submission
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Step 2 of 2
          </span>
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            {operation}
          </Badge>
        </div>
      </div>

      {/* Progress Step Bar */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <Link
          href={`/school-admin/subscription/checkout?planId=${selectedPlan.id}`}
          className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-500/15"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">
            ✓
          </div>
          <span>1. Plan Confirmation (Click to review)</span>
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 font-semibold text-primary">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
            2
          </div>
          <span>2. Offline Transfer & Submission (Active)</span>
        </div>
      </div>

      {/* Main Grid: Left = Bank & UPI Details, Right = Submission Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Official Payment Details (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Unconfigured Alert */}
          {!paymentSettingsConfigured && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-xs">
                <p className="font-semibold">Official Payment Details Not Set</p>
                <p className="mt-1">
                  Super Admin has not yet configured the official bank account or UPI details. Please contact the platform administration before completing payment.
                </p>
              </div>
            </div>
          )}

          {/* Official Bank Account Details */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Bank Account Details</CardTitle>
                  <CardDescription className="text-xs">
                    Transfer via NEFT, RTGS, or IMPS
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <span className="text-[11px] text-muted-foreground block">Beneficiary Name</span>
                <strong className="text-foreground text-sm font-semibold">
                  {paymentSettings?.beneficiaryName || "Not Configured"}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <span className="text-[11px] text-muted-foreground block">Bank Name</span>
                  <strong className="text-foreground font-semibold">
                    {paymentSettings?.bankName || "—"}
                  </strong>
                </div>

                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <span className="text-[11px] text-muted-foreground block">Account Type</span>
                  <strong className="text-foreground font-semibold">
                    {paymentSettings?.accountType || "CURRENT"}
                  </strong>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Account Number</span>
                  <strong className="text-foreground font-mono text-sm tracking-wide">
                    {paymentSettings?.accountNumber || "—"}
                  </strong>
                </div>
                {paymentSettings?.accountNumber && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => copyToClipboard(paymentSettings.accountNumber, "acc")}
                  >
                    {copiedKey === "acc" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">IFSC Code</span>
                  <strong className="text-foreground font-mono text-sm">
                    {paymentSettings?.ifscCode || "—"}
                  </strong>
                </div>
                {paymentSettings?.ifscCode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => copyToClipboard(paymentSettings.ifscCode, "ifsc")}
                  >
                    {copiedKey === "ifsc" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>

              {paymentSettings?.branchName && (
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <span className="text-[11px] text-muted-foreground block">Branch</span>
                  <span className="text-foreground">{paymentSettings.branchName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* UPI & QR Code Card */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">UPI & QR Code</CardTitle>
                  <CardDescription className="text-xs">
                    Instant transfer via UPI apps
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="rounded-lg border bg-muted/30 p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">UPI ID / VPA</span>
                  <strong className="text-foreground font-mono text-sm">
                    {paymentSettings?.upiId || "Not Configured"}
                  </strong>
                </div>
                {paymentSettings?.upiId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => copyToClipboard(paymentSettings.upiId, "upi")}
                  >
                    {copiedKey === "upi" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>

              {paymentSettings?.qrCodeUrl && (
                <div className="rounded-xl border bg-background p-3 text-center">
                  <div className="mx-auto mb-2 flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border bg-white p-2 shadow-inner">
                    <img
                      src={getImageUrl(paymentSettings.qrCodeUrl)}
                      alt="Official Payment QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    Scan with Google Pay, PhonePe, Paytm, or any BHIM UPI app
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {paymentSettings?.paymentInstructions && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-1">
              <div className="font-semibold text-primary">Instructions from Super Admin:</div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {paymentSettings.paymentInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Payment Request Submission Form (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="text-lg">Submit Payment Reference</CardTitle>
                  <CardDescription className="text-xs">
                    Enter transaction details after transferring the amount
                  </CardDescription>
                </div>

                <div className="rounded-xl border bg-muted/40 px-3 py-1.5 text-right">
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Amount Payable
                  </span>
                  <span className="text-xl font-extrabold text-foreground">
                    {formatCurrency(payableAmount, selectedPlan.currency || "INR")}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                {/* Plan Overview Pill */}
                <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Selected Subscription</span>
                    <strong className="text-foreground text-sm">{selectedPlan.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block">Operation</span>
                    <Badge variant="outline" className="text-xs">
                      {operation}
                    </Badge>
                  </div>
                </div>

                {/* Payment Channel Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="channel" className="text-xs font-semibold">
                    Payment Method / Channel *
                  </Label>
                  <select
                    id="channel"
                    value={form.channel}
                    onChange={(event) =>
                      updateField("channel", event.target.value as PaymentChannel)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {paymentChannels.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Date & Amount */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentDate" className="text-xs font-semibold">
                      Payment Date *
                    </Label>
                    <div className="relative">
                      <Input
                        id="paymentDate"
                        type="date"
                        value={form.paymentDate}
                        max={todayStr}
                        onChange={(event) => updateField("paymentDate", event.target.value)}
                        className="text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-semibold">
                      Amount Paid (₹) *
                    </Label>
                    <Input
                      id="amount"
                      type="text"
                      value={formatCurrency(payableAmount, "INR")}
                      disabled
                      className="bg-muted text-xs font-bold"
                    />
                  </div>
                </div>

                {/* UTR / Transaction Reference */}
                <div className="space-y-1.5">
                  <Label htmlFor="transactionReference" className="text-xs font-semibold">
                    UTR / Transaction Reference Number *
                  </Label>
                  <Input
                    id="transactionReference"
                    placeholder="e.g. 428912345678 or ICICR2401234567"
                    value={form.transactionReference}
                    onChange={(event) =>
                      updateField("transactionReference", event.target.value)
                    }
                    className="font-mono text-xs"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Enter the exact reference or UTR number from your banking/UPI debit confirmation.
                  </p>
                </div>

                {/* Proof Slip Upload */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Upload Payment Slip / Screenshot Proof
                  </Label>

                  {form.proofDocumentUrl ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-900 dark:text-emerald-200 truncate max-w-[220px]">
                          Receipt Uploaded Successfully
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={getImageUrl(form.proofDocumentUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-rose-600"
                          onClick={() => updateField("proofDocumentUrl", "")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center">
                      <input
                        type="file"
                        id="slipUpload"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleUpload(file);
                        }}
                      />
                      <label
                        htmlFor="slipUpload"
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {uploadSlip.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Upload className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {uploadSlip.isPending
                              ? "Uploading payment proof..."
                              : "Click to upload receipt or screenshot"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            JPG, PNG, WEBP, or PDF up to 5 MB
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold">
                    Optional Remarks / Transfer Details
                  </Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    placeholder="e.g. Transferred from HDFC Bank account ending with 4321..."
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-3 border-t sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isBusy}
                  >
                    <Link href={`/school-admin/subscription/checkout?planId=${selectedPlan.id}`}>
                      <ArrowLeft className="mr-1.5 h-4 w-4" />
                      Back to Step 1
                    </Link>
                  </Button>

                  <Button
                    type="submit"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isBusy || !paymentSettingsConfigured}
                  >
                    {manualPayment.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Payment Request...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Submit Payment Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
