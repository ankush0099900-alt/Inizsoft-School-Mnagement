import PlanFormPage from "@/features/super-admin/plans/components/PlanFormPage";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanFormPage planId={id} />;
}
