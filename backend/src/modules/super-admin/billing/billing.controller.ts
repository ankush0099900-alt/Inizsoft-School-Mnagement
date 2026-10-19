import { Request, Response, NextFunction } from "express";
import {
  getBillingStatsService,
  getTransactionsService,
  getReviewQueueService,
  getPlatformPaymentSettingsService,
  updatePlatformPaymentSettingsService,
  approveTransactionService,
  rejectTransactionService,
} from "./billing.service";

export const getBillingStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await getBillingStatsService();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getTransactionsService(req.query as any);
    return res.status(200).json({
      success: true,
      data: result.transactions,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewQueue = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const queue = await getReviewQueueService();
    return res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformPaymentSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await getPlatformPaymentSettingsService(false);
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlatformPaymentSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.id;
    const settings = await updatePlatformPaymentSettingsService(userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Platform manual payment settings saved successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadQrCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No QR code file uploaded." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: "QR code uploaded successfully.",
      data: { url: fileUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const approveTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviewerId = (req as any).user?.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const { notes } = req.body;

    const result = await approveTransactionService(id, reviewerId, notes);

    return res.status(200).json({
      success: true,
      message: `Payment approved and school subscription ${result.subscription ? "activated" : "updated"} successfully.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviewerId = (req as any).user?.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const { reason } = req.body;

    const result = await rejectTransactionService(id, reviewerId, reason);

    return res.status(200).json({
      success: true,
      message: "Payment request marked as rejected.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
