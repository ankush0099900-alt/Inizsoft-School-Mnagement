"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createOnlineOrder,
  getSchoolSubscription,
  getSchoolTransactions,
  submitManualPayment,
  uploadPaymentSlip,
  verifyOnlinePayment,
} from "../api/school-billing.api";

import type {
  CreateOnlineOrderPayload,
  ManualPaymentPayload,
  VerifyOnlinePaymentPayload,
} from "../types/billing.types";

export const schoolBillingKeys = {
  all: ["school", "billing"] as const,
  subscription: ["school", "billing", "subscription"] as const,
  transactions: ["school", "billing", "transactions"] as const,
};

export function useSchoolSubscription() {
  return useQuery({
    queryKey: schoolBillingKeys.subscription,
    queryFn: getSchoolSubscription,
  });
}

export function useSchoolTransactions() {
  return useQuery({
    queryKey: schoolBillingKeys.transactions,
    queryFn: getSchoolTransactions,
  });
}

export function useRefreshSchoolBilling() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: schoolBillingKeys.all,
    });
}

export function useManualPayment() {
  const refreshBilling = useRefreshSchoolBilling();

  return useMutation({
    mutationFn: (payload: ManualPaymentPayload) => submitManualPayment(payload),

    onSuccess: async () => {
      toast.success(
        "Payment details submitted. Your payment is awaiting verification.",
      );

      await refreshBilling();
    },

    onError: (error: unknown) => {
      const message =
        (
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        )?.response?.data?.message ?? "Failed to submit payment details.";

      toast.error(message);
    },
  });
}

export function useCreateOnlineOrder() {
  return useMutation({
    mutationFn: (payload: CreateOnlineOrderPayload) =>
      createOnlineOrder(payload),

    onError: (error: unknown) => {
      const message =
        (
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        )?.response?.data?.message ?? "Failed to create payment order.";

      toast.error(message);
    },
  });
}

export function useVerifyOnlinePayment() {
  const refreshBilling = useRefreshSchoolBilling();

  return useMutation({
    mutationFn: (payload: VerifyOnlinePaymentPayload) =>
      verifyOnlinePayment(payload),

    onSuccess: async () => {
      toast.success("Payment verified successfully.");

      await refreshBilling();
    },

    onError: (error: unknown) => {
      const message =
        (
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        )?.response?.data?.message ?? "Online payment verification failed.";

      toast.error(message);
    },
  });
}

export function useUploadPaymentSlip() {
  return useMutation({
    mutationFn: (file: File) => uploadPaymentSlip(file),

    onError: (error: unknown) => {
      const message =
        (
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        )?.response?.data?.message ?? "Failed to upload payment slip.";

      toast.error(message);
    },
  });
}
