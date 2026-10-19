"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateAttendance } from "../hooks/useAttendance";
import { useStudents } from "@/features/school/students/hooks/useStudents";
import { useClasses } from "@/features/school/classes/hooks/useClasses";
import type { AttendanceStatus } from "../types/attendance.types";

interface AttendanceMarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AttendanceMarkDialog({
  open,
  onOpenChange,
}: AttendanceMarkDialogProps) {
  const createMutation = useCreateAttendance();
  const studentsQuery = useStudents({ limit: 100 });
  const classesQuery = useClasses();

  const students = studentsQuery.data?.data?.items || [];
  const classes = classesQuery.data?.data || [];

  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      toast.error("Please select a student");
      return;
    }
    if (!classId) {
      toast.error("Please select a class");
      return;
    }

    try {
      await createMutation.mutateAsync({
        studentId,
        classId,
        attendanceDate: new Date(date).toISOString(),
        status,
        remarks: remarks.trim() || null,
      });

      toast.success("Attendance marked successfully");
      onOpenChange(false);
      setRemarks("");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to mark attendance";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Mark Attendance</DialogTitle>
          <DialogDescription>
            Record student daily presence or absence status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="classSelect">Class *</Label>
            <select
              id="classSelect"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="studentSelect">Student *</Label>
            <select
              id="studentSelect"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">Select Student</option>
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.user.fullName} ({std.admissionNo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="attendanceDate">Date *</Label>
              <Input
                id="attendanceDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statusSelect">Status *</Label>
              <select
                id="statusSelect"
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="LEAVE">Leave</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Input
              id="remarks"
              placeholder="e.g. Doctor appointment, bus delayed"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Record Attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
