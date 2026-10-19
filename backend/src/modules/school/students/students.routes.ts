import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { quotaGuard } from "../../../middleware/quota.middleware";
import {
  validate,
  validateParams,
} from "../../../middleware/validate.middleware";
import { userUpload } from "../../../middleware/upload.middleware";

import {
  createStudentController,
  deleteStudentController,
  getStudentByIdController,
  getStudentsController,
  updateStudentController,
} from "./students.controller";

import {
  createStudentSchema,
  studentParamsSchema,
  updateStudentSchema,
} from "./students.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("STUDENTS"));

router.get("/", authorize("SCHOOL_ADMIN", "TEACHER"), getStudentsController);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateParams(studentParamsSchema),
  getStudentByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  quotaGuard("STUDENT"),
  userUpload.single("avatar"),
  validate(createStudentSchema),
  createStudentController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  userUpload.single("avatar"),
  validateParams(studentParamsSchema),
  validate(updateStudentSchema),
  updateStudentController,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(studentParamsSchema),
  deleteStudentController,
);

export default router;
