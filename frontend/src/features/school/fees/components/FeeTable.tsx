"use client";

import { CreditCard, MoreHorizontal, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FeeRecord, FeeStatus } from "../types/fees.types";

interface FeeTableProps {
  fees: FeeRecord[];
  isLoading: boolean;
  onRecordPayment: (fee: FeeRecord) => void;
  onDelete: (id: string) => void;
}

export default function FeeTable({
  fees,
  isLoading,
  onRecordPayment,
  onDelete,
}: FeeTableProps) {
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Loading fee ledger...</p>
      </div>
    );
  }

  if (fees.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h3 className="mt-4 text-base font-semibold text-foreground">No fee records found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create student fee structures, tuition charges, or bus fee invoices.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: FeeStatus) => {
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
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            <Clock className="h-3 w-3" />
            Pending
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
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Fee Head</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Paid / Balance</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {fees.map((fee) => {
              const student = fee.student;
              const balance = Number(fee.amount) - Number(fee.paidAmount || 0);
              const formattedDueDate = new Date(fee.dueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr key={fee.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {student?.user?.fullName ? student.user.fullName.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight">
                          {student?.user?.fullName || "Student"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Adm: {student?.admissionNo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{fee.title}</p>
                    {fee.paymentMethod && (
                      <p className="text-xs text-muted-foreground">Via {fee.paymentMethod}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-foreground">
                    ₹{Number(fee.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <p className="text-emerald-600 font-semibold font-mono">
                        Paid: ₹{Number(fee.paidAmount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className={`font-mono font-medium ${balance > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                        Due: ₹{balance.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-foreground">
                    {formattedDueDate}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(fee.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {balance > 0 && (
                          <DropdownMenuItem
                            onClick={() => onRecordPayment(fee)}
                            className="cursor-pointer text-emerald-600 font-medium"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Record Payment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onDelete(fee.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Fee Head
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
