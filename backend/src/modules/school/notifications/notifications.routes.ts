import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";
import { cancelNotificationController, createNotificationController, deleteNotificationController, getNotificationByIdController, getNotificationsController, sendNotificationController, updateNotificationController, }from "./notifications.controller";
import { createNotificationSchema, updateNotificationSchema, }from "./notifications.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", authorize("SCHOOL_ADMIN", "TEACHER", "PARENT", "STUDENT"), getNotificationsController);
router.get("/:id", authorize("SCHOOL_ADMIN", "TEACHER", "PARENT", "STUDENT"), getNotificationByIdController);
router.post("/", authorize("SCHOOL_ADMIN"), validate(createNotificationSchema), createNotificationController);
router.patch("/:id", authorize("SCHOOL_ADMIN"), validate(updateNotificationSchema), updateNotificationController);
router.patch("/:id/send", authorize("SCHOOL_ADMIN"), sendNotificationController);
router.patch("/:id/cancel", authorize("SCHOOL_ADMIN"), cancelNotificationController);
router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteNotificationController);


export default router;
