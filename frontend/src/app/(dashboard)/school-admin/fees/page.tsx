"use client";

import { useMemo, useState } from "react";
import { Plus, CreditCard, DollarSign, CheckCircle2, Clock, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FeeTable from "@/features/school/fees/components/FeeTable";
import FeeFormDialog from "@/features/school/fees/components/FeeFormDialog";
import { useDeleteFee, useFees } from "@/features/school/fees/hooks/useFees";
import type { FeeRecord, FeeStatus } from "@/features/school/fees/types/fees.types";

export default function FeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  const { data, isLoading } = useFees();
  const deleteMutation = useDeleteFee();

  const fees = useMemo(() => data?.data || [], [data]);

  // Filtering
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const matchSearch =
        fee.title.toLowerCase().includes(search.toLowerCase()) ||
        fee.student?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        fee.student?.admissionNo?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" ? true : fee.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [fees, search, statusFilter]);

  // Financial summary metrics
  const totalBilled = fees.reduce((acc, f) => acc + Number(f.amount || 0), 0);
  const totalCollected = fees.reduce((acc, f) => acc + Number(f.paidAmount || 0), 0);
  const totalOutstanding = totalBilled - totalCollected;
  const overdueCount = fees.filter((f) => f.status === "OVERDUE").length;

  const handleIssueFee = () => {
    setSelectedFee(null);
    setDialogOpen(true);
  };

  const handleRecordPayment = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Fee record deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete fee record");
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <CreditCard className="h-6 w-6 text-primary" />
            Student Fees & Accounts Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage fee structures, issue tuition invoices, and record offline payments.
          </p>
        </div>

        <Button onClick={handleIssueFee} className="shadow-xs font-semibold self-start sm:self-center">
          <Plus className="mr-2 h-4 w-4" />
          Issue Fee Bill
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Invoiced</p>
            <h3 className="text-2xl font-black text-foreground mt-1">
              ₹{totalBilled.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{fees.length} Total fee heads</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Collected</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ₹{totalCollected.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Cleared & settled</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Outstanding Dues</p>
            <h3 className="text-2xl font-black text-red-500 mt-1">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-red-500 font-medium mt-0.5">Pending collection</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overdue Count</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{overdueCount}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Past deadline</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student or fee title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {["ALL", "PENDING", "PARTIAL", "PAID", "OVERDUE"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Table */}
      <FeeTable
        fees={filteredFees}
        isLoading={isLoading}
        onRecordPayment={handleRecordPayment}
        onDelete={handleDelete}
      />

      {/* Fee Form / Payment Modal */}
      <FeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        feeToPay={selectedFee}
      />
    </div>
  );
}
