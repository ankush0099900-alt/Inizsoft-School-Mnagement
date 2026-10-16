import api from "@/api/client";

const ENDPOINT = "/super-admin/plans";

export interface Plan {
  id: string;
  name: string;
  code?: string;
  price: number | string;
  currency?: string;
  durationInDays: number;
  maxStudents?: number;
  maxTeachers?: number;
  maxAdmins?: number;
  isActive?: boolean;
}

export async function getPlans(): Promise<Plan[]> {
  const { data } = await api.get(ENDPOINT, {
    params: { page: 1, limit: 100 },
  });

  return data?.data?.plans ?? [];
}
