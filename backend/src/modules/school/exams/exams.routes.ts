import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createExamController,
  deleteExamController,
  getExamByIdController,
  getExamsController,
  updateExamController,
} from "./exams.controller";

import { createExamSchema, updateExamSchema } from "./exams.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("EXAMS", "EXAM_SCHEDULE"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getExamsController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getExamByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(createExamSchema),
  createExamController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(updateExamSchema),
  updateExamController,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteExamController);

export default router;
