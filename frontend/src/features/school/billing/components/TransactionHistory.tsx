"use client";
import { ExternalLink, FileText, RefreshCw, } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import type { SchoolTransaction } from "../types/billing.types";
import {
  formatChannel,
  formatCurrency,
  formatDate,
  formatDateTime,
  getOperationBadge,
  getStatusBadge,
} from "../utils/billing.utils";
import { getImageUrl } from "@/lib/image-url";



interface TransactionHistoryProps {
    transactions: SchoolTransaction[];
    isLoading: boolean;
    onRefresh: () => void;
    isRefreshing?: boolean;
}



export default function TransactionHistory({ transactions, isLoading, onRefresh, isRefreshing = false, }: TransactionHistoryProps) {
    return (
        <Card className="border border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                    <CardTitle className="text-lg">
                        Subscription Billing History
                    </CardTitle>

                    <CardDescription className="mt-1">
                        View payments, transaction status and submitted receipts.
                    </CardDescription>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    aria-label="Refresh transactions"
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""
                            }`}
                    />
                    Refresh
                </Button>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="py-8">
                        <Loader text="Loading transaction records..." />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-10 text-center">
                        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                        <p className="font-medium">
                            No transactions found
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Your subscription payment history will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">
                            <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Plan</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Payment Channel</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">UTR / Reference</th>
                                    <th className="px-4 py-3">Proof / Receipt</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                                            <div className="font-medium text-foreground">
                                                {formatDateTime(transaction.createdAt)}
                                            </div>
                                            {transaction.paymentDate && (
                                                <div className="text-[11px] text-muted-foreground">
                                                    Paid: {formatDate(transaction.paymentDate)}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 font-medium">
                                            {transaction.plan?.name ?? "Subscription"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {getOperationBadge(transaction.operation)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 font-semibold">
                                            {formatCurrency(
                                                transaction.amount,
                                                transaction.currency || "INR",
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="text-xs font-medium uppercase text-muted-foreground">
                                                {formatChannel(transaction.channel)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div>
                                                {getStatusBadge(transaction.status)}
                                                {transaction.status === "REJECTED" && transaction.rejectionReason && (
                                                    <div className="mt-1.5 max-w-xs rounded border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-700 dark:text-rose-300">
                                                        <span className="font-semibold">Reason: </span>
                                                        {transaction.rejectionReason}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs">
                                            {transaction.transactionReference || "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {transaction.proofDocumentUrl ? (
                                                <a
                                                    href={getImageUrl(transaction.proofDocumentUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    View Proof
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    —
                                                </span>
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
    );
}