import api from "@/api/client";
import type {
  AttendanceListResponse,
  AttendanceRecord,
  AttendanceResponse,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "../types/attendance.types";

const BASE_URL = "/school/attendance";

export async function getAttendanceList(): Promise<AttendanceListResponse> {
  const { data } = await api.get<AttendanceListResponse>(BASE_URL);
  return data;
}

export async function getAttendanceById(id: string): Promise<AttendanceResponse> {
  const { data } = await api.get<AttendanceResponse>(`${BASE_URL}/${id}`);
  return data;
}

export async function createAttendance(
  payload: CreateAttendanceInput,
): Promise<AttendanceResponse> {
  const { data } = await api.post<AttendanceResponse>(BASE_URL, payload);
  return data;
}

export async function updateAttendance(
  id: string,
  payload: UpdateAttendanceInput,
): Promise<AttendanceResponse> {
  const { data } = await api.patch<AttendanceResponse>(`${BASE_URL}/${id}`, payload);
  return data;
}

export async function deleteAttendance(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(`${BASE_URL}/${id}`);
  return data;
}
