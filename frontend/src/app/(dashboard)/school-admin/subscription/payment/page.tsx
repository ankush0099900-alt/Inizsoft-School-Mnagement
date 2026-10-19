import { Suspense } from "react";
import Loader from "@/components/common/Loader";
import ManualPaymentView from "@/features/school/billing/components/ManualPaymentView";

export default function ManualPaymentPage() {
  return (
    <Suspense fallback={<Loader text="Loading payment instructions..." />}>
      <ManualPaymentView />
    </Suspense>
  );
}
