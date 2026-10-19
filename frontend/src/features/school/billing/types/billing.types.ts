export type SubscriptionStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED";

export type TransactionStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED"
  | "REFUNDED";

export type PaymentChannel =
  | "ONLINE_RAZORPAY"
  | "ONLINE_STRIPE"
  | "MANUAL_BANK_TRANSFER"
  | "MANUAL_UPI"
  | "MANUAL_CHEQUE"
  | "MANUAL_CASH";

export type SubscriptionOperation = "PURCHASE" | "RENEW" | "UPGRADE";

export interface SchoolModule {
  module: {
    id: string;
    name: string;
    code: string;
  };
}

export interface SchoolPlan {
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
  modules?: SchoolModule[];
  isHigherTier?: boolean;
  upgradeDifference?: number;
}

export interface SchoolSubscription {
  id: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  amount: number | string;
  finalAmount: number | string;
  plan?: SchoolPlan;
}

export interface ResourceUsageItem {
  current: number;
  max: number;
  percentage: number;
}

export interface PaymentSettingInfo {
  beneficiaryName: string;
  upiId: string;
  qrCodeUrl?: string | null;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: string | null;
  branchName?: string | null;
  paymentInstructions?: string | null;
}

export interface SchoolSubscriptionData {
  school: {
    id: string;
    name: string;
    code: string;
    status: string;
    isActive: boolean;
  };
  subscription?: SchoolSubscription | null;
  daysRemaining: number;
  isExpired: boolean;
  usage: {
    students: ResourceUsageItem;
    teachers: ResourceUsageItem;
    admins: ResourceUsageItem;
  };
  availablePlans: SchoolPlan[];
  paymentSettingsConfigured: boolean;
  paymentSettings: PaymentSettingInfo | null;
}

export interface SchoolTransaction {
  id: string;
  operation?: SubscriptionOperation;
  amount: number | string;
  currency: string;
  status: TransactionStatus;
  channel: PaymentChannel;
  paymentDate?: string;
  transactionReference?: string | null;
  proofDocumentUrl?: string | null;
  reviewNotes?: string | null;
  rejectionReason?: string | null;
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

export interface ManualPaymentPayload {
  planId: string;
  operation?: SubscriptionOperation;
  paymentDate?: string;
  channel: PaymentChannel;
  transactionReference: string;
  proofDocumentUrl?: string;
  notes?: string;
}

export interface CreateOnlineOrderPayload {
  planId: string;
  channel?: string;
}

export interface VerifyOnlinePaymentPayload {
  transactionId: string;
  gatewayOrderId?: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
}

export interface OnlineOrderResponse {
  transactionId: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  checkoutUrl?: string;
  key?: string;
  [key: string]: unknown;
}

export interface ManualPaymentFormValues {
  channel: PaymentChannel;
  operation: SubscriptionOperation;
  paymentDate: string;
  amount: number;
  transactionReference: string;
  proofDocumentUrl: string;
  notes: string;
}
