"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, GraduationCap, LayoutGrid, ListFilter, Plus, RefreshCw, School, } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import TimetableDeleteDialog from "@/features/school/timetables/components/TimetableDeleteDialog";
import TimetableFilters from "@/features/school/timetables/components/TimetableFilters";
import TimetableTable from "@/features/school/timetables/components/TimetableTable";
import TimetableScheduleView from "@/features/school/timetables/components/TimetableScheduleView";
import PeriodModal from "@/features/school/timetables/components/PeriodModal";
import { useDeleteTimetable, usePeriods, useTimetables, } from "@/features/school/timetables/hooks/useTimetables";
import type { Timetable, TimetableListParams, } from "@/features/school/timetables/types/timetables.types";
import { useAcademicYears } from "@/features/school/academic-years/hooks/useAcademicYears";
import { useClasses, useSections, } from "@/features/school/classes/hooks/useClasses";
import { useSubjects } from "@/features/school/subjects/hooks/useSubjects";
import { useTeachers } from "@/features/school/teachers/hooks/useTeachers";
import { getErrorMessage } from "@/lib/error-message";

const PAGE_LIMIT = 20;

export default function TimetablesPage() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"schedule" | "list">("schedule");
  const [periodModalOpen, setPeriodModalOpen] = useState(false);

  // Queries
  const academicYearsQuery = useAcademicYears();
  const classesQuery = useClasses();
  const subjectsQuery = useSubjects();
  const teachersQuery = useTeachers();
  const periodsQuery = usePeriods();

  const academicYears = academicYearsQuery.data?.data ?? [];
  const classes = classesQuery.data?.data ?? [];
  const subjects = subjectsQuery.data?.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];
  const periods = periodsQuery.data ?? [];

  // Filter selection state for Class Weekly Schedule
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // Initialize selected values automatically
  useEffect(() => {
    if (!selectedYearId && academicYears.length > 0) {
      const currentYear = academicYears.find((y) => y.isCurrent) ?? academicYears[0];
      setSelectedYearId(currentYear.id);
    }
  }, [academicYears, selectedYearId]);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);
  const sectionsQuery = useSections(selectedClassId);
  const sections = sectionsQuery.data?.data ?? [];

  const scheduleTimetablesQuery = useTimetables({
    academicYearId: selectedYearId || undefined,
    classId: selectedClassId || undefined,
    sectionId: selectedSectionId || undefined,
    limit: 100,
  });

  const scheduleTimetables = scheduleTimetablesQuery.data?.data ?? [];

  // Secondary Table Mode state & query
  const [tableFilters, setTableFilters] = useState<TimetableListParams>({
    page: 1, limit: PAGE_LIMIT,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTimetable, setDeletingTimetable] = useState<Timetable | null>(null);

  const tableTimetablesQuery = useTimetables(tableFilters);
  const deleteMutation = useDeleteTimetable();

  const tableTimetables = tableTimetablesQuery.data?.data ?? [];
  const tablePagination = tableTimetablesQuery.data?.pagination;

  // Selected names
  const selectedYear = academicYears.find((y) => y.id === selectedYearId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const handleEdit = (timetable: Timetable) => {
    router.push(`/school-admin/timetables/${timetable.id}/edit`);
  };

  const handleDelete = (timetable: Timetable) => {
    setDeletingTimetable(timetable);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTimetable) return;

    try {
      await deleteMutation.mutateAsync(deletingTimetable.id);
      toast.success("Timetable entry deleted successfully");
      setDeleteOpen(false);
      setDeletingTimetable(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete timetable entry"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Timetables</h1>
            <p className="text-sm text-muted-foreground">
              Manage class-wise weekly schedules and period master.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("schedule")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${viewMode === "schedule"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Weekly Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${viewMode === "list"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <ListFilter className="size-3.5" />
              <span>All Records</span>
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              scheduleTimetablesQuery.refetch();
              periodsQuery.refetch();
            }}
            disabled={scheduleTimetablesQuery.isFetching}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw
              className={
                scheduleTimetablesQuery.isFetching
                  ? "size-3.5 animate-spin"
                  : "size-3.5"
              }
            />
            <span>Refresh</span>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs gap-1.5">
            <Link href="/school-admin/timetables/new">
              <Plus className="size-3.5" />
              <span>New Entry</span>
            </Link>
          </Button>
        </div>
      </div>
      {viewMode === "schedule" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex flex-wrap items-end gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  <span>Academic Year</span>
                </label>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="h-9 min-w-[170px] rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-2xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.code} {y.isCurrent ? " • Current" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <School className="h-3.5 w-3.5 text-primary" />
                  <span>Class</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSectionId("");
                  }}
                  className="h-9 min-w-[150px] rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-2xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span>Section</span>
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-2xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPeriodModalOpen(true)}
                className="h-9 text-xs font-semibold gap-1.5 border-primary/40 text-primary hover:bg-primary/10 shadow-2xs"
              >
                <Clock className="h-4 w-4" />
                <span>Add Period</span>
              </Button>
            </div>
          </div>

          <TimetableScheduleView
            periods={periods}
            timetables={scheduleTimetables}
            academicYearId={selectedYearId}
            academicYearName={selectedYear?.name}
            classId={selectedClassId}
            className={selectedClass?.name}
            sectionId={selectedSectionId || null}
            sectionName={selectedSection?.name}
            subjects={subjects}
            teachers={teachers}
            isLoading={scheduleTimetablesQuery.isLoading}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <TimetableFilters
            filters={tableFilters}
            teachers={teachers}
            subjects={subjects}
            classes={classes}
            sections={sections}
            academicYears={academicYears}
            onChange={(next) => setTableFilters({ ...next, page: 1, limit: PAGE_LIMIT })}
            onClear={() => setTableFilters({ page: 1, limit: PAGE_LIMIT })}
          />

          <TimetableTable
            data={tableTimetables}
            isLoading={tableTimetablesQuery.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {tablePagination && tablePagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <p>
                Showing Page {tablePagination.page} of {tablePagination.totalPages} (
                {tablePagination.total} total schedules)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTableFilters((curr) => ({ ...curr, page: (curr.page ?? 1) - 1 }))
                  }
                  disabled={!tablePagination.hasPreviousPage}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTableFilters((curr) => ({ ...curr, page: (curr.page ?? 1) + 1 }))
                  }
                  disabled={!tablePagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <TimetableDeleteDialog
        open={deleteOpen}
        timetable={deletingTimetable}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Period Master Configuration Modal */}
      <PeriodModal open={periodModalOpen} onOpenChange={setPeriodModalOpen} />
    </div>
  );
}