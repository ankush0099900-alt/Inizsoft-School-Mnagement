import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import {
  TransactionStatus,
  PaymentChannel,
  SubscriptionOperation,
  Prisma,
} from "@prisma/client";

interface TransactionQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransactionStatus;
  channel?: PaymentChannel;
  operation?: SubscriptionOperation;
  schoolId?: string;
}

const transactionInclude = {
  school: {
    select: {
      id: true,
      name: true,
      code: true,
      email: true,
      phone: true,
      status: true,
    },
  },
  plan: {
    select: {
      id: true,
      name: true,
      code: true,
      price: true,
      durationInDays: true,
      maxStudents: true,
      maxTeachers: true,
      maxAdmins: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  subscription: {
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  },
};

export const getBillingStatsService = async () => {
  const [
    totalRevenueAgg,
    pendingReviewsCount,
    totalTransactionsCount,
    activeSubscriptionsCount,
    recentTransactions,
  ] = await Promise.all([
    prisma.subscriptionTransaction.aggregate({
      _sum: { amount: true },
      where: { status: TransactionStatus.COMPLETED },
    }),
    prisma.subscriptionTransaction.count({
      where: {
        status: TransactionStatus.PENDING,
        channel: {
          in: [
            PaymentChannel.MANUAL_BANK_TRANSFER,
            PaymentChannel.MANUAL_UPI,
            PaymentChannel.MANUAL_CASH,
            PaymentChannel.MANUAL_CHEQUE,
          ],
        },
      },
    }),
    prisma.subscriptionTransaction.count(),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
    }),
    prisma.subscriptionTransaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: transactionInclude,
    }),
  ]);

  return {
    totalRevenue: Number(totalRevenueAgg._sum.amount ?? 0),
    pendingReviewsCount,
    totalTransactionsCount,
    activeSubscriptionsCount,
    recentTransactions,
  };
};

export const getTransactionsService = async (query: TransactionQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.SubscriptionTransactionWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.channel) {
    where.channel = query.channel;
  }

  if (query.operation) {
    where.operation = query.operation;
  }

  if (query.schoolId) {
    where.schoolId = query.schoolId;
  }

  if (query.search) {
    const search = query.search.trim();
    where.OR = [
      { transactionReference: { contains: search, mode: "insensitive" } },
      { gatewayOrderId: { contains: search, mode: "insensitive" } },
      { gatewayPaymentId: { contains: search, mode: "insensitive" } },
      { school: { name: { contains: search, mode: "insensitive" } } },
      { school: { code: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, transactions] = await Promise.all([
    prisma.subscriptionTransaction.count({ where }),
    prisma.subscriptionTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: transactionInclude,
    }),
  ]);

  return {
    transactions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getReviewQueueService = async () => {
  return prisma.subscriptionTransaction.findMany({
    where: {
      status: TransactionStatus.PENDING,
      channel: {
        in: [
          PaymentChannel.MANUAL_BANK_TRANSFER,
          PaymentChannel.MANUAL_UPI,
          PaymentChannel.MANUAL_CASH,
          PaymentChannel.MANUAL_CHEQUE,
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    include: transactionInclude,
  });
};

export const getPlatformPaymentSettingsService = async (onlyActive = false) => {
  const setting = await prisma.platformPaymentSetting.findFirst({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return setting;
};

export const updatePlatformPaymentSettingsService = async (
  userId: string,
  data: {
    beneficiaryName: string;
    upiId: string;
    qrCodeUrl?: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountType?: string;
    branchName?: string;
    paymentInstructions?: string;
    isActive?: boolean;
  },
) => {
  if (!data.beneficiaryName?.trim()) throw new ApiError(400, "Beneficiary name is required");
  if (!data.upiId?.trim()) throw new ApiError(400, "UPI ID is required");
  if (!data.bankName?.trim()) throw new ApiError(400, "Bank name is required");
  if (!data.accountNumber?.trim()) throw new ApiError(400, "Account number is required");
  if (!data.ifscCode?.trim()) throw new ApiError(400, "IFSC code is required");

  const existing = await prisma.platformPaymentSetting.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    return prisma.platformPaymentSetting.update({
      where: { id: existing.id },
      data: {
        beneficiaryName: data.beneficiaryName.trim(),
        upiId: data.upiId.trim(),
        qrCodeUrl: data.qrCodeUrl !== undefined ? data.qrCodeUrl : existing.qrCodeUrl,
        bankName: data.bankName.trim(),
        accountNumber: data.accountNumber.trim(),
        ifscCode: data.ifscCode.trim().toUpperCase(),
        accountType: data.accountType || "CURRENT",
        branchName: data.branchName?.trim() || null,
        paymentInstructions: data.paymentInstructions?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
        updatedById: userId,
      },
    });
  }

  return prisma.platformPaymentSetting.create({
    data: {
      beneficiaryName: data.beneficiaryName.trim(),
      upiId: data.upiId.trim(),
      qrCodeUrl: data.qrCodeUrl || null,
      bankName: data.bankName.trim(),
      accountNumber: data.accountNumber.trim(),
      ifscCode: data.ifscCode.trim().toUpperCase(),
      accountType: data.accountType || "CURRENT",
      branchName: data.branchName?.trim() || null,
      paymentInstructions: data.paymentInstructions?.trim() || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      updatedById: userId,
    },
  });
};

export const approveTransactionService = async (
  transactionId: string,
  reviewerId: string,
  notes?: string,
) => {
  const transaction = await prisma.subscriptionTransaction.findUnique({
    where: { id: transactionId },
    include: {
      school: true,
      plan: {
        include: {
          modules: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction request not found");
  }

  if (transaction.status !== TransactionStatus.PENDING) {
    throw new ApiError(
      400,
      `Transaction cannot be approved because current status is ${transaction.status}`,
    );
  }

  // Prevent duplicate UTR approvals across system
  if (transaction.transactionReference) {
    const duplicateCompleted = await prisma.subscriptionTransaction.findFirst({
      where: {
        id: { not: transaction.id },
        transactionReference: transaction.transactionReference,
        status: TransactionStatus.COMPLETED,
      },
    });

    if (duplicateCompleted) {
      throw new ApiError(
        409,
        `Duplicate UTR: This reference (${transaction.transactionReference}) was already approved for another payment.`,
      );
    }
  }

  const now = new Date();
  const durationInDays = transaction.plan.durationInDays || 365;

  return prisma.$transaction(async (tx) => {
    let targetSubscriptionId: string;

    if (transaction.operation === SubscriptionOperation.PURCHASE) {
      // 1. PURCHASE: Start date = now, End date = now + 1 year
      const startDate = now;
      const endDate = new Date(now.getTime() + durationInDays * 24 * 60 * 60 * 1000);

      // Deactivate any old subscriptions
      await tx.subscription.updateMany({
        where: {
          schoolId: transaction.schoolId,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
        data: { status: "EXPIRED" },
      });

      const newSub = await tx.subscription.create({
        data: {
          schoolId: transaction.schoolId,
          planId: transaction.planId,
          startDate,
          endDate,
          status: "ACTIVE",
          amount: transaction.amount,
          discount: 0,
          tax: 0,
          finalAmount: transaction.amount,
        },
      });

      targetSubscriptionId = newSub.id;
    } else if (transaction.operation === SubscriptionOperation.RENEW) {
      // 2. RENEW:
      // If currently active: extend from existing endDate
      // If already expired: start new period from now
      const existingSub = await tx.subscription.findFirst({
        where: { schoolId: transaction.schoolId },
        orderBy: { createdAt: "desc" },
      });

      if (existingSub && new Date(existingSub.endDate).getTime() > now.getTime() && existingSub.status === "ACTIVE") {
        const currentEnd = new Date(existingSub.endDate);
        const newEndDate = new Date(currentEnd.getTime() + durationInDays * 24 * 60 * 60 * 1000);

        const updatedSub = await tx.subscription.update({
          where: { id: existingSub.id },
          data: {
            endDate: newEndDate,
            status: "ACTIVE",
            planId: transaction.planId,
          },
        });

        targetSubscriptionId = updatedSub.id;
      } else {
        // Expired renewal -> new annual period from now
        const startDate = now;
        const endDate = new Date(now.getTime() + durationInDays * 24 * 60 * 60 * 1000);

        if (existingSub) {
          await tx.subscription.update({
            where: { id: existingSub.id },
            data: { status: "EXPIRED" },
          });
        }

        const newSub = await tx.subscription.create({
          data: {
            schoolId: transaction.schoolId,
            planId: transaction.planId,
            startDate,
            endDate,
            status: "ACTIVE",
            amount: transaction.amount,
            discount: 0,
            tax: 0,
            finalAmount: transaction.amount,
          },
        });

        targetSubscriptionId = newSub.id;
      }
    } else if (transaction.operation === SubscriptionOperation.UPGRADE) {
      // 3. UPGRADE:
      // Keep existing expiry date unchanged!
      // Update planId to new upgraded tier
      const activeSub = await tx.subscription.findFirst({
        where: {
          schoolId: transaction.schoolId,
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
      });

      if (activeSub && new Date(activeSub.endDate).getTime() > now.getTime()) {
        const upgradedSub = await tx.subscription.update({
          where: { id: activeSub.id },
          data: {
            planId: transaction.planId,
          },
        });

        targetSubscriptionId = upgradedSub.id;
      } else {
        // Expired upgrade -> treat as new annual purchase
        const startDate = now;
        const endDate = new Date(now.getTime() + durationInDays * 24 * 60 * 60 * 1000);

        const newSub = await tx.subscription.create({
          data: {
            schoolId: transaction.schoolId,
            planId: transaction.planId,
            startDate,
            endDate,
            status: "ACTIVE",
            amount: transaction.amount,
            discount: 0,
            tax: 0,
            finalAmount: transaction.amount,
          },
        });

        targetSubscriptionId = newSub.id;
      }
    } else {
      throw new ApiError(400, "Unknown subscription operation");
    }

    // Update Transaction record
    const updatedTransaction = await tx.subscriptionTransaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        subscriptionId: targetSubscriptionId,
        reviewedById: reviewerId,
        reviewedAt: now,
        reviewNotes: notes || `Payment approved for ${transaction.operation.toLowerCase()}`,
      },
      include: transactionInclude,
    });

    // Activate the school
    await tx.school.update({
      where: { id: transaction.schoolId },
      data: {
        status: "ACTIVE",
        isActive: true,
      },
    });

    // Synchronize enabled modules from plan into SchoolModule
    const planModules = transaction.plan.modules;
    for (const pm of planModules) {
      await tx.schoolModule.upsert({
        where: {
          schoolId_moduleId: {
            schoolId: transaction.schoolId,
            moduleId: pm.moduleId,
          },
        },
        update: { enabled: true },
        create: {
          schoolId: transaction.schoolId,
          moduleId: pm.moduleId,
          enabled: true,
        },
      });
    }

    return updatedTransaction;
  });
};

export const rejectTransactionService = async (
  transactionId: string,
  reviewerId: string,
  reason: string,
) => {
  if (!reason || !reason.trim()) {
    throw new ApiError(400, "A reason is required when rejecting a payment request.");
  }

  const transaction = await prisma.subscriptionTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction request not found");
  }

  if (transaction.status !== TransactionStatus.PENDING) {
    throw new ApiError(
      400,
      `Transaction cannot be rejected because current status is ${transaction.status}`,
    );
  }

  const updatedTransaction = await prisma.subscriptionTransaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.REJECTED,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: reason.trim(),
      reviewNotes: `Rejected: ${reason.trim()}`,
    },
    include: transactionInclude,
  });

  return updatedTransaction;
};
