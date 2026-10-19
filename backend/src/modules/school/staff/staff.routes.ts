import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createStaffController,
  deleteStaffController,
  getStaffByIdController,
  getStaffController,
  updateStaffController,
} from "./staff.controller";

import { createStaffSchema, updateStaffSchema } from "./staff.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", authorize("SCHOOL_ADMIN", "TEACHER"), getStaffController);

router.get("/:id", authorize("SCHOOL_ADMIN", "TEACHER"), getStaffByIdController);

router.post("/", authorize("SCHOOL_ADMIN"), validate(createStaffSchema), createStaffController);

router.patch("/:id", authorize("SCHOOL_ADMIN"), validate(updateStaffSchema), updateStaffController);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteStaffController);

export default router;
