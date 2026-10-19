import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createGuardianSchema,
  guardianParamsSchema,
  updateGuardianSchema,
} from "./guardians.schema";

import {
  createGuardian,
  deleteGuardian,
  getGuardianById,
  getGuardians,
  updateGuardian,
} from "./guardians.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", authorize("SCHOOL_ADMIN", "TEACHER"), getGuardians);

router.get("/:id", authorize("SCHOOL_ADMIN", "TEACHER"), validate(guardianParamsSchema), getGuardianById);

router.post("/", authorize("SCHOOL_ADMIN"), validate(createGuardianSchema), createGuardian);

router.patch("/:id", authorize("SCHOOL_ADMIN"), validate(updateGuardianSchema), updateGuardian);

router.delete("/:id", authorize("SCHOOL_ADMIN"), validate(guardianParamsSchema), deleteGuardian);

export default router;
