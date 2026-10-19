import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import {
  validate,
  validateParams,
} from "../../../middleware/validate.middleware";

import {
  getAcademicYears,
  getCurrentAcademicYear,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear,
  deleteAcademicYear,
} from "./academic-years.controller";

import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
  academicYearParamsSchema,
} from "./academic-years.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getAcademicYears,
);

router.get(
  "/current",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getCurrentAcademicYear,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateParams(academicYearParamsSchema),
  getAcademicYearById,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createAcademicYearSchema),
  createAcademicYear,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(academicYearParamsSchema),
  validate(updateAcademicYearSchema),
  updateAcademicYear,
);

router.patch(
  "/:id/set-current",
  authorize("SCHOOL_ADMIN"),
  validateParams(academicYearParamsSchema),
  setCurrentAcademicYear,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(academicYearParamsSchema),
  deleteAcademicYear,
);

export default router;
