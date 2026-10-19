import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import {
  getSchoolSubscriptionService,
  getSchoolTransactionsService,
  submitManualPaymentService,
} from "./school-billing.service";
import { getPlatformPaymentSettingsService } from "../../super-admin/billing/billing.service";
import { ApiError } from "../../../utils/ApiError";
import { prisma } from "../../../config/prisma";

const getAuthenticatedSchoolId = (req: Request): string => {
  const request = req as any;

  const schoolId =
    request.schoolId ?? request.user?.schoolId ?? request.user?.school?.id;

  if (typeof schoolId !== "string" || !schoolId.trim()) {
    throw new ApiError(
      400,
      "School ID missing. Check authentication middleware.",
    );
  }

  return schoolId.trim();
};

export const getSchoolSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schoolId = getAuthenticatedSchoolId(req);
    const data = await getSchoolSubscriptionService(schoolId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSchoolTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schoolId = getAuthenticatedSchoolId(req);
    const data = await getSchoolTransactionsService(schoolId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSchoolPaymentSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await getPlatformPaymentSettingsService(true);

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const submitManualPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schoolId = getAuthenticatedSchoolId(req);
    const {
      planId,
      operation,
      paymentDate,
      channel,
      transactionReference,
      proofDocumentUrl,
      notes,
    } = req.body;

    const data = await submitManualPaymentService(schoolId, {
      planId,
      operation,
      paymentDate,
      channel,
      transactionReference,
      proofDocumentUrl,
      notes,
    });

    return res.status(201).json({
      success: true,
      message:
        "Manual payment details submitted successfully. It is now awaiting Super Admin verification.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPaymentSlip = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No slip file uploaded." });
    }

    const fileUrl = `/uploads/proofs/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: "Payment proof uploaded securely.",
      data: { url: fileUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentProofFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filename = String(req.params.filename);
    const user = (req as any).user;

    // Security check: only super admin or school admin of the transaction can view the proof
    if (user.role !== "SUPER_ADMIN") {
      const transaction = await prisma.subscriptionTransaction.findFirst({
        where: {
          proofDocumentUrl: { contains: filename },
          schoolId: user.schoolId,
        },
      });

      if (!transaction) {
        throw new ApiError(403, "Access denied to payment proof document.");
      }
    }

    const filePath = path.join(process.cwd(), "public/uploads/proofs", filename);
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, "Proof document not found.");
    }

    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
