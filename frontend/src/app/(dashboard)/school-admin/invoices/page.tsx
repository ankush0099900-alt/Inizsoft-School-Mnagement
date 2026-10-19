"use client";

import { useMemo, useState } from "react";
import { Plus, FileText, DollarSign, CheckCircle2, Clock, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InvoiceTable from "@/features/school/invoices/components/InvoiceTable";
import InvoiceFormDialog from "@/features/school/invoices/components/InvoiceFormDialog";
import { useDeleteInvoice, useInvoices } from "@/features/school/invoices/hooks/useInvoices";

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useInvoices();
  const deleteMutation = useDeleteInvoice();

  const invoices = useMemo(() => data?.data || [], [data]);

  // Filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        inv.student?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        inv.student?.admissionNo?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" ? true : inv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // Summary Metrics
  const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "PAID").length;
  const pendingCount = invoices.filter((inv) => inv.status === "ISSUED" || inv.status === "PARTIAL").length;
  const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Invoice deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete invoice");
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <FileText className="h-6 w-6 text-primary" />
            Billing & Fee Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Issue itemized tuition invoices, track tax and discount breakdowns, and manage fee billing.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} className="shadow-xs font-semibold self-start sm:self-center">
          <Plus className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Invoiced</p>
            <h3 className="text-2xl font-black text-foreground mt-1">
              ₹{totalBilled.toLocaleString("en-IN")}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{invoices.length} Invoices issued</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Settled (Paid)</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{paidCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Fully paid bills</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-black text-blue-500 mt-1">{pendingCount}</h3>
            <p className="text-[11px] text-blue-500 font-medium mt-0.5">Awaiting settlement</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overdue</p>
            <h3 className="text-2xl font-black text-red-500 mt-1">{overdueCount}</h3>
            <p className="text-[11px] text-red-500 font-medium mt-0.5">Payment delayed</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {["ALL", "ISSUED", "PARTIAL", "PAID", "OVERDUE"].map((status) => (
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

      {/* Invoice Table */}
      <InvoiceTable
        invoices={filteredInvoices}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* Invoice Form Modal */}
      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
