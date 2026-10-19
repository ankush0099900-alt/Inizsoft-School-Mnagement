"use client";

import { Edit2, MoreHorizontal, Trash2, Mail, Phone, GraduationCap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Teacher } from "../types/teachers.types";
import Loader from "@/components/common/Loader";


interface TeacherTableProps {
  teachers: Teacher[];
  isLoading: boolean;
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export default function TeacherTable({
  teachers,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: TeacherTableProps) {
  if (isLoading) {
    return (
      <Loader text="Loading teachers directory..." ></Loader>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h3 className="mt-4 text-base font-semibold text-foreground">No teachers registered</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by onboarding your faculty members and assigning academic subjects.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Faculty Member</th>
              <th className="px-6 py-4">Employee ID</th>
              <th className="px-6 py-4">Designation & Exp</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Assigned Subjects</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {teachers.map((teacher) => {
              const user = teacher.user;
              return (
                <tr key={teacher.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "T"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{teacher.qualification || "Faculty"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded">
                      {teacher.employeeId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{teacher.designation || "Teacher"}</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.experienceYears ? `${teacher.experienceYears} yrs experience` : "Not specified"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map((subj) => (
                          <Badge key={subj.id} variant="secondary" className="text-[11px] font-normal">
                            {subj.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No subjects assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                        }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onView(teacher)} className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEdit(teacher)} className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(teacher)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Teacher
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
