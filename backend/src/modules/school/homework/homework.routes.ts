import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";
import {
  createHomeworkSchema,
  homeworkListSchema,
  homeworkParamsSchema,
  updateHomeworkSchema,
} from "./homework.schema";
import {
  createHomework,
  deleteHomework,
  getHomeworkById,
  getHomeworks,
  updateHomework,
} from "./homework.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("HOMEWORK", "ASSIGNMENTS"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validate(homeworkListSchema),
  getHomeworks,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validate(homeworkParamsSchema),
  getHomeworkById,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(createHomeworkSchema),
  createHomework,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(homeworkParamsSchema),
  validate(updateHomeworkSchema),
  updateHomework,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(homeworkParamsSchema),
  deleteHomework,
);

export default router;
