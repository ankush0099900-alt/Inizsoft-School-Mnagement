import bcrypt from "bcryptjs";
import crypto from "crypto";
import { RoleEnum } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

interface LoginInput {
  email: string;
  password: string;
}

interface AuditData {
  ipAddress?: string;
  userAgent?: string;
}

const LOCK_THRESHOLD = 5;
const LOCK_MINUTES = 15;
const REFRESH_DAYS = 7;

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const loginUser = async (data: LoginInput, auditData?: AuditData) => {
  const email = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      school: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const now = new Date();

  if (user.lockedUntil && user.lockedUntil > now) {
    throw new ApiError(
      429,
      "Account temporarily locked. Please try again later.",
    );
  }

  if (user.lockedUntil && user.lockedUntil <= now) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
      },
    });

    user.failedLogins = 0;
    user.lockedUntil = null;
  }

  if (user.isDeleted || user.status !== "ACTIVE") {
    throw new ApiError(403, "Account is not active");
  }

  if (
    user.role !== RoleEnum.SUPER_ADMIN &&
    (!user.school || !["ACTIVE", "TRIAL"].includes(user.school.status))
  ) {
    throw new ApiError(403, "School account is suspended");
  }

  const passwordMatched = await bcrypt.compare(data.password, user.password);

  if (!passwordMatched) {
    const failedLogins = user.failedLogins + 1;
    const shouldLock = failedLogins >= LOCK_THRESHOLD;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: shouldLock ? LOCK_THRESHOLD : failedLogins,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
          : null,
      },
    });

    if (shouldLock) {
      throw new ApiError(
        429,
        "Too many failed login attempts. Account locked for 15 minutes.",
      );
    }

    throw new ApiError(401, "Invalid email or password");
  }

  const payload = {
    userId: user.id,
    schoolId: user.schoolId,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const tokenHash = hashToken(refreshToken);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: now,
        failedLogins: 0,
        lockedUntil: null,
      },
    });

    await tx.auditLog.create({
      data: {
        schoolId: user.schoolId,
        userId: user.id,
        action: "LOGIN",
        entity: "USER",
        entityId: user.id,
        module: "AUTH",
        ipAddress: auditData?.ipAddress,
        userAgent: auditData?.userAgent,
        meta: {
          login: true,
        },
      },
    });
  });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (storedToken.expiresAt <= new Date()) {
    await prisma.refreshToken.delete({
      where: {
        id: storedToken.id,
      },
    });

    throw new ApiError(401, "Refresh token expired");
  }

  if (
    payload.userId !== storedToken.userId ||
    payload.schoolId !== storedToken.schoolId
  ) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: storedToken.userId,
    },
  });

  if (!user || user.isDeleted || user.status !== "ACTIVE") {
    throw new ApiError(401, "User session is no longer active");
  }

  if (user.role !== payload.role) {
    throw new ApiError(401, "User role has changed. Please login again.");
  }

  if (user.role !== RoleEnum.SUPER_ADMIN && !user.schoolId) {
    throw new ApiError(401, "Invalid school session");
  }

  const jwtPayload = {
    userId: user.id,
    schoolId: user.schoolId,
    role: user.role,
  };

  const newAccessToken = generateAccessToken(jwtPayload);
  const newRefreshToken = generateRefreshToken(jwtPayload);
  const newHash = hashToken(newRefreshToken);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.delete({
      where: {
        id: storedToken.id,
      },
    });

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        schoolId: user.schoolId,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    await tx.auditLog.create({
      data: {
        schoolId: user.schoolId,
        userId: user.id,
        action: "REFRESH_TOKEN",
        entity: "USER",
        entityId: user.id,
        module: "AUTH",
      },
    });
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken?: string) => {
  if (!refreshToken) {
    return true;
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!storedToken) {
    return true;
  }

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({
      where: {
        tokenHash,
      },
    });

    await tx.auditLog.create({
      data: {
        schoolId: storedToken.schoolId,
        userId: storedToken.userId,
        action: "LOGOUT",
        entity: "USER",
        entityId: storedToken.userId,
        module: "AUTH",
      },
    });
  });

  return true;
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      schoolId: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      school: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
