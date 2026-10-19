import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import { validate } from "../../../middleware/validate.middleware";

import { createInvoiceSchema, updateInvoiceSchema } from "./invoices.schema";

import {
  cancelInvoice,
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
} from "./invoices.controller";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("INVOICES", "FEES", "FINANCE"));

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "PARENT", "STUDENT"),
  getInvoices,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "PARENT", "STUDENT"),
  getInvoiceById,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createInvoiceSchema),
  createInvoice,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validate(updateInvoiceSchema),
  updateInvoice,
);

router.patch("/:id/cancel", authorize("SCHOOL_ADMIN"), cancelInvoice);

export default router;
