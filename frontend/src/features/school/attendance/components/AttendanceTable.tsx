"use client";

import { Calendar, CheckCircle2, Clock, MoreHorizontal, Trash2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AttendanceRecord, AttendanceStatus } from "../types/attendance.types";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export default function AttendanceTable({
  records,
  isLoading,
  onDelete,
}: AttendanceTableProps) {
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Loading attendance records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h3 className="mt-4 text-base font-semibold text-foreground">No attendance records found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a date or mark student attendance for the day to generate attendance sheets.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Present
          </span>
        );
      case "ABSENT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600">
            <XCircle className="h-3 w-3" />
            Absent
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            <Clock className="h-3 w-3" />
            Late
          </span>
        );
      case "LEAVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
            <AlertCircle className="h-3 w-3" />
            On Leave
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Admission & Roll</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Remarks</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.map((record) => {
              const student = record.student;
              const formattedDate = new Date(record.attendanceDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr key={record.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {student?.user?.fullName ? student.user.fullName.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight">
                          {student?.user?.fullName || "Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">{student?.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono font-medium text-foreground">
                      <p>Adm: {student?.admissionNo}</p>
                      <p className="text-muted-foreground">Roll: {student?.rollNo || "-"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="font-medium text-xs">
                      {record.class?.name || "Class"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-foreground">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground max-w-[200px] truncate">
                    {record.remarks || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDelete(record.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
