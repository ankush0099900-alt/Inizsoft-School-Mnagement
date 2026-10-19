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
  Settings,
  Calendar,
  Layers,
  HelpCircle,
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
import { getImageUrl } from "@/lib/image-url";
import PaymentSettingsTab from "./PaymentSettingsTab";

export default function BillingDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("queue");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [operationFilter, setOperationFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Modal states for approval/rejection/details
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

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
    queryKey: [
      "super-admin",
      "billing",
      "transactions",
      page,
      search,
      statusFilter,
      operationFilter,
    ],
    queryFn: () =>
      getTransactions({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        operation: operationFilter === "ALL" ? undefined : operationFilter,
      }),
  });

  const transactions = txResponse?.transactions ?? [];
  const meta = txResponse?.meta;

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      approveTransaction(id, notes),
    onSuccess: (updated) => {
      toast.success(
        `Payment approved! ${updated.plan?.name || "Plan"} activated for ${updated.school?.name}.`,
      );
      queryClient.invalidateQueries({ queryKey: ["super-admin", "billing"] });
      setSelectedTx(null);
      setActionType(null);
      setActionNotes("");
      if (detailTx?.id === updated.id) setDetailTx(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve payment");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectTransaction(id, reason),
    onSuccess: () => {
      toast.success("Payment request marked as rejected.");
      queryClient.invalidateQueries({ queryKey: ["super-admin", "billing"] });
      setSelectedTx(null);
      setActionType(null);
      setActionNotes("");
      if (detailTx) setDetailTx(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject payment");
    },
  });

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
      if (!actionNotes.trim()) {
        toast.error("Rejection reason is required");
        return;
      }
      rejectMutation.mutate({ id: selectedTx.id, reason: actionNotes });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
            Approved & Active
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
            Verification Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">
            Rejected
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOperationBadge = (operation?: string) => {
    switch (operation) {
      case "PURCHASE":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400 text-[11px]">
            New Purchase
          </Badge>
        );
      case "RENEW":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-400 text-[11px]">
            Renewal
          </Badge>
        );
      case "UPGRADE":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300 dark:text-purple-400 text-[11px]">
            Plan Upgrade
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[11px]">{operation || "PURCHASE"}</Badge>;
    }
  };

  const formatChannel = (channel: string) => {
    return channel.replace("MANUAL_", "").replace("ONLINE_", "").replace("_", " ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manual Subscription Billing</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Verify offline school subscription payments, manage manual payment bank details, and track revenue.
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
            <p className="text-xs text-muted-foreground mt-1">From all approved subscription payments</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats?.pendingReviewsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Manual bank & UPI payments awaiting verification</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalTransactionsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total payment submissions recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
        <TabsList className="bg-muted/70 p-1 rounded-xl">
          <TabsTrigger value="queue" className="rounded-lg gap-2">
            <span>Pending Review Queue</span>
            {reviewQueue.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {reviewQueue.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg">
            All Payment Requests
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg gap-1.5">
            <Settings className="h-4 w-4" />
            Payment Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Review Queue */}
        <TabsContent value="queue" className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Manual Payment Verification Queue</CardTitle>
              <CardDescription>
                Review submitted bank transfer, UPI, or cash payment proofs from schools. Verify amount and reference before approving.
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
                    There are currently no manual payment requests awaiting Super Admin verification.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                      <tr>
                        <th className="py-3 px-4">School</th>
                        <th className="py-3 px-4">Plan & Operation</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Reference / UTR</th>
                        <th className="py-3 px-4">Payment Date</th>
                        <th className="py-3 px-4">Proof Slip</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reviewQueue.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold">{tx.school?.name ?? "Unknown"}</div>
                            <div className="text-xs font-mono text-muted-foreground">ID: {tx.school?.id?.slice(0, 8)}...</div>
                          </td>
                          <td className="py-3 px-4 space-y-1">
                            <div className="font-medium text-foreground">{tx.plan?.name}</div>
                            <div>{getOperationBadge(tx.operation)}</div>
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
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {tx.paymentDate ? new Date(tx.paymentDate).toLocaleDateString() : new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {tx.proofDocumentUrl ? (
                              <a
                                href={getImageUrl(tx.proofDocumentUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View Slip
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">No slip</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs"
                                onClick={() => setDetailTx(tx)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 border-rose-300 hover:bg-rose-50 hover:text-rose-700 h-8 text-xs"
                                onClick={() => handleOpenAction(tx, "reject")}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                                onClick={() => handleOpenAction(tx, "approve")}
                              >
                                Approve
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

        {/* Tab 2: All Payment Requests */}
        <TabsContent value="all" className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Payment Requests Ledger</CardTitle>
                  <CardDescription>
                    Complete log of all manual purchase, renewal, and upgrade requests across schools.
                  </CardDescription>
                </div>
                {/* Search & Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-56">
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
                    <option value="PENDING">Pending Verification</option>
                    <option value="COMPLETED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <select
                    value={operationFilter}
                    onChange={(e) => {
                      setOperationFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 px-3 text-xs rounded-md border border-input bg-background"
                  >
                    <option value="ALL">All Operations</option>
                    <option value="PURCHASE">Purchase</option>
                    <option value="RENEW">Renewal</option>
                    <option value="UPGRADE">Upgrade</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTx ? (
                <div className="py-12">
                  <Loader text="Loading payment records..." />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No payment records found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">School</th>
                        <th className="py-3 px-4">Plan & Operation</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Reference / UTR</th>
                        <th className="py-3 px-4">Reviewed By</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{tx.school?.name ?? "Unknown"}</div>
                            <div className="text-[11px] text-muted-foreground">{tx.school?.code}</div>
                          </td>
                          <td className="py-3 px-4 space-y-1">
                            <div className="text-xs font-semibold">{tx.plan?.name}</div>
                            <div>{getOperationBadge(tx.operation)}</div>
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
                            {tx.transactionReference || "—"}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {tx.reviewedBy?.fullName ?? "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={() => setDetailTx(tx)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
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
                    Page {meta.page} of {meta.totalPages} ({meta.total} total requests)
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

        {/* Tab 3: Payment Settings */}
        <TabsContent value="settings" className="space-y-4">
          <PaymentSettingsTab />
        </TabsContent>
      </Tabs>

      {/* View Details Modal */}
      {detailTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Payment Request Details</CardTitle>
                  <CardDescription className="text-xs">
                    Submitted on {new Date(detailTx.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                {getStatusBadge(detailTx.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl text-xs border">
                <div>
                  <span className="text-muted-foreground">School Name:</span>
                  <p className="font-semibold">{detailTx.school?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">School Code:</span>
                  <p className="font-semibold">{detailTx.school?.code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Selected Plan:</span>
                  <p className="font-semibold">{detailTx.plan?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Operation:</span>
                  <div>{getOperationBadge(detailTx.operation)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-bold text-base text-foreground">
                    ₹{Number(detailTx.amount).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Channel:</span>
                  <p className="font-medium uppercase">{formatChannel(detailTx.channel)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">UTR / Transaction Reference:</span>
                  <p className="font-mono text-sm bg-background p-1.5 rounded border mt-0.5">
                    {detailTx.transactionReference || "None"}
                  </p>
                </div>
              </div>

              {detailTx.reviewNotes && (
                <div className="text-xs p-3 rounded-lg bg-muted/20 border">
                  <span className="font-semibold text-muted-foreground">Notes / Remarks:</span>
                  <p className="mt-1">{detailTx.reviewNotes}</p>
                </div>
              )}

              {detailTx.rejectionReason && (
                <div className="text-xs p-3 rounded-lg bg-rose-500/10 border border-rose-300 text-rose-700">
                  <span className="font-semibold">Rejection Reason:</span>
                  <p className="mt-1">{detailTx.rejectionReason}</p>
                </div>
              )}

              {detailTx.proofDocumentUrl && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold">Payment Proof Receipt:</span>
                  <div className="border rounded-lg p-2 bg-muted/10 flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-4 w-4 text-primary" />
                      Uploaded Receipt Document
                    </span>
                    <a
                      href={getImageUrl(detailTx.proofDocumentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      Open Document
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setDetailTx(null)}>
                  Close
                </Button>
                {detailTx.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 border-rose-300 hover:bg-rose-50"
                      onClick={() => {
                        const tx = detailTx;
                        setDetailTx(null);
                        handleOpenAction(tx, "reject");
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        const tx = detailTx;
                        setDetailTx(null);
                        handleOpenAction(tx, "approve");
                      }}
                    >
                      Approve & Activate
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                    Reject Payment Request
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
                <div className="text-xs text-muted-foreground space-y-1.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold">Approval Policy Rule ({selectedTx.operation}):</p>
                  {selectedTx.operation === "PURCHASE" && (
                    <p>New annual purchase: Start date will be set to today and expiry date to 1 calendar year later.</p>
                  )}
                  {selectedTx.operation === "RENEW" && (
                    <p>Renewal: If school subscription is currently active, expiry date will be extended from existing expiry. If expired, starts from today.</p>
                  )}
                  {selectedTx.operation === "UPGRADE" && (
                    <p>Upgrade: Existing expiry date will remain unchanged, new plan limits and features will be unlocked immediately.</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Please provide a reason for rejecting this payment (e.g. invalid UTR, payment amount mismatch, not received in bank statement). The school will see this reason in their history.
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  {actionType === "approve" ? "Approval Notes (Optional)" : "Reason for Rejection *"}
                </label>
                <Input
                  placeholder={
                    actionType === "approve"
                      ? "e.g. Verified in HDFC statement on 19 Oct"
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
