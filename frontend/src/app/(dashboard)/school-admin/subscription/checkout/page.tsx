import { Suspense } from "react";
import Loader from "@/components/common/Loader";
import PlanCheckoutView from "@/features/school/billing/components/PlanCheckoutView";

export default function PlanCheckoutPage() {
  return (
    <Suspense fallback={<Loader text="Loading plan confirmation..." />}>
      <PlanCheckoutView />
    </Suspense>
  );
}
