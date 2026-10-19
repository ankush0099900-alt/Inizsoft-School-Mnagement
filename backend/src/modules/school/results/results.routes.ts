import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createResultController,
  deleteResultController,
  getResultByIdController,
  getResultsController,
  updateResultController,
} from "./results.controller";

import { createResultSchema, updateResultSchema } from "./results.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("RESULTS", "MARKS", "REPORT_CARDS"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getResultsController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getResultByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(createResultSchema),
  createResultController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(updateResultSchema),
  updateResultController,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteResultController);

export default router;
