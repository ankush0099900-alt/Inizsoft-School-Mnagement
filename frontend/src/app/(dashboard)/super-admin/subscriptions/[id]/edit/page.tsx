import SubscriptionFormPage from "@/features/super-admin/subscriptions/components/SubscriptionFormPage";

export default async function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubscriptionFormPage subscriptionId={id} />;
}
