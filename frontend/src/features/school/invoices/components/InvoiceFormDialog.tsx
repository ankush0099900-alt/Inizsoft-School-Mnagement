"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateInvoice } from "../hooks/useInvoices";
import { useStudents } from "@/features/school/students/hooks/useStudents";

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InvoiceFormDialog({
  open,
  onOpenChange,
}: InvoiceFormDialogProps) {
  const createMutation = useCreateInvoice();
  const studentsQuery = useStudents({ limit: 100 });
  const students = studentsQuery.data?.data?.items || [];

  const [studentId, setStudentId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [subtotal, setSubtotal] = useState<number>(20000);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );

  useEffect(() => {
    if (open) {
      setInvoiceNo(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubtotal(15000);
      setDiscount(0);
      setTax(0);
    }
  }, [open]);

  const total = Math.max(0, Number(subtotal || 0) - Number(discount || 0) + Number(tax || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      toast.error("Please select a student");
      return;
    }
    if (!invoiceNo.trim()) {
      toast.error("Invoice number is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        studentId,
        invoiceNo: invoiceNo.trim(),
        subtotal: Number(subtotal),
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        dueDate: new Date(dueDate).toISOString(),
      });

      toast.success("Invoice generated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Generate Fee Invoice</DialogTitle>
          <DialogDescription>
            Issue a formalized billing invoice with discount and tax calculations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="studentSelect">Select Student *</Label>
            <select
              id="studentSelect"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
              required
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.fullName} ({s.admissionNo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="invoiceNo">Invoice Number *</Label>
              <Input
                id="invoiceNo"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="subtotal">Subtotal (₹) *</Label>
              <Input
                id="subtotal"
                type="number"
                min="0"
                value={subtotal}
                onChange={(e) => setSubtotal(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax">Tax / GST (₹)</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Real-time Calculation Summary */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>Subtotal:</span>
              <span className="font-mono">₹{Number(subtotal || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-emerald-600 text-xs">
              <span>Discount:</span>
              <span className="font-mono">- ₹{Number(discount || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>Tax / Levy:</span>
              <span className="font-mono">+ ₹{Number(tax || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="pt-2 border-t border-border/60 flex justify-between font-bold text-foreground">
              <span>Final Payable:</span>
              <span className="font-mono text-base text-primary">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Generating..." : "Issue Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
