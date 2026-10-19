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
import { useCreateFee, useUpdateFee } from "../hooks/useFees";
import { useStudents } from "@/features/school/students/hooks/useStudents";
import type { FeeRecord } from "../types/fees.types";

interface FeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeToPay?: FeeRecord | null;
}

export default function FeeFormDialog({
  open,
  onOpenChange,
  feeToPay,
}: FeeFormDialogProps) {
  const isRecordingPayment = Boolean(feeToPay);
  const createMutation = useCreateFee();
  const updateMutation = useUpdateFee();
  const studentsQuery = useStudents({ limit: 100 });

  const students = studentsQuery.data?.data?.items || [];

  // Create Fee State
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("Tuition Fee - Term 1");
  const [amount, setAmount] = useState<number>(15000);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [remarks, setRemarks] = useState("");

  // Payment Recording State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (feeToPay) {
      const remainingBalance =
        Number(feeToPay.amount) - Number(feeToPay.paidAmount || 0);
      setPaymentAmount(remainingBalance > 0 ? remainingBalance : 0);
      setPaymentMethod("CASH");
      setTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    } else {
      setStudentId("");
      setTitle("Term 1 Tuition Fee");
      setAmount(12000);
      setRemarks("");
    }
  }, [feeToPay, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isRecordingPayment && feeToPay) {
        const totalNewPaid =
          Number(feeToPay.paidAmount || 0) + Number(paymentAmount);
        await updateMutation.mutateAsync({
          id: feeToPay.id,
          payload: {
            paidAmount: totalNewPaid,
            paidDate: new Date().toISOString(),
            paymentMethod,
            transactionId: transactionId || null,
          },
        });
        toast.success("Payment recorded successfully");
      } else {
        if (!studentId) {
          toast.error("Please select a student");
          return;
        }
        await createMutation.mutateAsync({
          studentId,
          title,
          amount: Number(amount),
          dueDate: new Date(dueDate).toISOString(),
          remarks: remarks || null,
        });
        toast.success("Fee bill issued successfully");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to process fee transaction");
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isRecordingPayment ? "Record Fee Payment" : "Issue Student Fee Bill"}
          </DialogTitle>
          <DialogDescription>
            {isRecordingPayment
              ? `Collect payment for ${feeToPay?.student?.user?.fullName}.`
              : "Generate a new tuition, transport, or exam fee obligation."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {isRecordingPayment ? (
            <>
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Head:</span>
                  <span className="font-semibold text-foreground">{feeToPay?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Fee:</span>
                  <span className="font-mono font-bold text-foreground">
                    ₹{Number(feeToPay?.amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-mono text-emerald-600 font-semibold">
                    ₹{Number(feeToPay?.paidAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentAmount">Amount to Collect (₹) *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="1"
                  max={Number(feeToPay?.amount) - Number(feeToPay?.paidAmount || 0)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque / DD</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="BANK_TRANSFER">Bank Wire / NEFT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="transactionId">Ref / Receipt No</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="student">Select Student *</Label>
                <select
                  id="student"
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

              <div className="space-y-1.5">
                <Label htmlFor="title">Fee Title / Particulars *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Annual Tuition Fee - Term 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
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

              <div className="space-y-1.5">
                <Label htmlFor="remarks">Notes / Remarks</Label>
                <Input
                  id="remarks"
                  placeholder="Optional instructions"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Processing..."
                : isRecordingPayment
                ? "Confirm Receipt"
                : "Issue Fee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
