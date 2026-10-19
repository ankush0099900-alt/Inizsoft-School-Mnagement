import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import {
  validate,
  validateParams,
} from "../../../middleware/validate.middleware";

import {
  createEnrollmentController,
  deleteEnrollmentController,
  getEnrollmentByIdController,
  getEnrollmentsController,
  promoteStudentsController,
  updateEnrollmentController,
} from "./enrollments.controller";

import {
  createEnrollmentSchema,
  enrollmentParamsSchema,
  promoteStudentsSchema,
  updateEnrollmentSchema,
} from "./enrollments.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", authorize("SCHOOL_ADMIN", "TEACHER"), getEnrollmentsController);

router.post(
  "/promote",
  authorize("SCHOOL_ADMIN"),
  validate(promoteStudentsSchema),
  promoteStudentsController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validateParams(enrollmentParamsSchema),
  getEnrollmentByIdController,
);

router.post("/", authorize("SCHOOL_ADMIN"), validate(createEnrollmentSchema), createEnrollmentController);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(enrollmentParamsSchema),
  validate(updateEnrollmentSchema),
  updateEnrollmentController,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(enrollmentParamsSchema),
  deleteEnrollmentController,
);

export default router;
