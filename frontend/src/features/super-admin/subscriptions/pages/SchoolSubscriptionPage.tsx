"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import SubscriptionTable from "../components/SubscriptionTable";
import RenewSubscriptionDialog from "../components/RenewSubscriptionDialog";

import { useSchoolSubscriptions } from "../hooks/useSchoolSubscriptions";
import { useDeleteSubscription } from "../hooks/useSubscriptionMutation";
import Loader from "@/components/common/Loader";
import ErrorPage from "@/components/common/error/ErrorPage";

import { Subscription } from "../types/subscription";

interface SchoolSubscriptionPageProps {
    schoolId: string;
}

export default function SchoolSubscriptionPage({
    schoolId,
}: SchoolSubscriptionPageProps) {
    const router = useRouter();

    const [renewOpen, setRenewOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();

    const {
        data = [],
        isLoading,
        isError,
        error,
    } = useSchoolSubscriptions(schoolId);

    const deleteMutation = useDeleteSubscription();

    const handleCreate = () => {
        router.push(`/super-admin/subscriptions/new?schoolId=${schoolId}`);
    };

    const handleView = (subscription: Subscription) => {
        router.push(`/super-admin/subscriptions/${subscription.id}/edit`);
    };

    const handleEdit = (subscription: Subscription) => {
        router.push(`/super-admin/subscriptions/${subscription.id}/edit`);
    };

    const handleRenew = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setRenewOpen(true);
    };

    const handleDelete = async (subscription: Subscription) => {
        const confirmed = window.confirm(
            `Delete subscription for ${subscription.school?.name}?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(subscription.id);
            alert("Subscription deleted successfully.");
        } catch {
            alert("Failed to delete subscription.");
        }
    };

    const closeRenewDialog = () => {
        setSelectedSubscription(undefined);
        setRenewOpen(false);
    };

    if (isLoading) {
        return <Loader text="Loading school subscriptions..." />;
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
                    <h2 className="text-2xl font-bold">School Subscriptions</h2>
                    <p className="text-muted-foreground">
                        Manage subscriptions for this school
                    </p>
                </div>

                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subscription
                </Button>
            </div>

            <SubscriptionTable
                data={data}
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
        </div>
    );
}