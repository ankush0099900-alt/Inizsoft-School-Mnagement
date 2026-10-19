import { Request, Response, NextFunction } from "express";
import { RoleEnum } from "@prisma/client";
import { prisma } from "../config/prisma";

/**
 * Feature Guard Middleware
 *
 * Verifies that the tenant school has the required module enabled in its subscription / SchoolModule settings.
 * Super Admins bypass feature guards automatically.
 *
 * @param requiredModuleKeys One or more ERP module keys (case-insensitive).
 */
export const featureGuard = (...requiredModuleKeys: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      // Super Admins have unrestricted platform access
      if (req.user.role === RoleEnum.SUPER_ADMIN) {
        return next();
      }

      const schoolId = req.tenant?.schoolId || req.user.schoolId;
      if (!schoolId) {
        return res.status(403).json({
          success: false,
          code: "TENANT_REQUIRED",
          message: "School context required for module access",
        });
      }

      // Normalized target keys (uppercase)
      const targetKeys = requiredModuleKeys.map((k) => k.trim().toUpperCase());

      // Query enabled modules for this specific school
      const schoolModules = await prisma.schoolModule.findMany({
        where: {
          schoolId,
          enabled: true,
          module: {
            isActive: true,
          },
        },
        select: {
          module: {
            select: {
              key: true,
            },
          },
        },
      });

      const enabledKeys = new Set(
        schoolModules.map((sm) => sm.module.key.toUpperCase()),
      );

      // If school has explicit modules configured, check if required keys exist
      if (schoolModules.length > 0) {
        const hasAccess = targetKeys.some((key) => enabledKeys.has(key));
        if (hasAccess) {
          return next();
        }
      } else {
        // Fallback: If no SchoolModule rows exist yet, check if any global active module matches
        const globalModule = await prisma.eRPModule.findFirst({
          where: {
            key: {
              in: targetKeys,
              mode: "insensitive",
            },
            isActive: true,
          },
        });

        if (globalModule) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        code: "FEATURE_LOCKED",
        message: `The '${requiredModuleKeys[0]}' module is not enabled for your school. Please upgrade your subscription plan to unlock this feature.`,
        requiredFeature: requiredModuleKeys[0],
      });
    } catch (error) {
      next(error);
    }
  };
};
