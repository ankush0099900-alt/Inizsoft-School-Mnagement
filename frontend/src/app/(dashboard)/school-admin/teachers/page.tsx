"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Users, UserCheck, GraduationCap, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import TeacherTable from "@/features/school/teachers/components/TeacherTable";
import TeacherFormDialog from "@/features/school/teachers/components/TeacherFormDialog";
import TeacherDeleteDialog from "@/features/school/teachers/components/TeacherDeleteDialog";
import { useDeleteTeacher, useTeachers } from "@/features/school/teachers/hooks/useTeachers";
import type { Teacher } from "@/features/school/teachers/types/teachers.types";

export default function TeachersPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const { data, isLoading } = useTeachers();
  const deleteMutation = useDeleteTeacher();

  const teachers = useMemo(() => data?.data || [], [data]);

  // Search filtering
  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return teachers;
    const term = search.toLowerCase();
    return teachers.filter(
      (t) =>
        t.user.fullName?.toLowerCase().includes(term) ||
        t.employeeId?.toLowerCase().includes(term) ||
        t.user.email?.toLowerCase().includes(term) ||
        t.designation?.toLowerCase().includes(term),
    );
  }, [teachers, search]);

  // Quick stats
  const totalCount = teachers.length;
  const activeCount = teachers.filter((t) => t.user.status === "ACTIVE").length;
  const avgExperience =
    teachers.length > 0
      ? (
        teachers.reduce((acc, t) => acc + (t.experienceYears || 0), 0) /
        teachers.length
      ).toFixed(1)
      : "0";

  const handleCreate = () => {
    setSelectedTeacher(null);
    setFormOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormOpen(true);
  };

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormOpen(true);
  };

  const handleDeletePrompt = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;
    try {
      await deleteMutation.mutateAsync(selectedTeacher.id);
      toast.success("Teacher removed successfully");
      setDeleteOpen(false);
      setSelectedTeacher(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete teacher record";
      toast.error(message);
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <GraduationCap className="h-6 w-6 text-primary" />
            Teachers & Faculty Directory
          </h1>
        </div>

        <Button onClick={handleCreate} className="shadow-xs font-semibold self-start sm:self-center">
          <Plus className="mr-2 h-4 w-4" />
          Onboard Teacher
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Faculty</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{totalCount}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Registered instructors</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Status</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{activeCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Eligible for timetable slots</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg. Experience</p>
            <h3 className="text-2xl font-black text-foreground mt-1">{avgExperience} Yrs</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across all departments</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>
      </div>


      {/* Teachers Directory Table */}
      <TeacherTable
        teachers={filteredTeachers}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
      />

      {/* Form & Delete Dialogs */}
      <TeacherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        teacher={selectedTeacher}
      />

      <TeacherDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        teacher={selectedTeacher}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
