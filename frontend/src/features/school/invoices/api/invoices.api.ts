import api from "@/api/client";
import type {
  CreateInvoicePayload,
  InvoiceListResponse,
  InvoiceResponse,
} from "../types/invoices.types";

const BASE_URL = "/school/invoices";

export async function getInvoices(): Promise<InvoiceListResponse> {
  const { data } = await api.get<InvoiceListResponse>(BASE_URL);
  return data;
}

export async function getInvoiceById(id: string): Promise<InvoiceResponse> {
  const { data } = await api.get<InvoiceResponse>(`${BASE_URL}/${id}`);
  return data;
}

export async function createInvoice(
  payload: CreateInvoicePayload,
): Promise<InvoiceResponse> {
  const { data } = await api.post<InvoiceResponse>(BASE_URL, payload);
  return data;
}

export async function deleteInvoice(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `${BASE_URL}/${id}`,
  );
  return data;
}
