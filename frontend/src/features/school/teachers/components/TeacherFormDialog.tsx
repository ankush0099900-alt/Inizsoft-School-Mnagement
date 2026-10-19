"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useCreateTeacher,
  useUpdateTeacher,
} from "../hooks/useTeachers";
import type { Teacher, CreateTeacherInput } from "../types/teachers.types";

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Teacher | null;
}

export default function TeacherFormDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherFormDialogProps) {
  const isEditing = Boolean(teacher);
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();

  const [formData, setFormData] = useState<CreateTeacherInput>({
    fullName: "",
    email: "",
    password: "",
    employeeId: "",
    phone: "",
    designation: "",
    qualification: "",
    experienceYears: 0,
    address: "",
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        fullName: teacher.user.fullName || "",
        email: teacher.user.email || "",
        password: "", // Leave blank on edit
        employeeId: teacher.employeeId || "",
        phone: teacher.user.phone || "",
        designation: teacher.designation || "",
        qualification: teacher.qualification || "",
        experienceYears: teacher.experienceYears || 0,
        address: teacher.address || "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        password: "",
        employeeId: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: "",
        designation: "Subject Teacher",
        qualification: "Bachelor of Education (B.Ed)",
        experienceYears: 2,
        address: "",
      });
    }
  }, [teacher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Valid email is required");
      return;
    }
    if (!isEditing && (!formData.password || formData.password.length < 8)) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (!formData.employeeId.trim()) {
      toast.error("Employee ID is required");
      return;
    }

    try {
      if (isEditing && teacher) {
        await updateMutation.mutateAsync({
          id: teacher.id,
          payload: {
            fullName: formData.fullName,
            email: formData.email,
            employeeId: formData.employeeId,
            phone: formData.phone || null,
            designation: formData.designation || null,
            qualification: formData.qualification || null,
            experienceYears: Number(formData.experienceYears) || 0,
            address: formData.address || null,
          },
        });
        toast.success("Teacher details updated successfully");
      } else {
        await createMutation.mutateAsync({
          ...formData,
          experienceYears: Number(formData.experienceYears) || 0,
        });
        toast.success("New faculty member onboarded successfully");
      }
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while saving teacher record";
      toast.error(message);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Faculty Details" : "Onboard New Teacher"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update profile, contact information, and designation for this faculty member."
              : "Register a new teacher. A login account will be automatically generated."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="e.g. Dr. Ramesh Sharma"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                placeholder="e.g. TCH-1024"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Login Password * (Min 8 chars)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!isEditing}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                placeholder="e.g. Senior Math Teacher"
                value={formData.designation || ""}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                placeholder="e.g. M.Sc, B.Ed"
                value={formData.qualification || ""}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="experienceYears">Experience (Years)</Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                value={formData.experienceYears || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experienceYears: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Residential Address</Label>
              <Input
                id="address"
                placeholder="City, State"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Onboard Faculty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
