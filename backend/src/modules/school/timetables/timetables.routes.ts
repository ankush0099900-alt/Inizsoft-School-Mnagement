import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware";
import { tenantMiddleware } from "../../../middleware/tenant.middleware";
import { authorize } from "../../../middleware/rbac.middleware";
import { featureGuard } from "../../../middleware/feature.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../../../middleware/validate.middleware";

import {
  addPeriodController,
  createTimetableController,
  deletePeriodController,
  deleteTimetableController,
  getPeriodsController,
  getTimetableByIdController,
  getTimetablesController,
  savePeriodsController,
  updateTimetableController,
  upsertTimetableController,
} from "./timetables.controller";

import {
  addPeriodSchema,
  createTimetableSchema,
  periodParamsSchema,
  savePeriodsSchema,
  timetableListSchema,
  timetableParamsSchema,
  updateTimetableSchema,
} from "./timetables.schema";

const router = Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(featureGuard("TIMETABLE"));

// Period Master routes (Must be before /:id)
router.get(
  "/periods",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  getPeriodsController,
);
router.post(
  "/periods",
  authorize("SCHOOL_ADMIN"),
  validate(savePeriodsSchema),
  savePeriodsController,
);
router.post(
  "/periods/add",
  authorize("SCHOOL_ADMIN"),
  validate(addPeriodSchema),
  addPeriodController,
);
router.delete(
  "/periods/:periodId",
  authorize("SCHOOL_ADMIN"),
  validateParams(periodParamsSchema),
  deletePeriodController,
);

// Timetable Upsert (assign/update seamlessly)
router.post(
  "/upsert",
  authorize("SCHOOL_ADMIN"),
  validate(createTimetableSchema),
  upsertTimetableController,
);

router.get(
  "/",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateQuery(timetableListSchema),
  getTimetablesController,
);

router.get(
  "/:id",
  authorize("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"),
  validateParams(timetableParamsSchema),
  getTimetableByIdController,
);

router.post(
  "/",
  authorize("SCHOOL_ADMIN"),
  validate(createTimetableSchema),
  createTimetableController,
);

router.patch(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(timetableParamsSchema),
  validate(updateTimetableSchema),
  updateTimetableController,
);

router.delete(
  "/:id",
  authorize("SCHOOL_ADMIN"),
  validateParams(timetableParamsSchema),
  deleteTimetableController,
);

export default router;
