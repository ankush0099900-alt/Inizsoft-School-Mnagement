import api from "@/api/client";

import type {
  CreateOnlineOrderPayload,
  ManualPaymentPayload,
  OnlineOrderResponse,
  SchoolSubscriptionData,
  SchoolTransaction,
  VerifyOnlinePaymentPayload,
} from "../types/billing.types";

export async function getSchoolSubscription(): Promise<SchoolSubscriptionData> {
  const { data } = await api.get("/school/billing/subscription");

  return data.data;
}

export async function getSchoolTransactions(): Promise<SchoolTransaction[]> {
  const { data } = await api.get("/school/billing/transactions");

  return data.data;
}

export async function submitManualPayment(
  payload: ManualPaymentPayload,
): Promise<unknown> {
  const { data } = await api.post("/school/billing/manual-payment", payload);

  return data.data;
}

export async function createOnlineOrder(
  payload: CreateOnlineOrderPayload,
): Promise<OnlineOrderResponse> {
  const { data } = await api.post(
    "/school/billing/online/create-order",
    payload,
  );

  return data.data;
}

export async function verifyOnlinePayment(
  payload: VerifyOnlinePaymentPayload,
): Promise<unknown> {
  const { data } = await api.post("/school/billing/online/verify", payload);

  return data.data;
}

export async function uploadPaymentSlip(file: File): Promise<string> {
  const formData = new FormData();

  formData.append("slip", file);

  const { data } = await api.post("/school/billing/upload-slip", formData);

  return data.data.url;
}
