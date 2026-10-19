import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";

import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import {
  maintenanceMiddleware,
  getMaintenanceStatus,
} from "./middleware/maintenance.middleware";

import authRoutes from "./modules/auth/auth.routes";

import superAdminDashboardRoutes from "./modules/super-admin/dashboard/dashboard.routes";
import superAdminSchoolRoutes from "./modules/super-admin/schools/schools.routes";
import userRoutes from "./modules/super-admin//users/user.routes";
import featureRoutes from "./modules/super-admin/features/features.routes";
import planRoutes from "./modules/super-admin/plans/plans.routes";
import subscriptionRoutes from "./modules/super-admin/subscriptions/subscriptions.routes";
import analyticsRoutes from "./modules/super-admin/analytics/analytics.routes";
import notificationRoutes from "./modules/super-admin/notifications/routes/notification.routes";
import auditLogRoutes from "./modules/super-admin/audit-logs/audit-logs.routes";
import settingsRoutes from "./modules/super-admin/settings/settings.routes";
import superAdminBillingRoutes from "./modules/super-admin/billing/billing.routes";
import manualPaymentRoutes from "./modules/billing/manual-payment.routes";

import schoolBillingRoutes from "./modules/school/billing/school-billing.routes";
import schoolDashboardRoutes from "./modules/school/dashboard/school-dashboard.routes";
import academicYearRoutes from "./modules/school/academic-years/academic-years.routes";
import schoolClassRoutes from "./modules/school/classes/classes.routes";
import schoolSubjectRoutes from "./modules/school/subjects/subjects.routes";
import schoolTeacherRoutes from "./modules/school/teachers/teachers.routes";
import parentRoutes from "./modules/school/parents/parents.routes";
import studentRoutes from "./modules/school/students/students.routes";
import enrollmentRoutes from "./modules/school/enrollments/enrollments.routes";
import attendanceRoutes from "./modules/school/attendance/attendance.routes";
import examRoutes from "./modules/school/exams/exams.routes";
import resultRoutes from "./modules/school/results/results.routes";
import feeRoutes from "./modules/school/fees/fees.routes";
import timetableRoutes from "./modules/school/timetables/timetables.routes";
import eventRoutes from "./modules/school/events/events.routes";
import announcementRoutes from "./modules/school/announcements/announcements.routes";
import schoolNotificationRoutes from "./modules/school/notifications/notifications.routes";
import staffRoutes from "./modules/school/staff/staff.routes";
import guardiansRoutes from "./modules/school/guardians/guardians.routes";
import admissionRoutes from "./modules/school/admissions/admissions.routes";
import leaveRequestRoutes from "./modules/school/leave-requests/leave-requests.routes";
import homeworkRoutes from "./modules/school/homework/homework.routes";
import invoiceRoutes from "./modules/school/invoices/invoices.routes";
import paymentRoutes from "./modules/school/payments/payments.routes";
import paymentAllocationRoutes from "./modules/school/payment-allocations/payment-allocations.routes";
import homeworkSubmissionRoutes from "./modules/school/homework-submissions/homework-submission.routes";

const app = express();

/**
 * Security
 *
 * CORP ko cross-origin karna zaroori hai because
 * frontend (localhost:3000) backend (localhost:5000)
 * se images load kar raha hai.
 */ app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
/**
 * CORS
 * Strict origin whitelisting to prevent unauthorized cross-origin requests.
 */
const allowedOrigins = env.CORS_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        (env.NODE_ENV === "development" &&
          (origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:")))
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origin ${origin} is not allowed by CORS policy`),
      );
    },
    credentials: true,
  }),
);

/**
 * Common middleware
 */
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/**
 * Static uploads
 *
 * Files:
 * public/uploads/example.jpg
 *
 * URL:
 * http://localhost:5000/uploads/example.jpg
 */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads")),
);

/**
 * Health / Root
 */
app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "School ERP API Running 🚀" });
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

app.get("/readyz", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is ready",
  });
});

/**
 * Auth
 */
app.use("/api/auth", authRoutes);

app.get("/api/auth/maintenance-status", async (_req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const status = await getMaintenanceStatus();
  return res.status(200).json({ success: true, data: status });
});

/**
 * Super Admin APIs
 */
app.use("/api/super-admin/dashboard", superAdminDashboardRoutes);
app.use("/api/super-admin/schools", superAdminSchoolRoutes);
app.use("/api/super-admin/users", userRoutes);
app.use("/api/super-admin/features", featureRoutes);
app.use("/api/super-admin/plans", planRoutes);
app.use("/api/super-admin/subscriptions", subscriptionRoutes);
app.use("/api/super-admin/analytics", analyticsRoutes);
app.use("/api/super-admin/notifications", notificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/super-admin/audit-logs", auditLogRoutes);
app.use("/api/super-admin/settings", settingsRoutes);
app.use("/api/super-admin/billing", superAdminBillingRoutes);
app.use("/api", manualPaymentRoutes);

/**
 * Maintenance Mode Barrier:
 * When maintenance is active, all public/school requests are blocked with HTTP 503.
 */
app.use(maintenanceMiddleware);

/**
 * School APIs
 */
app.use("/api/school/billing", schoolBillingRoutes);
app.use("/api/school/dashboard", schoolDashboardRoutes);
app.use("/api/school/academic-years", academicYearRoutes);
app.use("/api/school/classes", schoolClassRoutes);
app.use("/api/school/subjects", schoolSubjectRoutes);
app.use("/api/school/teachers", schoolTeacherRoutes);
app.use("/api/school/parents", parentRoutes);
app.use("/api/school/students", studentRoutes);
app.use("/api/school/enrollments", enrollmentRoutes);
app.use("/api/school/attendance", attendanceRoutes);
app.use("/api/school/exams", examRoutes);
app.use("/api/school/results", resultRoutes);
app.use("/api/school/fees", feeRoutes);
app.use("/api/school/timetables", timetableRoutes);
app.use("/api/school/events", eventRoutes);
app.use("/api/school/announcements", announcementRoutes);
app.use("/api/school/notifications", schoolNotificationRoutes);
app.use("/api/school/staff", staffRoutes);
app.use("/api/school/guardians", guardiansRoutes);
app.use("/api/school/admissions", admissionRoutes);
app.use("/api/school/leave-requests", leaveRequestRoutes);
app.use("/api/school/homework", homeworkRoutes);
app.use("/api/school/invoices", invoiceRoutes);
app.use("/api/school/payments", paymentRoutes);
app.use("/api/school/payment-allocations", paymentAllocationRoutes);
app.use("/api/school/homework-submissions", homeworkSubmissionRoutes);
/**
 * Error middleware
 *
 * Always keep this at the end.
 */
app.use(errorMiddleware);

export default app;
