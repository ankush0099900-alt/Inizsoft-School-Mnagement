import api from "@/api/client";

export interface SchoolSubscriptionData {
  school: {
    id: string;
    name: string;
    code: string;
    status: string;
    isActive: boolean;
  };
  subscription?: {
    id: string;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED";
    amount: number | string;
    finalAmount: number | string;
    plan?: {
      id: string;
      name: string;
      code: string;
      price: number | string;
      currency: string;
      durationInDays: number;
      maxStudents: number;
      maxTeachers: number;
      maxAdmins: number;
      modules?: Array<{
        module: {
          id: string;
          name: string;
          code: string;
        };
      }>;
    };
  } | null;
  daysRemaining: number;
  isExpired: boolean;
  usage: {
    students: {
      current: number;
      max: number;
      percentage: number;
    };
    teachers: {
      current: number;
      max: number;
      percentage: number;
    };
    admins: {
      current: number;
      max: number;
      percentage: number;
    };
  };
  availablePlans: Array<{
    id: string;
    name: string;
    code: string;
    price: number | string;
    currency: string;
    durationInDays: number;
    maxStudents: number;
    maxTeachers: number;
    maxAdmins: number;
    description?: string;
    modules?: Array<{
      module: {
        id: string;
        name: string;
        code: string;
      };
    }>;
  }>;
}

export interface SchoolTransaction {
  id: string;
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
  transactionReference?: string | null;
  proofDocumentUrl?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  plan?: {
    id: string;
    name: string;
    code: string;
    price: number | string;
    durationInDays: number;
  };
  subscription?: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
}

export async function getSchoolSubscription(): Promise<SchoolSubscriptionData> {
  const { data } = await api.get("/school/billing/subscription");
  return data.data;
}

export async function getSchoolTransactions(): Promise<SchoolTransaction[]> {
  const { data } = await api.get("/school/billing/transactions");
  return data.data;
}

export async function submitManualPayment(payload: {
  planId: string;
  channel: string;
  transactionReference: string;
  proofDocumentUrl?: string;
  notes?: string;
}) {
  const { data } = await api.post("/school/billing/manual-payment", payload);
  return data.data;
}

export async function createOnlineOrder(payload: { planId: string; channel?: string }) {
  const { data } = await api.post("/school/billing/online/create-order", payload);
  return data.data;
}

export async function verifyOnlinePayment(payload: {
  transactionId: string;
  gatewayOrderId?: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
}) {
  const { data } = await api.post("/school/billing/online/verify", payload);
  return data.data;
}
