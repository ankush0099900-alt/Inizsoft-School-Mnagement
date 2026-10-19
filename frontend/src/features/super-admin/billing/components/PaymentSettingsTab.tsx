"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  QrCode,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getPlatformPaymentSettings,
  updatePlatformPaymentSettings,
  uploadQrCode,
  type PlatformPaymentSetting,
} from "../api/billing.api";
import { getImageUrl } from "@/lib/image-url";

export default function PaymentSettingsTab() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PlatformPaymentSetting>({
    beneficiaryName: "",
    upiId: "",
    qrCodeUrl: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "CURRENT",
    branchName: "",
    paymentInstructions: "",
    isActive: true,
  });

  const [uploadingQr, setUploadingQr] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["super-admin", "billing", "settings"],
    queryFn: getPlatformPaymentSettings,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        beneficiaryName: settings.beneficiaryName || "",
        upiId: settings.upiId || "",
        qrCodeUrl: settings.qrCodeUrl || "",
        bankName: settings.bankName || "",
        accountNumber: settings.accountNumber || "",
        ifscCode: settings.ifscCode || "",
        accountType: settings.accountType || "CURRENT",
        branchName: settings.branchName || "",
        paymentInstructions: settings.paymentInstructions || "",
        isActive: settings.isActive ?? true,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: updatePlatformPaymentSettings,
    onSuccess: () => {
      toast.success("Manual payment settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["super-admin", "billing", "settings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save payment settings");
    },
  });

  const handleQrUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG/JPG/WEBP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("QR Code image must be less than 2MB.");
      return;
    }

    try {
      setUploadingQr(true);
      const url = await uploadQrCode(file);
      setForm((prev) => ({ ...prev, qrCodeUrl: url }));
      toast.success("QR code uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload QR code.");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.beneficiaryName.trim()) {
      toast.error("Beneficiary name is required");
      return;
    }
    if (!form.upiId.trim()) {
      toast.error("UPI ID is required");
      return;
    }
    if (!form.bankName.trim()) {
      toast.error("Bank name is required");
      return;
    }
    if (!form.accountNumber.trim()) {
      toast.error("Account number is required");
      return;
    }
    if (!form.ifscCode.trim()) {
      toast.error("IFSC code is required");
      return;
    }

    saveMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading payment settings...</span>
      </div>
    );
  }

  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Official Manual Payment Settings
        </CardTitle>
        <CardDescription>
          Configure the official bank account, UPI ID, and QR code displayed to School Admins when making offline subscription payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Active Status */}
          <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Enable Manual Payments</Label>
              <p className="text-xs text-muted-foreground">
                When enabled, schools can submit offline bank transfer and UPI payments for review.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Beneficiary Name */}
            <div className="space-y-1.5">
              <Label htmlFor="beneficiaryName" className="text-xs font-semibold">
                Beneficiary / Business Name *
              </Label>
              <Input
                id="beneficiaryName"
                placeholder="e.g. INIZSOFT TECHNOLOGIES PVT LTD"
                value={form.beneficiaryName}
                onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
                required
              />
            </div>

            {/* UPI ID */}
            <div className="space-y-1.5">
              <Label htmlFor="upiId" className="text-xs font-semibold">
                Official UPI ID *
              </Label>
              <Input
                id="upiId"
                placeholder="e.g. business@hdfcbank"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                required
              />
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
              <Label htmlFor="bankName" className="text-xs font-semibold">
                Bank Name *
              </Label>
              <Input
                id="bankName"
                placeholder="e.g. HDFC Bank Ltd"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                required
              />
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber" className="text-xs font-semibold">
                Account Number *
              </Label>
              <Input
                id="accountNumber"
                placeholder="e.g. 50200088991234"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="font-mono"
                required
              />
            </div>

            {/* IFSC Code */}
            <div className="space-y-1.5">
              <Label htmlFor="ifscCode" className="text-xs font-semibold">
                IFSC Code *
              </Label>
              <Input
                id="ifscCode"
                placeholder="e.g. HDFC0001234"
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                className="font-mono uppercase"
                required
              />
            </div>

            {/* Account Type */}
            <div className="space-y-1.5">
              <Label htmlFor="accountType" className="text-xs font-semibold">
                Account Type
              </Label>
              <select
                id="accountType"
                value={form.accountType || "CURRENT"}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background"
              >
                <option value="CURRENT">Current Account</option>
                <option value="SAVINGS">Savings Account</option>
              </select>
            </div>

            {/* Branch Name */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="branchName" className="text-xs font-semibold">
                Branch Location (Optional)
              </Label>
              <Input
                id="branchName"
                placeholder="e.g. Main Branch, MG Road, Bangalore"
                value={form.branchName || ""}
                onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              />
            </div>
          </div>

          {/* QR Code Upload */}
          <div className="space-y-2 rounded-xl border p-4 bg-card">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-primary" />
              UPI QR Code Image (Optional)
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload a scanner QR code for schools to scan & pay directly using Google Pay, PhonePe, or Paytm.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Input
                type="file"
                accept="image/*"
                disabled={uploadingQr}
                onChange={(e) => handleQrUpload(e.target.files?.[0])}
                className="text-xs max-w-sm"
              />
              {uploadingQr && (
                <span className="flex items-center text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  Uploading QR...
                </span>
              )}
            </div>

            {form.qrCodeUrl && (
              <div className="pt-2 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(form.qrCodeUrl)}
                  alt="UPI QR Code Preview"
                  className="h-28 w-28 object-contain border rounded-lg p-1 bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setForm({ ...form, qrCodeUrl: "" })}
                >
                  Remove QR
                </Button>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="space-y-1.5">
            <Label htmlFor="paymentInstructions" className="text-xs font-semibold">
              Payment Instructions for Schools (Optional)
            </Label>
            <Textarea
              id="paymentInstructions"
              placeholder="e.g. Please enter your School Name in the UPI remarks. Keep the screenshot or UTR number ready for instant verification."
              value={form.paymentInstructions || ""}
              onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saveMutation.isPending || uploadingQr}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Manual Payment Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
