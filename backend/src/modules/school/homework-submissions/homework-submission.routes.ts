import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";
import {
  createHomeworkSubmissionSchema,
  homeworkSubmissionListSchema,
  homeworkSubmissionParamsSchema,
  updateHomeworkSubmissionSchema,
} from "./homework-submission.schema";
import {
  createHomeworkSubmission,
  deleteHomeworkSubmission,
  getHomeworkSubmissionById,
  getHomeworkSubmissions,
  updateHomeworkSubmission,
} from "./homework-submission.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("HOMEWORK", "ASSIGNMENTS"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validate(homeworkSubmissionListSchema),
  getHomeworkSubmissions,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validate(homeworkSubmissionParamsSchema),
  getHomeworkSubmissionById,
);

router.post(
  "/",
  authorize("STUDENT", "SCHOOL_ADMIN"),
  validate(createHomeworkSubmissionSchema),
  createHomeworkSubmission,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  validate(homeworkSubmissionParamsSchema),
  validate(updateHomeworkSubmissionSchema),
  updateHomeworkSubmission,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(homeworkSubmissionParamsSchema),
  deleteHomeworkSubmission,
);

export default router;
