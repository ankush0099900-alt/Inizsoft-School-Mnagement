import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
} from "./leave-requests.schema";

import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequestById,
  getLeaveRequests,
  rejectLeaveRequest,
  updateLeaveRequest,
} from "./leave-requests.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("LEAVE_REQUESTS"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getLeaveRequests,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getLeaveRequestById,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validate(createLeaveRequestSchema),
  createLeaveRequest,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validate(updateLeaveRequestSchema),
  updateLeaveRequest,
);

router.patch(
  "/:id/approve",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  approveLeaveRequest,
);

router.patch(
  "/:id/reject",
  authorize("SCHOOL_ADMIN", "TEACHER"),
  rejectLeaveRequest,
);

router.patch(
  "/:id/cancel",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  cancelLeaveRequest,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteLeaveRequest);

export default router;
