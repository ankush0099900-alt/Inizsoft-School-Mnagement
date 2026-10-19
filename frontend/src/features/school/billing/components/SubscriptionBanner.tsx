"use client";

import { Clock, ShieldAlert, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SubscriptionBannerProps {
    isExpired: boolean;
    daysRemaining: number;
    onRenew: () => void;
}

export default function SubscriptionBanner({
    isExpired,
    daysRemaining,
    onRenew,
}: SubscriptionBannerProps) {
    if (isExpired) {
        return (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10  text-rose-700 sm:flex-row sm:items-center dark:text-rose-300">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0" />

                    <div>
                        <p className="font-semibold">
                            Your subscription has expired
                        </p>

                        <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                            Renew your plan to restore subscription access.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={onRenew}
                    size="sm"
                    className="shrink-0 bg-rose-600 text-white hover:bg-rose-700"
                >
                    Renew Now
                </Button>
            </div>
        );
    }

    if (daysRemaining > 0 && daysRemaining <= 15) {
        return (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 sm:flex-row sm:items-center dark:text-amber-300">
                <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-6 w-6 shrink-0" />

                    <div>
                        <p className="font-semibold">
                            Subscription expiring soon
                        </p>

                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                            {daysRemaining} days remaining in your current subscription.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={onRenew}
                    size="sm"
                    className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extend Plan
                </Button>
            </div>
        );
    }

    return null;
}