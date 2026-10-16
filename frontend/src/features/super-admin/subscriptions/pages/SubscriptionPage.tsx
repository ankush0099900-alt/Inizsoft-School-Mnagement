"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubscriptionStats from "../components/SubscriptionStats";
import SubscriptionTable from "../components/SubscriptionTable";
import RenewSubscriptionDialog from "../components/RenewSubscriptionDialog";
import { useSubscriptions } from "../hooks/useSubscriptions";
import Loader from "@/components/common/Loader";
import ErrorPage from "@/components/common/error/ErrorPage";
import Pagination from "@/components/tables/Pagination";
import { useDeleteSubscription } from "../hooks/useSubscriptionMutation";
import { Subscription } from "../types/subscription";
import { toast } from "sonner";

export default function SubscriptionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const limit = 10;
    const { data, isLoading, isError, error } = useSubscriptions(page, limit);

    const [renewOpen, setRenewOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();
    const deleteMutation = useDeleteSubscription();
    const subscriptions = data?.data ?? [];
    const pagination = data?.pagination;

    const handleCreate = () => {
        router.push("/super-admin/subscriptions/new");
    };

    const handleEdit = (subscription: Subscription) => {
        router.push(`/super-admin/subscriptions/${subscription.id}/edit`);
    };

    const handleRenew = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setRenewOpen(true);
    };

    const handleView = (subscription: Subscription) => {
        router.push(`/super-admin/subscriptions/${subscription.id}/edit`);
    };

    const handleDelete = async (subscription: Subscription) => {
        const schoolName = subscription.school?.name || "this school";
        const confirmed = window.confirm(`Delete subscription for "${schoolName}"?`);
        if (!confirmed) return;
        try {
            await deleteMutation.mutateAsync(subscription.id);
            toast.success("Subscription deleted successfully.");
        } catch {
            toast.error("Failed to delete subscription.");
        }
    };

    const closeRenewDialog = () => {
        setRenewOpen(false);
        setSelectedSubscription(undefined);
    };


    if (isLoading) {
        return <Loader text="Loading subscriptions..." />;
    }

    if (isError) {
        return (
            <ErrorPage
                title="Unable to load subscriptions"
                message={error instanceof Error ? error.message : "Please try again in a moment."}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Subscription Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage all school subscriptions
                    </p>
                </div>

                <Button
                    onClick={handleCreate}
                >
                    <Plus className="mr-2 h-4 w-4" />

                    Add Subscription
                </Button>

            </div>

            <SubscriptionStats />

            <SubscriptionTable
                data={subscriptions}
                loading={isLoading}
                onView={handleView}
                onEdit={handleEdit}
                onRenew={handleRenew}
                onDelete={handleDelete}
            />

            <RenewSubscriptionDialog
                open={renewOpen}
                onOpenChange={closeRenewDialog}
                subscription={selectedSubscription}
            />

            {pagination && (
                <div className="px-6">
                    <Pagination pagination={pagination} />
                </div>
            )}

        </div>
    );
}