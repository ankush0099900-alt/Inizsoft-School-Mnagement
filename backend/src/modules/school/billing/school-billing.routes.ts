import { Router } from "express";
import {
  getSchoolSubscription,
  getSchoolTransactions,
  getSchoolPaymentSettings,
  submitManualPayment,
  uploadPaymentSlip,
  getPaymentProofFile,
} from "./school-billing.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { auditMiddleware } from "../../../utils/audit";
import { proofUpload } from "../../../middleware/proof-upload.middleware";

const router = Router();

router.use(authenticate);

// Secure proof view: accessible by owning School Admin and Super Admin
router.get("/proofs/:filename", getPaymentProofFile);

// School Admin endpoints
router.use(tenantMiddleware);
router.use(authorize("SCHOOL_ADMIN"));

router.get("/subscription", getSchoolSubscription);
router.get("/transactions", getSchoolTransactions);
router.get("/payment-settings", getSchoolPaymentSettings);

router.post(
  "/manual-payment",
  auditMiddleware("BILLING", "SUBMIT_MANUAL_PAYMENT", "TRANSACTION"),
  submitManualPayment,
);

// Secure proof upload with 5MB validation and safe naming
router.post(
  "/upload-slip",
  proofUpload.single("slip"),
  uploadPaymentSlip,
);

export default router;
