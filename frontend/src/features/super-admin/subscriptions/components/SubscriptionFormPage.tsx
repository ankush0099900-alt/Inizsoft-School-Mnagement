"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
  Percent,
  Receipt,
  GraduationCap,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { getSchools } from "../../schools/api/school.api";
import { getPlans, type Plan } from "../api/plans.api";
import { getSubscription } from "../api/subscription.api";
import {
  useCreateSubscription,
  useUpdateSubscription,
} from "../hooks/useSubscriptionMutation";

interface SubscriptionFormPageProps {
  subscriptionId?: string;
  initialSchoolId?: string;
}

interface FormDataState {
  schoolId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED";
  amount: number;
  discount: number;
  tax: number;
  finalAmount: number;
}

const todayStr = new Date().toISOString().slice(0, 10);

export default function SubscriptionFormPage({
  subscriptionId,
  initialSchoolId,
}: SubscriptionFormPageProps) {
  const router = useRouter();
  const isEdit = Boolean(subscriptionId);

  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();

  const [formData, setFormData] = useState<FormDataState>({
    schoolId: initialSchoolId || "",
    planId: "",
    startDate: todayStr,
    endDate: "",
    status: "ACTIVE",
    amount: 0,
    discount: 0,
    tax: 0,
    finalAmount: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(isEdit);

  // Fetch all schools
  const { data: schoolsResponse, isLoading: loadingSchools } = useQuery({
    queryKey: queryKeys.schools.list(1, 1000, ""),
    queryFn: () => getSchools(1, 1000, ""),
  });
  const schools = schoolsResponse?.schools ?? [];

  // Fetch all active plans
  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: queryKeys.plans.list(),
    queryFn: getPlans,
  });

  // Selected Plan Object for metadata display
  const selectedPlan = plans.find((p) => p.id === formData.planId);

  // Sync initialSchoolId if provided
  useEffect(() => {
    if (initialSchoolId && !isEdit) {
      setFormData((prev) => ({ ...prev, schoolId: initialSchoolId }));
    }
  }, [initialSchoolId, isEdit]);

  // Edit mode: fetch existing subscription
  useEffect(() => {
    if (subscriptionId) {
      setInitialLoading(true);
      getSubscription(subscriptionId)
        .then((sub: any) => {
          setFormData({
            schoolId: sub.school?.id || sub.schoolId || "",
            planId: sub.plan?.id || sub.planId || "",
            startDate: sub.startDate ? sub.startDate.slice(0, 10) : todayStr,
            endDate: sub.endDate ? sub.endDate.slice(0, 10) : "",
            status: sub.status || "ACTIVE",
            amount: Number(sub.amount) || 0,
            discount: Number(sub.discount) || 0,
            tax: Number(sub.tax) || 0,
            finalAmount: Number(sub.finalAmount) || 0,
          });
        })
        .catch((err) => {
          toast.error("Failed to load subscription details.");
          console.error(err);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [subscriptionId]);

  // Handle Plan Selection -> Auto-populate Price and End Date
  const handlePlanChange = (newPlanId: string) => {
    const plan = plans.find((p) => p.id === newPlanId);
    if (!plan) {
      setFormData((prev) => ({ ...prev, planId: newPlanId }));
      return;
    }

    const price = Number(plan.price) || 0;
    const durationDays = plan.durationInDays || 365;

    const start = formData.startDate ? new Date(formData.startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);

    const calculatedFinal = price - Number(formData.discount || 0) + Number(formData.tax || 0);

    setFormData((prev) => ({
      ...prev,
      planId: plan.id,
      amount: price,
      endDate: end.toISOString().slice(0, 10),
      finalAmount: Math.max(0, calculatedFinal),
    }));

    if (errors.planId) setErrors((prev) => ({ ...prev, planId: "" }));
  };

  // Auto-calculate final amount whenever amount, discount, or tax changes
  const updateAmounts = (updates: Partial<Pick<FormDataState, "amount" | "discount" | "tax">>) => {
    setFormData((prev) => {
      const merged = { ...prev, ...updates };
      const amt = Number(merged.amount) || 0;
      const disc = Number(merged.discount) || 0;
      const tx = Number(merged.tax) || 0;
      const final = Math.max(0, amt - disc + tx);
      return {
        ...merged,
        finalAmount: final,
      };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.schoolId) {
      newErrors.schoolId = "Please select an educational institution (School)";
    }

    if (!formData.planId) {
      newErrors.planId = "Please select a subscription plan tier";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after the start date";
    }

    if (formData.amount === undefined || formData.amount < 0) {
      newErrors.amount = "Base amount must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        schoolId: formData.schoolId,
        planId: formData.planId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        amount: Number(formData.amount),
        discount: Number(formData.discount || 0),
        tax: Number(formData.tax || 0),
        finalAmount: Number(formData.finalAmount),
      };

      if (isEdit && subscriptionId) {
        await updateMutation.mutateAsync({
          id: subscriptionId,
          payload,
        });
        toast.success("Subscription updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("School subscription created and activated successfully!");
      }

      router.push("/super-admin/subscriptions");
      router.refresh();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save subscription.";
      toast.error(msg);
      console.error("Subscription save error:", error);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (initialLoading || loadingSchools || loadingPlans) {
    return (
      <div className="py-20 flex justify-center">
        <Loader text="Loading subscription details..." />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {isEdit ? "Update School Subscription" : "Create New Subscription"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEdit
                ? "Modify subscription dates, status, or applied financial terms."
                : "Select a school and pricing plan. Price and dates are automatically configured."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Tenant & Plan Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">School & Plan Tier</CardTitle>
            </div>
            <CardDescription>
              Assign a dynamic pricing tier to an educational institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* School Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select School <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.schoolId}
                  onChange={(e) => {
                    setFormData({ ...formData, schoolId: e.target.value });
                    if (errors.schoolId) setErrors({ ...errors, schoolId: "" });
                  }}
                  disabled={isEdit || Boolean(initialSchoolId)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                >
                  <option value="">-- Choose an institution --</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} ({school.code})
                    </option>
                  ))}
                </select>
                {errors.schoolId && (
                  <p className="text-xs text-destructive font-medium mt-1">{errors.schoolId}</p>
                )}
              </div>

              {/* Plan Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Subscription Plan <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="">-- Choose a plan tier --</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.code || plan.name}) — ₹{Number(plan.price).toLocaleString()} / {plan.durationInDays} days
                    </option>
                  ))}
                </select>
                {errors.planId && (
                  <p className="text-xs text-destructive font-medium mt-1">{errors.planId}</p>
                )}
              </div>
            </div>

            {/* Selected Plan Details Highlight Box */}
            {selectedPlan && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-bold text-foreground text-sm">
                      {selectedPlan.name} Plan Active
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      ₹{Number(selectedPlan.price).toLocaleString()} / {selectedPlan.durationInDays} Days
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Base price has been auto-populated below. No manual price entry required.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground shrink-0 border-t sm:border-t-0 sm:border-l border-primary/20 pt-2 sm:pt-0 sm:pl-4">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-emerald-600" />
                    <span>{selectedPlan.maxStudents || "∞"} Students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{selectedPlan.maxTeachers || "∞"} Teachers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <span>{selectedPlan.maxAdmins || "1"} Admins</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Validity Dates & Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Subscription Timeline & Status</CardTitle>
            </div>
            <CardDescription>
              Duration period calculated automatically based on plan duration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Start Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    const startStr = e.target.value;
                    let endStr = formData.endDate;
                    if (selectedPlan && startStr) {
                      const end = new Date(startStr);
                      end.setDate(end.getDate() + (selectedPlan.durationInDays || 365));
                      endStr = end.toISOString().slice(0, 10);
                    }
                    setFormData({
                      ...formData,
                      startDate: startStr,
                      endDate: endStr,
                    });
                    if (errors.startDate) setErrors({ ...errors, startDate: "" });
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive font-medium mt-1">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  End Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    if (errors.endDate) setErrors({ ...errors, endDate: "" });
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive font-medium mt-1">{errors.endDate}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Subscription Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as FormDataState["status"],
                    })
                  }
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Full Access)</option>
                  <option value="TRIAL">TRIAL (Evaluation)</option>
                  <option value="EXPIRED">EXPIRED (Suspended Access)</option>
                  <option value="CANCELLED">CANCELLED (Terminated)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Financial Terms & Invoicing Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-lg">Financial Breakdown & Invoicing</CardTitle>
            </div>
            <CardDescription>
              Base amount is prefilled from the selected tier. Apply optional discounts or taxes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              {/* Base Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Plan Base Amount (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => updateAmounts({ amount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.amount && (
                  <p className="text-xs text-destructive font-medium mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Discount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => updateAmounts({ discount: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Tax */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tax / GST (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tax}
                  onChange={(e) => updateAmounts({ tax: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Final Amount (Calculated) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-primary">
                  Final Payable (₹)
                </label>
                <input
                  type="number"
                  value={formData.finalAmount}
                  readOnly
                  className="w-full rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-sm font-bold text-foreground outline-none cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">
                  = Amount - Discount + Tax
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/super-admin/subscriptions")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2 px-6">
            <CheckCircle2 className="h-4 w-4" />
            {isSaving
              ? "Saving Subscription..."
              : isEdit
                ? "Update Subscription"
                : "Create & Activate Subscription"}
          </Button>
        </div>
      </form>
    </div>
  );
}
