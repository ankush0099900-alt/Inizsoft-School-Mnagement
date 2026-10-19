import api from "@/api/client";
import type {
  CreateFeeInput,
  FeeListResponse,
  FeeRecord,
  FeeResponse,
  UpdateFeeInput,
} from "../types/fees.types";

const BASE_URL = "/school/fees";

export async function getFees(): Promise<FeeListResponse> {
  const { data } = await api.get<FeeListResponse>(BASE_URL);
  return data;
}

export async function getFeeById(id: string): Promise<FeeResponse> {
  const { data } = await api.get<FeeResponse>(`${BASE_URL}/${id}`);
  return data;
}

export async function createFee(payload: CreateFeeInput): Promise<FeeResponse> {
  const { data } = await api.post<FeeResponse>(BASE_URL, payload);
  return data;
}

export async function updateFee(
  id: string,
  payload: UpdateFeeInput,
): Promise<FeeResponse> {
  const { data } = await api.patch<FeeResponse>(`${BASE_URL}/${id}`, payload);
  return data;
}

export async function deleteFee(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(`${BASE_URL}/${id}`);
  return data;
}
