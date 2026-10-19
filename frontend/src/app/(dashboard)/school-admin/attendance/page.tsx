"use client";

import { useMemo, useState } from "react";
import { Plus, Calendar, CheckCircle2, XCircle, Clock, Filter, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AttendanceTable from "@/features/school/attendance/components/AttendanceTable";
import AttendanceMarkDialog from "@/features/school/attendance/components/AttendanceMarkDialog";
import { useAttendance, useDeleteAttendance } from "@/features/school/attendance/hooks/useAttendance";
import { useClasses } from "@/features/school/classes/hooks/useClasses";

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [markDialogOpen, setMarkDialogOpen] = useState(false);

  const { data, isLoading } = useAttendance();
  const classesQuery = useClasses();
  const deleteMutation = useDeleteAttendance();

  const records = useMemo(() => data?.data || [], [data]);
  const classes = classesQuery.data?.data || [];

  // Filtering
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchClass = selectedClass ? r.classId === selectedClass : true;
      const matchDate = selectedDate
        ? r.attendanceDate.startsWith(selectedDate)
        : true;
      return matchClass && matchDate;
    });
  }, [records, selectedClass, selectedDate]);

  // Quick stats
  const total = filteredRecords.length;
  const present = filteredRecords.filter((r) => r.status === "PRESENT").length;
  const absent = filteredRecords.filter((r) => r.status === "ABSENT").length;
  const lateOrLeave = filteredRecords.filter(
    (r) => r.status === "LATE" || r.status === "LEAVE",
  ).length;

  const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : "0";

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Attendance entry deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete record");
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Calendar className="h-6 w-6 text-primary" />
            Attendance Tracking & Roll Call
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor daily student attendance, track absentees, and generate attendance rosters.
          </p>
        </div>

        <Button
          onClick={() => setMarkDialogOpen(true)}
          className="shadow-xs font-semibold self-start sm:self-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attendance Rate</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{attendanceRate}%</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Based on filtered records</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Present Today</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{present}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Students in classroom</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Absent</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{absent}</h3>
            <p className="text-[11px] text-red-600 font-medium mt-0.5">Requires notification</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
            <XCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Late / On Leave</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{lateOrLeave}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Excused absences</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-64">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-56">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-card shadow-2xs"
            placeholder="Filter date..."
          />
        </div>

        {(selectedClass || selectedDate) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedClass("");
              setSelectedDate("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground self-start sm:self-center"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Attendance Table */}
      <AttendanceTable
        records={filteredRecords}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* Mark Dialog */}
      <AttendanceMarkDialog
        open={markDialogOpen}
        onOpenChange={setMarkDialogOpen}
      />
    </div>
  );
}
