import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createEventController,
  deleteEventController,
  getEventByIdController,
  getEventsController,
  updateEventController,
} from "./events.controller";

import { createEventSchema, updateEventSchema } from "./events.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("EVENTS"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getEventsController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getEventByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createEventSchema),
  createEventController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validate(updateEventSchema),
  updateEventController,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteEventController);

export default router;
