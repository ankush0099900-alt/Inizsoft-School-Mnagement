"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Teacher } from "../types/teachers.types";

interface TeacherDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function TeacherDeleteDialog({
  open,
  onOpenChange,
  teacher,
  onConfirm,
  isLoading,
}: TeacherDeleteDialogProps) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive font-bold text-lg">
            Delete Faculty Member?
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">
              {teacher.user.fullName} ({teacher.employeeId})
            </span>
            ? This will deactivate their user portal access and detach them from scheduled timetable slots.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
