export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

export interface AttendanceStudentUser {
  id: string;
  fullName: string;
  email: string;
}

export interface AttendanceStudent {
  id: string;
  admissionNo: string;
  rollNo: string | null;
  user: AttendanceStudentUser;
}

export interface AttendanceClass {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  academicYearId?: string | null;
  studentId: string;
  classId: string;
  attendanceDate: string;
  status: AttendanceStatus;
  markedById?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  student: AttendanceStudent;
  class: AttendanceClass;
}

export interface AttendanceListResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord[];
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord;
}

export interface CreateAttendanceInput {
  studentId: string;
  classId: string;
  academicYearId?: string | null;
  attendanceDate: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export interface UpdateAttendanceInput {
  studentId?: string;
  classId?: string;
  academicYearId?: string | null;
  attendanceDate?: string;
  status?: AttendanceStatus;
  remarks?: string | null;
}
