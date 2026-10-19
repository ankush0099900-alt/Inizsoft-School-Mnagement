export type FeeStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE";

export interface FeeStudentUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface FeeStudent {
  id: string;
  admissionNo: string;
  rollNo: string | null;
  user: FeeStudentUser;
}

export interface FeeRecord {
  id: string;
  schoolId: string;
  academicYearId?: string | null;
  studentId: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  remarks?: string | null;
  status: FeeStatus;
  createdAt: string;
  updatedAt: string;
  student: FeeStudent;
}

export interface FeeListResponse {
  success: boolean;
  message: string;
  data: FeeRecord[];
}

export interface FeeResponse {
  success: boolean;
  message: string;
  data: FeeRecord;
}

export interface CreateFeeInput {
  studentId: string;
  academicYearId?: string | null;
  title: string;
  amount: number;
  dueDate: string;
  remarks?: string | null;
}

export interface UpdateFeeInput {
  studentId?: string;
  title?: string;
  amount?: number;
  paidAmount?: number;
  dueDate?: string;
  paidDate?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  remarks?: string | null;
}
