import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createAnnouncementController,
  deleteAnnouncementController,
  getAnnouncementByIdController,
  getAnnouncementsController,
  updateAnnouncementController,
} from "./announcements.controller";

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "./announcements.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("ANNOUNCEMENTS", "COMMUNICATION", "NOTICES"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getAnnouncementsController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getAnnouncementByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createAnnouncementSchema),
  createAnnouncementController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validate(updateAnnouncementSchema),
  updateAnnouncementController,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteAnnouncementController);

export default router;
