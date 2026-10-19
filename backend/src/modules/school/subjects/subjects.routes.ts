import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../../../middleware/validate.middleware";
import {
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjects,
  updateSubject,
} from "./subjects.controller";
import {
  createSubjectSchema,
  subjectParamsSchema,
  subjectQuerySchema,
  updateSubjectSchema,
} from "./subjects.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateQuery(subjectQuerySchema),
  getSubjects,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateParams(subjectParamsSchema),
  getSubjectById,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createSubjectSchema),
  createSubject,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(subjectParamsSchema),
  validate(updateSubjectSchema),
  updateSubject,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(subjectParamsSchema),
  deleteSubject,
);

export default router;
