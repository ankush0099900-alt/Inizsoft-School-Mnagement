"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sparkles,
  Users,
  GraduationCap,
  ShieldCheck,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import { createPlan, getPlanById, updatePlan } from "../api/plan.api";
import { CreatePlanDto } from "../types/plan.types";

interface PlanFormPageProps {
  planId?: string;
}

const defaultValues: CreatePlanDto = {
  name: "",
  code: "",
  description: "",
  price: 4999,
  currency: "INR",
  durationInDays: 365,
  maxStudents: 500,
  maxTeachers: 35,
  maxAdmins: 3,
};

export default function PlanFormPage({ planId }: PlanFormPageProps) {
  const router = useRouter();
  const isEdit = Boolean(planId);

  const [formData, setFormData] = useState<CreatePlanDto>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    if (planId) {
      setInitialLoading(true);
      getPlanById(planId)
        .then((plan) => {
          setFormData({
            name: plan.name,
            code: plan.code,
            description: plan.description || "",
            price: Number(plan.price),
            currency: plan.currency || "INR",
            durationInDays: plan.durationInDays,
            maxStudents: plan.maxStudents,
            maxTeachers: plan.maxTeachers,
            maxAdmins: plan.maxAdmins,
          });
        })
        .catch((err) => {
          toast.error("Failed to fetch plan details");
          console.error(err);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [planId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Plan name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Plan name must be at least 2 characters";
    }

    if (!formData.code?.trim()) {
      newErrors.code = "Plan code is required";
    } else if (formData.code.trim().length < 2) {
      newErrors.code = "Plan code must be at least 2 characters";
    }

    if (formData.price === undefined || formData.price === null || Number(formData.price) < 0) {
      newErrors.price = "Valid price is required (0 or greater)";
    }

    if (!formData.durationInDays || Number(formData.durationInDays) <= 0) {
      newErrors.durationInDays = "Duration must be at least 1 day";
    }

    if (formData.maxStudents === undefined || Number(formData.maxStudents) < 0) {
      newErrors.maxStudents = "Must be 0 or more students";
    }

    if (formData.maxTeachers === undefined || Number(formData.maxTeachers) < 0) {
      newErrors.maxTeachers = "Must be 0 or more teachers";
    }

    if (formData.maxAdmins === undefined || Number(formData.maxAdmins) < 1) {
      newErrors.maxAdmins = "Must allow at least 1 administrator";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const payload: CreatePlanDto = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || undefined,
        price: Number(formData.price),
        currency: formData.currency || "INR",
        durationInDays: Number(formData.durationInDays),
        maxStudents: Number(formData.maxStudents),
        maxTeachers: Number(formData.maxTeachers),
        maxAdmins: Number(formData.maxAdmins),
      };

      if (isEdit && planId) {
        await updatePlan(planId, payload);
        toast.success("Subscription plan updated successfully!");
      } else {
        await createPlan(payload);
        toast.success("Subscription plan created successfully!");
      }

      router.push("/super-admin/plans");
      router.refresh();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save plan. Please check inputs.";
      toast.error(msg);
      console.error("Plan save error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader text="Loading plan details..." />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16">

      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {isEdit ? "Edit Subscription Plan" : "Create New Subscription Plan"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEdit
                ? "Update pricing tiers, student/teacher capacities, and billing durations."
                : "Configure a dynamic pricing package for schools joining your SaaS platform."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Plan Identity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Plan Identity & Description</CardTitle>
            </div>
            <CardDescription>
              General details identifying this subscription tier across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Plan Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoCode = !isEdit && !formData.code
                      ? name.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")
                      : formData.code;
                    setFormData({
                      ...formData,
                      name,
                      code: autoCode,
                    });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g. Standard Annual"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Plan Code (Unique Identifier) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, ""),
                    });
                    if (errors.code) setErrors({ ...errors, code: "" });
                  }}
                  placeholder="e.g. STANDARD_ANNUAL"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm uppercase font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.code && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Plan Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe which schools this tier is targeted towards and highlighted advantages..."
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Pricing & Validity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-lg">Pricing & Duration</CardTitle>
            </div>
            <CardDescription>
              Set pricing rate and duration cycle in days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: Number(e.target.value) });
                      if (errors.price) setErrors({ ...errors, price: "" });
                    }}
                    placeholder="9999"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                  <option value="AED">AED (د.إ UAE Dirham)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Duration (Days) <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.durationInDays}
                    onChange={(e) => {
                      setFormData({ ...formData, durationInDays: Number(e.target.value) });
                      if (errors.durationInDays) setErrors({ ...errors, durationInDays: "" });
                    }}
                    placeholder="365"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                {errors.durationInDays && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.durationInDays}</p>
                )}
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, durationInDays: 30 })}
                    className="text-[11px] px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                  >
                    1 Month (30d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, durationInDays: 90 })}
                    className="text-[11px] px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                  >
                    1 Quarter (90d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, durationInDays: 365 })}
                    className="text-[11px] px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground font-semibold"
                  >
                    1 Year (365d)
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Usage Quotas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-lg">Capacity & User Quota Limits</CardTitle>
            </div>
            <CardDescription>
              Hard limits enforced by the SaaS quotaGuard middleware.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  <span>Max Students</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  Enforced when enrolling new students.
                </p>
                {errors.maxStudents && (
                  <p className="text-xs text-destructive font-medium">{errors.maxStudents}</p>
                )}
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Max Teachers</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.maxTeachers}
                  onChange={(e) => setFormData({ ...formData, maxTeachers: Number(e.target.value) })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  Enforced when onboarding teaching staff.
                </p>
                {errors.maxTeachers && (
                  <p className="text-xs text-destructive font-medium">{errors.maxTeachers}</p>
                )}
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>Max Admins</span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={formData.maxAdmins}
                  onChange={(e) => setFormData({ ...formData, maxAdmins: Number(e.target.value) })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  School administrator seats permitted.
                </p>
                {errors.maxAdmins && (
                  <p className="text-xs text-destructive font-medium">{errors.maxAdmins}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/super-admin/plans")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 px-6">
            <CheckCircle2 className="h-4 w-4" />
            {loading ? "Saving Plan..." : isEdit ? "Update Plan" : "Create Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
