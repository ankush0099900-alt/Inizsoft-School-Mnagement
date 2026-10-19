"use client";

import { Calendar, CheckCircle2, Layers, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SchoolPlan, SchoolSubscription } from "../types/billing.types";
import { formatCurrency, formatDate, getStatusBadge } from "../utils/billing.utils";
import ResourceUsage from "./ResourceUsage";

interface CurrentSubscriptionCardProps {
    subscription?: SchoolSubscription | null;
    usage: {
        students: { current: number; max: number; percentage: number };
        teachers: { current: number; max: number; percentage: number };
        admins: { current: number; max: number; percentage: number };
    };
    daysRemaining: number;
    availablePlans: SchoolPlan[];
    onBuy?: () => void;
    onRenew?: () => void;
    onUpgrade?: () => void;
}

export default function CurrentSubscriptionCard({
    subscription,
    usage,
    daysRemaining,
    availablePlans,
    onBuy,
    onRenew,
    onUpgrade,
}: CurrentSubscriptionCardProps) {
    const plan = subscription?.plan;

    return (
        <Card className="overflow-hidden border border-border/60 shadow-sm">
            <div className="border-b border-border/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 pt-0">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Current School Plan
                            </span>

                            {subscription?.status &&
                                getStatusBadge(subscription.status)}
                        </div>

                        <h1 className="break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
                            {plan?.name ?? "No Active Plan"}
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {subscription?.endDate
                                ? `Valid until ${formatDate(subscription.endDate)}`
                                : "Choose a subscription plan to activate your school features."}
                        </p>

                        {subscription?.endDate && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {daysRemaining > 0
                                    ? `${daysRemaining} days remaining`
                                    : "Subscription period has ended"}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="text-2xl font-bold">
                            {formatCurrency(plan?.price ?? subscription?.finalAmount)}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                                / plan
                            </span>
                        </div>

                        {subscription?.status === "ACTIVE" && daysRemaining > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={onRenew || onUpgrade}
                                    disabled={availablePlans.length === 0}
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Renew Subscription
                                </Button>

                                {availablePlans.some(
                                    (p) => p.isHigherTier || Number(p.price) > Number(plan?.price ?? 0),
                                ) && (
                                        <Button
                                            onClick={onUpgrade}
                                            disabled={availablePlans.length === 0}
                                            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Upgrade Plan
                                        </Button>
                                    )}
                            </div>
                        ) : (
                            <Button
                                onClick={onBuy || onUpgrade}
                                disabled={availablePlans.length === 0}
                                className="gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                Buy Subscription
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <CardContent className="space-y-6 p-6">
                <ResourceUsage usage={usage} />

                {plan && (
                    <div className="grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-start gap-3">
                            <Calendar className="mt-0.5 h-5 w-5 text-primary" />

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Start Date
                                </p>
                                <p className="font-medium">
                                    {formatDate(subscription?.startDate)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="mt-0.5 h-5 w-5 text-primary" />

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    End Date
                                </p>
                                <p className="font-medium">
                                    {formatDate(subscription?.endDate)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Layers className="mt-0.5 h-5 w-5 text-primary" />

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Plan Duration
                                </p>
                                <p className="font-medium">
                                    {plan.durationInDays} days
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* {plan?.modules && plan.modules.length > 0 && (
                    <div className="border-t pt-5">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Included Modules
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {plan.modules.map(({ module }) => (
                                <span
                                    key={module.id}
                                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs"
                                >
                                    {module.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )} */}
            </CardContent>
        </Card>
    );
}