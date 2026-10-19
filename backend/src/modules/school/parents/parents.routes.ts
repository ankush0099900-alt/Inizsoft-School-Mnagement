import { Router } from "express";
import { authorize } from "../../../middleware/rbac.middleware";
import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { validate } from "../../../middleware/validate.middleware";

import {
  createParentController,
  deleteParentController,
  getParentByIdController,
  getParentsController,
  updateParentController,
} from "./parents.controller";

import { createParentSchema, updateParentSchema } from "./parents.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get("/", authorize("SCHOOL_ADMIN", "TEACHER"), getParentsController);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "PARENT"),
  getParentByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createParentSchema),
  createParentController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validate(updateParentSchema),
  updateParentController,
);

router.delete("/:id", authorize("SCHOOL_ADMIN"), deleteParentController);

export default router;
