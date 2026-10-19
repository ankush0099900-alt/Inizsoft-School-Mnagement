import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createAttendanceController,
  deleteAttendanceController,
  getAttendanceByIdController,
  getAttendanceController,
  updateAttendanceController,
} from "./attendance.controller";

import {
  createAttendanceSchema,
  updateAttendanceSchema,
} from "./attendance.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("ATTENDANCE"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "PARENT", "STUDENT"),
  getAttendanceController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "PARENT", "STUDENT"),
  getAttendanceByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(createAttendanceSchema),
  createAttendanceController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  validate(updateAttendanceSchema),
  updateAttendanceController,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteAttendanceController);

export default router;
