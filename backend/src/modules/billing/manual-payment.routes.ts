import { Router } from "express";
import { RoleEnum } from "@prisma/client";
import { authenticate } from "../../middleware/auth.middleware";
import { tenantMiddleware } from "../../middleware/tenant.middleware";
import { authorize } from "../../middleware/rbac.middleware";
import { auditMiddleware } from "../../utils/audit";
import { proofUpload } from "../../middleware/proof-upload.middleware";
import {
  getSchoolSubscription,
  getSchoolTransactions,
  getSchoolPaymentSettings,
  submitManualPayment,
  uploadPaymentSlip,
  getPaymentProofFile,
} from "../school/billing/school-billing.controller";
import {
  getReviewQueue,
  getTransactions,
  getPlatformPaymentSettings,
  updatePlatformPaymentSettings,
  approveTransaction,
  rejectTransaction,
  uploadQrCode,
} from "../super-admin/billing/billing.controller";
import { getPlans } from "../super-admin/plans/plans.controller";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

// ==========================================
// PUBLIC / AUTHENTICATED COMMON ENDPOINTS
// ==========================================

// GET /api/plans
router.get("/plans", getPlans);

// Secure proof file access
router.get("/payments/proof/:filename", authenticate, getPaymentProofFile);

// ==========================================
// SCHOOL ADMIN ENDPOINTS
// ==========================================

// GET /api/subscription/me
router.get(
  "/subscription/me",
  authenticate,
  tenantMiddleware,
  authorize("SCHOOL_ADMIN"),
  getSchoolSubscription,
);

// GET /api/payment-settings
router.get(
  "/payment-settings",
  authenticate,
  tenantMiddleware,
  authorize("SCHOOL_ADMIN"),
  getSchoolPaymentSettings,
);

// POST /api/payments/manual
router.post(
  "/payments/manual",
  authenticate,
  tenantMiddleware,
  authorize("SCHOOL_ADMIN"),
  auditMiddleware("BILLING", "SUBMIT_MANUAL_PAYMENT", "TRANSACTION"),
  submitManualPayment,
);

// GET /api/payments/history
router.get(
  "/payments/history",
  authenticate,
  tenantMiddleware,
  authorize("SCHOOL_ADMIN"),
  getSchoolTransactions,
);

// POST /api/payments/upload-proof
router.post(
  "/payments/upload-proof",
  authenticate,
  tenantMiddleware,
  authorize("SCHOOL_ADMIN"),
  proofUpload.single("slip"),
  uploadPaymentSlip,
);

// ==========================================
// SUPER ADMIN ENDPOINTS
// ==========================================

// GET /api/admin/payment-requests
router.get(
  "/admin/payment-requests",
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN),
  getTransactions,
);

// POST /api/admin/payments/:id/approve
router.post(
  "/admin/payments/:id/approve",
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN),
  auditMiddleware("BILLING", "APPROVE_MANUAL_PAYMENT", "TRANSACTION"),
  approveTransaction,
);

// POST /api/admin/payments/:id/reject
router.post(
  "/admin/payments/:id/reject",
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN),
  auditMiddleware("BILLING", "REJECT_MANUAL_PAYMENT", "TRANSACTION"),
  rejectTransaction,
);

// GET /api/admin/payment-settings
router.get(
  "/admin/payment-settings",
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN),
  getPlatformPaymentSettings,
);

// PUT /api/admin/payment-settings
router.put(
  "/admin/payment-settings",
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN),
  auditMiddleware("BILLING", "UPDATE_MANUAL_PAYMENT_SETTINGS", "SETTINGS"),
  updatePlatformPaymentSettings,
);

// POST /api/admin/payment-settings/upload-qr
router.post(
  "/admin/payment-settings/upload-qr",
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN),
  upload.single("qrCode"),
  uploadQrCode,
);

export default router;
