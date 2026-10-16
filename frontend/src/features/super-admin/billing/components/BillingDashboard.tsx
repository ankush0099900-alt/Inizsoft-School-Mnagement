"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IndianRupee,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import {
  getBillingStats,
  getTransactions,
  getReviewQueue,
  approveTransaction,
  rejectTransaction,
  type Transaction,
} from "../api/billing.api";

export default function BillingDashboard() {
  const queryClient = useClient();
  const [activeTab, setActiveTab] = useState<string>("queue");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Modal states for approval/rejection
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  // 1. Stats Query
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["super-admin", "billing", "stats"],
    queryFn: getBillingStats,
  });

  // 2. Review Queue Query
  const { data: reviewQueue = [], isLoading: loadingQueue } = useQuery({
    queryKey: ["super-admin", "billing", "review-queue"],
    queryFn: getReviewQueue,
  });

  // 3. All Transactions Query
  const { data: txResponse, isLoading: loadingTx } = useQuery({
    queryKey: ["super-admin", "billing", "transactions", page, search, statusFilter],
    queryFn: () =>
      getTransactions({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
  });

  const transactions = txResponse?.transactions ?? [];
  const meta = txResponse?.meta;

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      approveTransaction(id, notes),
    onSuccess: () => {
      toast.success("Payment approved and subscription activated!");
      queryClient.invalidateQueries({ queryKey: ["super-admin", "billing"] });
      setSelectedTx(null);
      setActionType(null);
      setActionNotes("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve payment");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectTransaction(id, reason),
    onSuccess: () => {
      toast.success("Payment transaction rejected");
      queryClient.invalidateQueries({ queryKey: ["super-admin", "billing"] });
      setSelectedTx(null);
      setActionType(null);
      setActionNotes("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject payment");
    },
  });

  function useClient() {
    return useQueryClient();
  }

  const handleOpenAction = (tx: Transaction, type: "approve" | "reject") => {
    setSelectedTx(tx);
    setActionType(type);
    setActionNotes("");
  };

  const handleConfirmAction = () => {
    if (!selectedTx || !actionType) return;
    if (actionType === "approve") {
      approveMutation.mutate({ id: selectedTx.id, notes: actionNotes });
    } else {
      rejectMutation.mutate({ id: selectedTx.id, reason: actionNotes });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Completed</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Pending Review</Badge>;
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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Transactions</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage subscription billing, verify offline payments, and track revenue across schools.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{Number(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From all completed subscription payments</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats?.pendingReviewsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Manual bank & UPI payments awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeSubscriptionsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Schools currently on an active plan</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalTransactionsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Processed transactions to date</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
        <TabsList className="bg-muted/70 p-1 rounded-xl ">
          <TabsTrigger value="queue" className="rounded-lg gap-2">
            <span>Pending Review Queue</span>
            {reviewQueue.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {reviewQueue.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg w-full">
            All Transactions
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Review Queue */}
        <TabsContent value="queue" className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Offline Payment Verification Queue</CardTitle>
              <CardDescription>
                Schools that submitted bank transfer or UPI proof documents. Review proof and approve to activate their subscription immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingQueue ? (
                <div className="py-12">
                  <Loader text="Loading pending queue..." />
                </div>
              ) : reviewQueue.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/60 mb-3" />
                  <h3 className="font-semibold text-lg">Verification Queue Clear</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                    There are currently no offline subscription payments waiting for approval.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                      <tr>
                        <th className="py-3 px-4">School</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Channel</th>
                        <th className="py-3 px-4">Reference / UTR</th>
                        <th className="py-3 px-4">Proof Document</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reviewQueue.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold">{tx.school?.name ?? "Unknown School"}</div>
                            <div className="text-xs text-muted-foreground">{tx.school?.code}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{tx.plan?.name}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-foreground">
                            ₹{Number(tx.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="uppercase text-[11px]">
                              {formatChannel(tx.channel)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {tx.transactionReference || "None"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {tx.proofDocumentUrl ? (
                              <a
                                href={tx.proofDocumentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View Slip
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">No doc</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 border-rose-300 hover:bg-rose-50 hover:text-rose-700 h-8 text-xs"
                                onClick={() => handleOpenAction(tx, "reject")}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                                onClick={() => handleOpenAction(tx, "approve")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Approve & Activate
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: All Transactions */}
        <TabsContent value="all" className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">All Subscription Transactions</CardTitle>
                  <CardDescription>
                    Complete ledger of all online & offline payment attempts across all schools.
                  </CardDescription>
                </div>
                {/* Search & Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search school or UTR..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 px-3 text-xs rounded-md border border-input bg-background"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTx ? (
                <div className="py-12">
                  <Loader text="Loading transactions..." />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No transactions found matching your criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">School</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Reviewed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {tx.school?.name ?? "Unknown"}
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold">
                            {tx.plan?.name}
                          </td>
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
                            {tx.transactionReference || tx.gatewayOrderId || "-"}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {tx.reviewedBy?.fullName ?? (tx.channel.startsWith("ONLINE") ? "Gateway Auto" : "-")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                  <div className="text-xs text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} ({meta.total} total)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog for Approve / Reject */}
      {selectedTx && actionType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {actionType === "approve" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Approve Payment & Activate Plan
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-rose-600" />
                    Reject Offline Payment
                  </>
                )}
              </CardTitle>
              <CardDescription>
                School: <strong className="text-foreground">{selectedTx.school?.name}</strong> | Amount:{" "}
                <strong className="text-foreground">₹{Number(selectedTx.amount).toLocaleString("en-IN")}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionType === "approve" ? (
                <p className="text-xs text-muted-foreground">
                  Approving this transaction will immediately mark this payment as completed, create an active subscription for <strong>{selectedTx.plan?.name}</strong>, and enable all plan modules for this school.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Please provide a reason for rejecting this payment (e.g. invalid UTR, payment not received in bank account).
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  {actionType === "approve" ? "Approval Notes (Optional)" : "Reason for Rejection *"}
                </label>
                <Input
                  placeholder={
                    actionType === "approve"
                      ? "e.g. Verified in ICICI Bank on 16 Oct"
                      : "e.g. UTR reference not found in bank statement"
                  }
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTx(null);
                    setActionType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className={
                    actionType === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }
                  disabled={
                    approveMutation.isPending ||
                    rejectMutation.isPending ||
                    (actionType === "reject" && !actionNotes.trim())
                  }
                  onClick={handleConfirmAction}
                >
                  {approveMutation.isPending || rejectMutation.isPending
                    ? "Processing..."
                    : actionType === "approve"
                      ? "Confirm & Activate"
                      : "Reject Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  );
}
