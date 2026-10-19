export type InvoiceStatus = "ISSUED" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";

export interface InvoiceStudentUser {
  id: string;
  fullName: string;
  email: string;
}

export interface InvoiceStudent {
  id: string;
  admissionNo: string;
  rollNo: string | null;
  user?: InvoiceStudentUser;
}

export interface Invoice {
  id: string;
  schoolId: string;
  academicYearId?: string | null;
  studentId: string;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: InvoiceStudent;
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  data: Invoice[];
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
}

export interface CreateInvoicePayload {
  academicYearId?: string | null;
  studentId: string;
  invoiceNo: string;
  issueDate?: string;
  dueDate: string;
  subtotal: number;
  discount?: number;
  tax?: number;
}
