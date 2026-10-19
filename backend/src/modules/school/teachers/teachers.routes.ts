import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { quotaGuard } from "../../../middleware/quota.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createTeacher,
  deleteTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
} from "./teachers.controller";

import { createTeacherSchema, updateTeacherSchema } from "./teachers.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("TEACHERS"));

router.get("/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getTeachers,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getTeacherById,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  quotaGuard("TEACHER"),
  validate(createTeacherSchema),
  createTeacher,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validate(updateTeacherSchema),
  updateTeacher,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteTeacher);

export default router;
