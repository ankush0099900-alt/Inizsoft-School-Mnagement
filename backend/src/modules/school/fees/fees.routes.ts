import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createFeeController,
  deleteFeeController,
  getFeeByIdController,
  getFeesController,
  updateFeeController,
} from "./fees.controller";

import { createFeeSchema, updateFeeSchema } from "./fees.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("FEES", "FEE_STRUCTURES"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getFeesController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getFeeByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createFeeSchema),
  createFeeController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validate(updateFeeSchema),
  updateFeeController,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteFeeController);

export default router;
