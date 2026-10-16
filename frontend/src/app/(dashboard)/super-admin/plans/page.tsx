"use client";

import { useRouter } from "next/navigation";
import { Plus, Layers, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/common/Loader";
import PlanStats from "@/features/super-admin/plans/components/PlanStats";
import PlanCard from "@/features/super-admin/plans/components/PlanCard";
import {
  usePlanMutations,
  usePlans,
} from "@/features/super-admin/plans/hooks/usePlans";
import { useSearchStore } from "@/store/search.store";
import {
  SubscriptionPlan,
} from "@/features/super-admin/plans/types/plan.types";

export default function PlansPage() {
  const router = useRouter();
  const search = useSearchStore((state) => state.search);

  const { data, isLoading, error, refetch } = usePlans(1, 50, search);
  const {
    toggleStatus,
    deletePlan,
    isTogglingStatus,
  } = usePlanMutations();

  const plans = data?.plans ?? [];
  const total = data?.pagination?.total ?? plans.length;

  const handleCreate = () => {
    router.push("/super-admin/plans/new");
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    router.push(`/super-admin/plans/${plan.id}/edit`);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Subscription Plans
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage school pricing tiers, student quotas, and billing duration packages.
          </p>
        </div>

        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <PlanStats plans={plans} total={total} />

      {/* Header Info / Active Search Info */}
      <div className="flex items-center justify-between gap-4">
        {search ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Filtering by header search:</span>
            <span className="font-semibold text-foreground bg-primary/10 px-2 py-0.5 rounded-md">
              &quot;{search}&quot;
            </span>
          </div>
        ) : (
          <div />
        )}

        <span className="text-xs font-medium text-muted-foreground">
          Showing {plans.length} of {total} tiers
        </span>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader text="Loading subscription plans..." />
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="font-semibold text-lg text-foreground">
              Failed to load plans
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary mb-3">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-foreground">
              No Subscription Plans Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
              {search
                ? `No plans matching "${search}". Try resetting the search.`
                : "Create your first school pricing tier to allow schools to subscribe."}
            </p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onToggleStatus={(id, status) => toggleStatus({ id, isActive: status })}
              onDelete={(id) => deletePlan(id)}
              isToggling={isTogglingStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
