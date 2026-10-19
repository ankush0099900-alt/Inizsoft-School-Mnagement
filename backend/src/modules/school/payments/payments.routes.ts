import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import { createPaymentSchema, reversePaymentSchema } from "./payments.schema";

import {
  listPayments,
  getPayment,
  createPaymentController,
  reversePaymentController,
  cancelPaymentController,
} from "./payments.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("PAYMENTS", "FEES", "FINANCE"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "PARENT", "STUDENT"),
  listPayments,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "PARENT", "STUDENT"),
  getPayment,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createPaymentSchema),
  createPaymentController,
);

router.patch(
  "/:id/reverse",
  authorize("SCHOOL_ADMIN"),
  validate(reversePaymentSchema),
  reversePaymentController,
);

router.patch("/:id/cancel", authorize("SCHOOL_ADMIN"), cancelPaymentController);

export default router;
