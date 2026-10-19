import { Request, Response, NextFunction } from "express";
import { RoleEnum, SubscriptionStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export type QuotaResourceType = "STUDENT" | "TEACHER" | "ADMIN";

/**
 * Quota Guard Middleware
 *
 * Verifies that the tenant school has not exceeded resource limits (maxStudents, maxTeachers, maxAdmins)
 * defined by its active subscription plan before creating new records.
 *
 * @param resourceType The type of entity being created ("STUDENT", "TEACHER", or "ADMIN")
 */
export const quotaGuard = (resourceType: QuotaResourceType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      // Super Admins bypass quota checks
      if (req.user.role === RoleEnum.SUPER_ADMIN) {
        return next();
      }

      const schoolId = req.tenant?.schoolId || req.user.schoolId;
      if (!schoolId) {
        return res.status(403).json({
          success: false,
          code: "TENANT_REQUIRED",
          message: "School context required for quota verification",
        });
      }

      // Fetch active or trial subscription with plan limits
      const subscription = await prisma.subscription.findFirst({
        where: {
          schoolId,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
          },
          endDate: {
            gte: new Date(),
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          endDate: "desc",
        },
      });

      // If no active subscription exists, fall back to checking if school has a basic plan or trial
      let plan = subscription?.plan;

      if (!plan) {
        // Fallback: If school is currently in TRIAL status in School model, find default Basic plan
        const school = await prisma.school.findUnique({
          where: { id: schoolId },
          select: { status: true },
        });

        if (school?.status === "TRIAL") {
          plan = await prisma.subscriptionPlan.findFirst({
            where: { isActive: true },
            orderBy: { price: "asc" },
          }) || undefined;
        }
      }

      if (!plan) {
        return res.status(403).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message:
            "Your school does not have an active subscription plan. Please renew or purchase a plan to add new records.",
        });
      }

      // Verify limits according to resourceType
      switch (resourceType) {
        case "STUDENT": {
          const currentCount = await prisma.student.count({
            where: {
              schoolId,
              isDeleted: false,
            },
          });

          if (currentCount >= plan.maxStudents) {
            return res.status(403).json({
              success: false,
              code: "QUOTA_EXCEEDED",
              resource: "STUDENT",
              limit: plan.maxStudents,
              currentCount,
              message: `Student capacity limit (${plan.maxStudents}) reached for the '${plan.name}' plan. Please upgrade your subscription to enroll more students.`,
            });
          }
          break;
        }

        case "TEACHER": {
          const currentCount = await prisma.teacher.count({
            where: {
              schoolId,
            },
          });

          if (currentCount >= plan.maxTeachers) {
            return res.status(403).json({
              success: false,
              code: "QUOTA_EXCEEDED",
              resource: "TEACHER",
              limit: plan.maxTeachers,
              currentCount,
              message: `Teacher allocation limit (${plan.maxTeachers}) reached for the '${plan.name}' plan. Please upgrade your subscription to register more teachers.`,
            });
          }
          break;
        }

        case "ADMIN": {
          const currentCount = await prisma.user.count({
            where: {
              schoolId,
              role: RoleEnum.SCHOOL_ADMIN,
              isDeleted: false,
            },
          });

          if (currentCount >= plan.maxAdmins) {
            return res.status(403).json({
              success: false,
              code: "QUOTA_EXCEEDED",
              resource: "ADMIN",
              limit: plan.maxAdmins,
              currentCount,
              message: `Administrator limit (${plan.maxAdmins}) reached for the '${plan.name}' plan. Please upgrade your subscription to add more administrators.`,
            });
          }
          break;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
