import { Router } from "express";
import { RoleEnum } from "@prisma/client";
import {
  getBillingStats,
  getTransactions,
  getReviewQueue,
  getPlatformPaymentSettings,
  updatePlatformPaymentSettings,
  uploadQrCode,
  approveTransaction,
  rejectTransaction,
} from "./billing.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { auditMiddleware } from "../../../utils/audit";
import { upload } from "../../../middleware/upload.middleware";

const router = Router();

router.use(authenticate);
router.use(authorize(RoleEnum.SUPER_ADMIN));

router.get("/stats", getBillingStats);
router.get("/transactions", getTransactions);
router.get("/review-queue", getReviewQueue);

// Manual Payment Settings for Super Admin
router.get("/settings", getPlatformPaymentSettings);
router.put(
  "/settings",
  auditMiddleware("BILLING", "UPDATE_MANUAL_PAYMENT_SETTINGS", "SETTINGS"),
  updatePlatformPaymentSettings,
);
router.post("/upload-qr", upload.single("qrCode"), uploadQrCode);

// Approval & Rejection (support both PATCH and POST)
router.patch(
  "/transactions/:id/approve",
  auditMiddleware("BILLING", "APPROVE_PAYMENT", "TRANSACTION"),
  approveTransaction,
);
router.post(
  "/transactions/:id/approve",
  auditMiddleware("BILLING", "APPROVE_PAYMENT", "TRANSACTION"),
  approveTransaction,
);

router.patch(
  "/transactions/:id/reject",
  auditMiddleware("BILLING", "REJECT_PAYMENT", "TRANSACTION"),
  rejectTransaction,
);
router.post(
  "/transactions/:id/reject",
  auditMiddleware("BILLING", "REJECT_PAYMENT", "TRANSACTION"),
  rejectTransaction,
);

export default router;
