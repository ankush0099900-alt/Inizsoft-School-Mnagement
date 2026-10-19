import { Badge } from "@/components/ui/badge";

import type { SubscriptionOperation, TransactionStatus } from "../types/billing.types";

export function formatCurrency(amount: number | string | null | undefined, currency = "INR",): string {
  const value = Number(amount ?? 0);

  if (!Number.isFinite(value)) {
    return currency === "INR" ? "₹0" : `${currency} 0`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date?: string | null): string {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date?: string | null): string {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatChannel(channel: string): string {
  return channel
    .replace("MANUAL_", "")
    .replace("ONLINE_", "")
    .replaceAll("_", " ");
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    TRIAL: "Free Trial",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
    PENDING: "Pending",
    UNDER_REVIEW: "Under Review",
    COMPLETED: "Completed",
    FAILED: "Failed",
    REJECTED: "Rejected",
    REFUNDED: "Refunded",
  };

  return labels[status] ?? status;
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
    case "COMPLETED":
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
          {getStatusLabel(status)}
        </Badge>
      );

    case "TRIAL":
      return (
        <Badge className="border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-400">
          Free Trial
        </Badge>
      );

    case "PENDING":
    case "UNDER_REVIEW":
      return (
        <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400">
          {getStatusLabel(status)}
        </Badge>
      );

    case "EXPIRED":
    case "REJECTED":
    case "FAILED":
    case "CANCELLED":
      return (
        <Badge className="border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-400">
          {getStatusLabel(status)}
        </Badge>
      );

    case "REFUNDED":
      return <Badge variant="outline">Refunded</Badge>;

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function getOperationBadge(operation?: SubscriptionOperation | null) {
  switch (operation) {
    case "PURCHASE":
      return (
        <Badge className="border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400">
          Purchase
        </Badge>
      );
    case "RENEW":
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
          Renewal
        </Badge>
      );
    case "UPGRADE":
      return (
        <Badge className="border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-400">
          Upgrade
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Purchase
        </Badge>
      );
  }
}

export function isManualPaymentChannel(channel: string,): channel is Extract<
  import("../types/billing.types").PaymentChannel, `MANUAL_${string}`> {
  return channel.startsWith("MANUAL_");
}

export function isTransactionStatus(status: string,): status is TransactionStatus {
  return [
    "PENDING",
    "UNDER_REVIEW",
    "COMPLETED",
    "FAILED",
    "REJECTED",
    "REFUNDED",
  ].includes(status);
}