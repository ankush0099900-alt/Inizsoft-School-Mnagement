"use client";

import { Building2, GraduationCap, Users } from "lucide-react";

import type { ResourceUsageItem } from "../types/billing.types";

interface ResourceUsageProps {
    usage: {
        students: ResourceUsageItem;
        teachers: ResourceUsageItem;
        admins: ResourceUsageItem;
    };
}

export default function ResourceUsage({ usage }: ResourceUsageProps) {
    const items = [
        {
            label: "Students Limit",
            icon: GraduationCap,
            data: usage.students,
            color: "bg-primary",
            iconColor: "text-primary",
        },
        {
            label: "Teachers Limit",
            icon: Users,
            data: usage.teachers,
            color: "bg-emerald-600",
            iconColor: "text-emerald-600",
        },
        {
            label: "Admin Accounts",
            icon: Building2,
            data: usage.admins,
            color: "bg-sky-600",
            iconColor: "text-sky-600",
        },
    ];

    return (
        <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
                Resource Usage & Quotas
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {items.map(({ label, icon: Icon, data, color, iconColor }) => {
                    const percentage = Math.min(
                        100,
                        Math.max(0, Number(data.percentage) || 0),
                    );

                    return (
                        <div
                            key={label}
                            className="space-y-3 rounded-xl border border-border/60 bg-card p-4"
                        >
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="flex items-center gap-2 font-medium">
                                    <Icon className={`h-4 w-4 ${iconColor}`} />
                                    {label}
                                </span>

                                <span className="shrink-0 font-bold">
                                    {data.current} / {data.max}
                                </span>
                            </div>

                            <div
                                className="h-2.5 overflow-hidden rounded-full bg-muted"
                                role="progressbar"
                                aria-label={label}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={percentage}
                            >
                                <div
                                    className={`h-full rounded-full transition-all ${percentage >= 90 ? "bg-rose-500" : color
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                <span>{data.percentage}% capacity used</span>

                                {percentage >= 90 && (
                                    <span className="font-semibold text-rose-500">
                                        Near limit
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}