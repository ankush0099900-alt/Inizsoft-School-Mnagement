"use client";

import { FileText, MoreHorizontal, Trash2, CheckCircle2, Clock, AlertTriangle, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Invoice, InvoiceStatus } from "../types/invoices.types";

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export default function InvoiceTable({
  invoices,
  isLoading,
  onDelete,
}: InvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Loading fee invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h3 className="mt-4 text-base font-semibold text-foreground">No invoices generated</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Issue formal fee bills with taxes, discounts, and itemized sub-totals.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
            <Clock className="h-3 w-3" />
            Partial
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            <Ban className="h-3 w-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            <Clock className="h-3 w-3" />
            Issued
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Issue Date</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Breakdown</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {invoices.map((inv) => {
              const formattedIssueDate = new Date(inv.issueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const formattedDueDate = new Date(inv.dueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr key={inv.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4 font-mono font-bold text-foreground text-xs">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <p className="font-semibold text-foreground">
                      {inv.student?.user?.fullName || "Student"}
                    </p>
                    <p className="text-muted-foreground font-mono">
                      {inv.student?.admissionNo || `ID: ${inv.studentId.substring(0, 8)}`}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{formattedIssueDate}</td>
                  <td className="px-6 py-4 text-xs font-medium text-foreground">{formattedDueDate}</td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                    <p>Sub: ₹{Number(inv.subtotal).toLocaleString("en-IN")}</p>
                    {Number(inv.discount) > 0 && (
                      <p className="text-emerald-600">- Disc: ₹{Number(inv.discount).toLocaleString("en-IN")}</p>
                    )}
                    {Number(inv.tax) > 0 && (
                      <p>+ Tax: ₹{Number(inv.tax).toLocaleString("en-IN")}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-foreground text-base">
                    ₹{Number(inv.total).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDelete(inv.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
