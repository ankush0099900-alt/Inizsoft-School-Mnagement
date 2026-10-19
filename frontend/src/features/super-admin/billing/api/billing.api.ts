import api from "@/api/client";

export interface Transaction {
  id: string;
  schoolId: string;
  subscriptionId?: string | null;
  planId: string;
  operation: "PURCHASE" | "RENEW" | "UPGRADE";
  amount: number | string;
  currency: string;
  status: "PENDING" | "UNDER_REVIEW" | "COMPLETED" | "FAILED" | "REJECTED" | "REFUNDED";
  channel:
    | "ONLINE_RAZORPAY"
    | "ONLINE_STRIPE"
    | "MANUAL_BANK_TRANSFER"
    | "MANUAL_UPI"
    | "MANUAL_CHEQUE"
    | "MANUAL_CASH";
  paymentDate?: string;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  transactionReference?: string | null;
  proofDocumentUrl?: string | null;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  school?: {
    id: string;
    name: string;
    code: string;
    contactEmail?: string;
    phone?: string;
    status: string;
  };
  plan?: {
    id: string;
    name: string;
    code: string;
    price: number | string;
    durationInDays: number;
    maxStudents: number;
    maxTeachers: number;
    maxAdmins: number;
  };
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  subscription?: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

export interface BillingStats {
  totalRevenue: number;
  pendingReviewsCount: number;
  totalTransactionsCount: number;
  activeSubscriptionsCount: number;
  recentTransactions: Transaction[];
}

export interface PlatformPaymentSetting {
  id?: string;
  beneficiaryName: string;
  upiId: string;
  qrCodeUrl?: string | null;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: string;
  branchName?: string;
  paymentInstructions?: string;
  isActive: boolean;
  updatedAt?: string;
}

export async function getBillingStats(): Promise<BillingStats> {
  const { data } = await api.get("/super-admin/billing/stats");
  return data.data;
}

export async function getTransactions(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  channel?: string;
  operation?: string;
  schoolId?: string;
}): Promise<{ transactions: Transaction[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const { data } = await api.get("/super-admin/billing/transactions", { params });
  return {
    transactions: data.data,
    meta: data.meta,
  };
}

export async function getReviewQueue(): Promise<Transaction[]> {
  const { data } = await api.get("/super-admin/billing/review-queue");
  return data.data;
}

export async function approveTransaction(id: string, notes?: string): Promise<Transaction> {
  const { data } = await api.patch(`/super-admin/billing/transactions/${id}/approve`, { notes });
  return data.data;
}

export async function rejectTransaction(id: string, reason: string): Promise<Transaction> {
  const { data } = await api.patch(`/super-admin/billing/transactions/${id}/reject`, { reason });
  return data.data;
}

export async function getPlatformPaymentSettings(): Promise<PlatformPaymentSetting | null> {
  const { data } = await api.get("/super-admin/billing/settings");
  return data.data;
}

export async function updatePlatformPaymentSettings(
  payload: Partial<PlatformPaymentSetting>,
): Promise<PlatformPaymentSetting> {
  const { data } = await api.put("/super-admin/billing/settings", payload);
  return data.data;
}

export async function uploadQrCode(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("qrCode", file);
  const { data } = await api.post("/super-admin/billing/upload-qr", formData);
  return data.data.url;
}
