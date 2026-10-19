import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import {
  validate,
  validateParams,
} from "../../../middleware/validate.middleware";

import {
  createClassController,
  createSectionController,
  deleteClassController,
  deleteSectionController,
  getClassByIdController,
  getClassesController,
  getSectionsController,
  updateClassController,
  updateSectionController,
} from "./classes.controller";

import {
  classIdParamsSchema,
  classParamsSchema,
  createClassSchema,
  createSectionSchema,
  sectionParamsSchema,
  updateClassSchema,
  updateSectionSchema,
} from "./classes.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getClassesController,
);
router.get(
  "/:classId/sections",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateParams(classIdParamsSchema),
  getSectionsController,
);
router.post(
  "/:classId/sections",
  authorize("SCHOOL_ADMIN"),
  validateParams(classIdParamsSchema),
  validate(createSectionSchema),
  createSectionController,
);
router.patch(
  "/:classId/sections/:sectionId",
  authorize("SCHOOL_ADMIN"),
  validateParams(sectionParamsSchema),
  validate(updateSectionSchema),
  updateSectionController,
);
router.delete(
  "/:classId/sections/:sectionId",
  authorize("SCHOOL_ADMIN"),
  validateParams(sectionParamsSchema),
  deleteSectionController,
);
router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateParams(classParamsSchema),
  getClassByIdController,
);
router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createClassSchema),
  createClassController,
);
router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(classParamsSchema),
  validate(updateClassSchema),
  updateClassController,
);
router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(classParamsSchema),
  deleteClassController,
);

export default router;
