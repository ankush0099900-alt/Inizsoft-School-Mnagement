"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAttendance,
  deleteAttendance,
  getAttendanceById,
  getAttendanceList,
  updateAttendance,
} from "../api/attendance.api";
import type {
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "../types/attendance.types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: () => [...attendanceKeys.lists()] as const,
  details: () => [...attendanceKeys.all, "detail"] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
};

export function useAttendance() {
  return useQuery({
    queryKey: attendanceKeys.list(),
    queryFn: getAttendanceList,
    staleTime: 60 * 1000,
  });
}

export function useAttendanceDetail(id: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => getAttendanceById(id),
    enabled: Boolean(id),
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAttendanceInput) => createAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAttendanceInput }) =>
      updateAttendance(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
  });
}
