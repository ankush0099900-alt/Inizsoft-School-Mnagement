"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFee,
  deleteFee,
  getFeeById,
  getFees,
  updateFee,
} from "../api/fees.api";
import type { CreateFeeInput, UpdateFeeInput } from "../types/fees.types";

export const feeKeys = {
  all: ["fees"] as const,
  lists: () => [...feeKeys.all, "list"] as const,
  list: () => [...feeKeys.lists()] as const,
  details: () => [...feeKeys.all, "detail"] as const,
  detail: (id: string) => [...feeKeys.details(), id] as const,
};

export function useFees() {
  return useQuery({
    queryKey: feeKeys.list(),
    queryFn: getFees,
    staleTime: 60 * 1000,
  });
}

export function useFeeDetail(id: string) {
  return useQuery({
    queryKey: feeKeys.detail(id),
    queryFn: () => getFeeById(id),
    enabled: Boolean(id),
  });
}

export function useCreateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFeeInput) => createFee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.lists() });
    },
  });
}

export function useUpdateFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFeeInput }) =>
      updateFee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.lists() });
    },
  });
}

export function useDeleteFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.lists() });
    },
  });
}
