"use client";

import { ArrowUpRight, Check, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SchoolPlan } from "../types/billing.types";
import { formatCurrency } from "../utils/billing.utils";

interface SubscriptionPlansProps {
    plans: SchoolPlan[];
    currentPlanId?: string;
    isExpired?: boolean;
    onSelectPlan: (planId: string) => void;
}

export default function SubscriptionPlans({
    plans,
    currentPlanId,
    isExpired = false,
    onSelectPlan,
}: SubscriptionPlansProps) {
    const hasActivePlan = Boolean(currentPlanId && !isExpired);

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-bold tracking-tight">
                    Available Subscription Plans
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Choose a plan that suits your school's requirements.
                </p>
            </div>

            {plans.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No subscription plans are currently available.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((plan) => {
                        const isCurrent = currentPlanId === plan.id;
                        const isUpgrade = Boolean(hasActivePlan && !isCurrent && plan.isHigherTier);

                        let buttonText = `Buy ${plan.name}`;
                        let buttonVariant: "outline" | "default" | "secondary" = "default";

                        if (isCurrent) {
                            buttonText = "Renew Subscription";
                            buttonVariant = "outline";
                        } else if (isUpgrade) {
                            buttonText = `Upgrade to ${plan.name}`;
                        } else if (hasActivePlan) {
                            buttonText = `Choose ${plan.name}`;
                        }

                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col transition-all ${
                                    isCurrent
                                        ? "border-emerald-500/80 bg-emerald-500/[0.03] shadow-md ring-1 ring-emerald-500/20"
                                        : isUpgrade
                                        ? "border-purple-500/60 hover:border-purple-500 shadow-sm"
                                        : "border-border/70 hover:border-primary/50"
                                }`}
                            >
                                {isCurrent && (
                                    <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                                        CURRENT PLAN
                                    </span>
                                )}

                                {isUpgrade && (
                                    <span className="absolute right-4 top-4 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                                        <ArrowUpRight className="h-3 w-3" />
                                        UPGRADE
                                    </span>
                                )}

                                <CardHeader>
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        {isCurrent ? (
                                            <Crown className="h-5 w-5 text-emerald-600" />
                                        ) : isUpgrade ? (
                                            <ArrowUpRight className="h-5 w-5 text-purple-600" />
                                        ) : (
                                            <Sparkles className="h-5 w-5" />
                                        )}
                                    </div>

                                    <CardTitle className="pr-2 text-xl">
                                        {plan.name}
                                    </CardTitle>

                                    <CardDescription className="min-h-10">
                                        {plan.description ||
                                            "School management subscription plan"}
                                    </CardDescription>

                                    <div className="pt-2">
                                        <span className="text-3xl font-extrabold">
                                            {formatCurrency(plan.price, plan.currency || "INR")}
                                        </span>

                                        <span className="ml-1 text-xs text-muted-foreground">
                                            / {plan.durationInDays} days
                                        </span>

                                        {isUpgrade && typeof plan.upgradeDifference === "number" && (
                                            <div className="mt-2 rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-xs text-purple-700 dark:text-purple-300">
                                                Pay Difference: <strong>{formatCurrency(plan.upgradeDifference)}</strong>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="flex flex-1 flex-col">
                                    <div className="mb-5 space-y-3 border-t pt-4 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground">
                                                Maximum Students
                                            </span>
                                            <strong>
                                                {plan.maxStudents.toLocaleString("en-IN")}
                                            </strong>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground">
                                                Maximum Teachers
                                            </span>
                                            <strong>{plan.maxTeachers}</strong>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground">
                                                School Admins
                                            </span>
                                            <strong>{plan.maxAdmins}</strong>
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground">
                                                ERP Modules
                                            </span>
                                            <strong>{plan.modules?.length ?? 0}</strong>
                                        </div>
                                    </div>

                                    {plan.modules && plan.modules.length > 0 && (
                                        <div className="mb-5 space-y-2">
                                            {plan.modules.slice(0, 4).map(({ module }) => (
                                                <div
                                                    key={module.id}
                                                    className="flex items-center gap-2 text-xs text-muted-foreground"
                                                >
                                                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                                    <span>{module.name}</span>
                                                </div>
                                            ))}

                                            {plan.modules.length > 4 && (
                                                <p className="pl-5 text-xs text-muted-foreground">
                                                    +{plan.modules.length - 4} more modules
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-2">
                                        <Button
                                            className="w-full"
                                            variant={buttonVariant}
                                            onClick={() => onSelectPlan(plan.id)}
                                        >
                                            {buttonText}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </section>
    );
}