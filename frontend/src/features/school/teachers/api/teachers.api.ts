import api from "@/api/client";
import type {
  CreateTeacherInput,
  TeacherListResponse,
  TeacherResponse,
  UpdateTeacherInput,
} from "../types/teachers.types";

const BASE_URL = "/school/teachers";

export async function getTeachers(): Promise<TeacherListResponse> {
  const { data } = await api.get<TeacherListResponse>(BASE_URL);
  return data;
}

export async function getTeacherById(id: string): Promise<TeacherResponse> {
  const { data } = await api.get<TeacherResponse>(`${BASE_URL}/${id}`);
  return data;
}

export async function createTeacher(
  payload: CreateTeacherInput,
): Promise<TeacherResponse> {
  const { data } = await api.post<TeacherResponse>(BASE_URL, payload);
  return data;
}

export async function updateTeacher(
  id: string,
  payload: UpdateTeacherInput,
): Promise<TeacherResponse> {
  const { data } = await api.patch<TeacherResponse>(`${BASE_URL}/${id}`, payload);
  return data;
}

export async function deleteTeacher(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(`${BASE_URL}/${id}`);
  return data;
}
