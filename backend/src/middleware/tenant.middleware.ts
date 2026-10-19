import { Request, Response, NextFunction } from "express";
import { RoleEnum } from "@prisma/client";
import { prisma } from "../config/prisma";

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role === RoleEnum.SUPER_ADMIN) {
    req.tenant = {
      schoolId: null,
    };

    return next();
  }

  if (!req.user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "School context is required",
    });
  }

  try {
    const school = await prisma.school.findUnique({
      where: { id: req.user.schoolId },
      select: {
        id: true,
        isActive: true,
        isDeleted: true,
        status: true,
      },
    });

    if (!school || school.isDeleted || !school.isActive) {
      return res.status(403).json({
        success: false,
        code: "SCHOOL_INACTIVE",
        message: "This school account is inactive or has been deleted",
      });
    }

    if (school.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        code: "SCHOOL_SUSPENDED",
        message: "This school account is currently suspended. Please contact platform administration.",
      });
    }

    req.tenant = {
      schoolId: req.user.schoolId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
