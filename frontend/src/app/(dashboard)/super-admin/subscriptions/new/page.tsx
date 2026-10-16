import { Suspense } from "react";
import SubscriptionFormPage from "@/features/super-admin/subscriptions/components/SubscriptionFormPage";
import Loader from "@/components/common/Loader";

export default async function NewSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ schoolId?: string }>;
}) {
  const { schoolId } = await searchParams;

  return (
    <Suspense fallback={<Loader text="Loading subscription form..." />}>
      <SubscriptionFormPage initialSchoolId={schoolId} />
    </Suspense>
  );
}
