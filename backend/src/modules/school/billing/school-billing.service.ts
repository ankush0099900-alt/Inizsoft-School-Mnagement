import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import {
  TransactionStatus,
  PaymentChannel,
  SubscriptionOperation,
  RoleEnum,
} from "@prisma/client";

export const getSchoolSubscriptionService = async (schoolId: string) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
      isActive: true,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  // 1. Current active or latest subscription
  const currentSubscription = await prisma.subscription.findFirst({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    include: {
      plan: {
        include: {
          modules: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });

  // 2. Current resource usage
  const [studentsCount, teachersCount, adminsCount, allPlans, paymentSetting] =
    await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.teacher.count({ where: { schoolId } }),
      prisma.user.count({
        where: {
          schoolId,
          role: RoleEnum.SCHOOL_ADMIN,
        },
      }),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
        include: {
          modules: {
            include: {
              module: true,
            },
          },
        },
      }),
      prisma.platformPaymentSetting.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const now = new Date();
  let daysRemaining = 0;
  let isExpired = false;

  if (currentSubscription) {
    const end = new Date(currentSubscription.endDate);
    const diffTime = end.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    isExpired = diffTime < 0 || currentSubscription.status === "EXPIRED";
  }

  const maxStudents = currentSubscription?.plan?.maxStudents ?? 250;
  const maxTeachers = currentSubscription?.plan?.maxTeachers ?? 20;
  const maxAdmins = currentSubscription?.plan?.maxAdmins ?? 3;

  const currentPlanPrice = Number(currentSubscription?.plan?.price || 0);

  // Enrich available plans with upgrade amount differences
  const enrichedPlans = allPlans.map((plan) => {
    const planPrice = Number(plan.price);
    const isHigherTier = planPrice > currentPlanPrice;
    const upgradeDifference = isHigherTier ? planPrice - currentPlanPrice : 0;

    return {
      ...plan,
      isHigherTier,
      upgradeDifference,
    };
  });

  return {
    school,
    subscription: currentSubscription,
    daysRemaining,
    isExpired,
    usage: {
      students: {
        current: studentsCount,
        max: maxStudents,
        percentage: Math.min(
          100,
          Math.round((studentsCount / maxStudents) * 100),
        ),
      },
      teachers: {
        current: teachersCount,
        max: maxTeachers,
        percentage: Math.min(
          100,
          Math.round((teachersCount / maxTeachers) * 100),
        ),
      },
      admins: {
        current: adminsCount,
        max: maxAdmins,
        percentage: Math.min(100, Math.round((adminsCount / maxAdmins) * 100)),
      },
    },
    availablePlans: enrichedPlans,
    paymentSettingsConfigured: Boolean(paymentSetting),
    paymentSettings: paymentSetting
      ? {
          beneficiaryName: paymentSetting.beneficiaryName,
          upiId: paymentSetting.upiId,
          qrCodeUrl: paymentSetting.qrCodeUrl,
          bankName: paymentSetting.bankName,
          accountNumber: paymentSetting.accountNumber,
          ifscCode: paymentSetting.ifscCode,
          accountType: paymentSetting.accountType,
          branchName: paymentSetting.branchName,
          paymentInstructions: paymentSetting.paymentInstructions,
        }
      : null,
  };
};

export const getSchoolTransactionsService = async (schoolId: string) => {
  return prisma.subscriptionTransaction.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          code: true,
          price: true,
          durationInDays: true,
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
    },
  });
};

export const submitManualPaymentService = async (
  schoolId: string,
  data: {
    planId: string;
    operation?: SubscriptionOperation;
    paymentDate?: string | Date;
    channel: PaymentChannel;
    transactionReference: string;
    proofDocumentUrl?: string;
    notes?: string;
  },
) => {
  if (!data.transactionReference?.trim()) {
    throw new ApiError(400, "Transaction reference / UTR number is required.");
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: data.planId },
  });

  if (!plan) {
    throw new ApiError(404, "Subscription plan not found.");
  }

  // Prevent duplicate UTRs across pending or completed requests
  const trimmedRef = data.transactionReference.trim();
  const existingTx = await prisma.subscriptionTransaction.findFirst({
    where: {
      transactionReference: { equals: trimmedRef, mode: "insensitive" },
      status: { in: [TransactionStatus.PENDING, TransactionStatus.COMPLETED] },
    },
    include: { school: true },
  });

  if (existingTx) {
    throw new ApiError(
      409,
      `A payment request with reference/UTR "${trimmedRef}" has already been submitted or completed. Duplicate references are not allowed.`,
    );
  }

  // Determine Operation and Amount
  const currentSub = await prisma.subscription.findFirst({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });

  const now = new Date();
  const hasActiveSub =
    currentSub &&
    currentSub.status === "ACTIVE" &&
    new Date(currentSub.endDate).getTime() > now.getTime();

  let operation: SubscriptionOperation =
    data.operation || SubscriptionOperation.PURCHASE;
  let payableAmount = Number(plan.price);

  if (operation === SubscriptionOperation.UPGRADE) {
    if (!hasActiveSub) {
      throw new ApiError(
        400,
        "Cannot upgrade plan because there is no active subscription. Please select Purchase instead.",
      );
    }

    const currentPrice = Number(currentSub.plan.price);
    const targetPrice = Number(plan.price);

    if (targetPrice <= currentPrice) {
      throw new ApiError(
        400,
        `Cannot upgrade to ${plan.name} because it is not a higher tier than your current plan (${currentSub.plan.name}).`,
      );
    }

    // Upgrade amount is the difference!
    payableAmount = targetPrice - currentPrice;
  } else if (operation === SubscriptionOperation.RENEW) {
    if (!currentSub) {
      throw new ApiError(
        400,
        "No prior subscription found to renew. Please choose Purchase instead.",
      );
    }
    payableAmount = Number(plan.price);
  } else {
    operation = SubscriptionOperation.PURCHASE;
    payableAmount = Number(plan.price);
  }

  const paymentDate = data.paymentDate ? new Date(data.paymentDate) : now;

  const transaction = await prisma.subscriptionTransaction.create({
    data: {
      schoolId,
      planId: data.planId,
      operation,
      amount: payableAmount,
      currency: plan.currency || "INR",
      channel: data.channel,
      status: TransactionStatus.PENDING,
      paymentDate,
      transactionReference: trimmedRef,
      proofDocumentUrl: data.proofDocumentUrl || null,
      reviewNotes: data.notes
        ? `Submitted by school: ${data.notes.trim()}`
        : null,
    },
    include: {
      plan: true,
    },
  });

  return transaction;
};
