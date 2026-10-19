import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import { createPaymentAllocationSchema } from "./payment-allocations.schema";

import {
  listPaymentAllocations,
  getPaymentAllocation,
  createPaymentAllocationController,
  deletePaymentAllocationController,
} from "./payment-allocations.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "PARENT", "STUDENT"),
  listPaymentAllocations,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "PARENT", "STUDENT"),
  getPaymentAllocation,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createPaymentAllocationSchema),
  createPaymentAllocationController,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  deletePaymentAllocationController,
);

export default router;
