import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { SubscriptionStatus, Prisma } from "@prisma/client";
import { ANALYTICS_LIMIT } from "../analytics/analytics.constants";

interface SubscriptionQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionStatus;
}

const subscriptionInclude = {
  school: {
    select: {
      id: true,
      name: true,
    },
  },
  plan: {
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      price: true,
      currency: true,
      durationInDays: true,
      maxStudents: true,
      maxTeachers: true,
      maxAdmins: true,
      isActive: true,
    },
  },
};

export const createSubscriptionService = async (data: any) => {
  const school = await prisma.school.findUnique({
    where: {
      id: data.schoolId,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: {
      id: data.planId,
    },
    include: {
      modules: true,
    },
  });

  if (!plan) {
    throw new ApiError(404, "Subscription plan not found");
  }

  if (!plan.isActive) {
    throw new ApiError(400, "Cannot create subscription with inactive plan");
  }

  // Check for currently active/running subscription for this school
  const activeExisting = await prisma.subscription.findFirst({
    where: {
      schoolId: data.schoolId,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
      },
      endDate: {
        gte: new Date(),
      },
    },
  });

  if (activeExisting) {
    throw new ApiError(
      409,
      "An active subscription already exists for this school. Please renew or upgrade the existing subscription instead.",
    );
  }

  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  let endDate: Date;

  if (data.endDate) {
    endDate = new Date(data.endDate);
  } else {
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (plan.durationInDays || 365));
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new ApiError(400, "Invalid subscription dates provided");
  }

  if (startDate >= endDate) {
    throw new ApiError(400, "End date must be greater than start date");
  }

  const amount =
    data.amount !== undefined && data.amount !== "" && Number(data.amount) >= 0
      ? Number(data.amount)
      : Number(plan.price);
  const discount = Number(data.discount || 0);
  const tax = Number(data.tax || 0);
  const finalAmount =
    data.finalAmount !== undefined && data.finalAmount !== ""
      ? Number(data.finalAmount)
      : amount - discount + tax;

  const subscriptionStatus = data.status ?? SubscriptionStatus.ACTIVE;

  return prisma.$transaction(async (tx) => {
    // 1. Create Subscription
    const subscription = await tx.subscription.create({
      data: {
        schoolId: data.schoolId,
        planId: data.planId,
        startDate,
        endDate,
        status: subscriptionStatus,
        amount,
        discount,
        tax,
        finalAmount,
      },
      include: subscriptionInclude,
    });

    // 2. Update School status if ACTIVE or TRIAL
    if (
      subscriptionStatus === SubscriptionStatus.ACTIVE ||
      subscriptionStatus === SubscriptionStatus.TRIAL
    ) {
      await tx.school.update({
        where: { id: data.schoolId },
        data: {
          status:
            subscriptionStatus === SubscriptionStatus.ACTIVE
              ? "ACTIVE"
              : "TRIAL",
          isActive: true,
        },
      });
    }

    // 3. Sync plan modules to school modules
    if (plan.modules && plan.modules.length > 0) {
      for (const pm of plan.modules) {
        await tx.schoolModule.upsert({
          where: {
            schoolId_moduleId: {
              schoolId: data.schoolId,
              moduleId: pm.moduleId,
            },
          },
          create: {
            schoolId: data.schoolId,
            moduleId: pm.moduleId,
            enabled: true,
          },
          update: {
            enabled: true,
          },
        });
      }
    }

    return subscription;
  });
};

export const getSchoolSubscriptionsService = async (schoolId: string) => {
  const school = await prisma.school.findUnique({
    where: {
      id: schoolId,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  return prisma.subscription.findMany({
    where: {
      schoolId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: subscriptionInclude,
  });
};

export const getSubscriptionsService = async (
  query: SubscriptionQuery = {},
) => {
  const { page = 1, limit = ANALYTICS_LIMIT, search, status } = query;

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100));

  const where: Prisma.SubscriptionWhereInput = {};

  if (search?.trim()) {
    const searchValue = search.trim();

    where.OR = [
      {
        school: {
          name: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
      },
      {
        plan: {
          name: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
      },
      {
        plan: {
          code: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [total, subscriptions] = await prisma.$transaction([
    prisma.subscription.count({
      where,
    }),
    prisma.subscription.findMany({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy: {
        createdAt: "desc",
      },
      include: subscriptionInclude,
    }),
  ]);

  return {
    data: subscriptions,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      hasNext: safePage * safeLimit < total,
      hasPrevious: safePage > 1,
    },
  };
};

export const getSubscriptionByIdService = async (id: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id,
    },
    include: subscriptionInclude,
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  return subscription;
};

export const updateSubscriptionService = async (id: string, data: any) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id,
    },
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (data.schoolId && data.schoolId !== subscription.schoolId) {
    const school = await prisma.school.findUnique({
      where: {
        id: data.schoolId,
      },
    });

    if (!school) {
      throw new ApiError(404, "School not found");
    }

    const existing = await prisma.subscription.findFirst({
      where: {
        schoolId: data.schoolId,
        id: {
          not: id,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, "Subscription already exists for this school");
    }
  }

  if (data.planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: data.planId,
      },
    });

    if (!plan) {
      throw new ApiError(404, "Subscription plan not found");
    }

    if (!plan.isActive) {
      throw new ApiError(400, "Cannot assign an inactive plan");
    }
  }

  const startDate = data.startDate
    ? new Date(data.startDate)
    : subscription.startDate;

  const endDate = data.endDate ? new Date(data.endDate) : subscription.endDate;

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new ApiError(400, "Invalid subscription dates");
  }

  if (startDate >= endDate) {
    throw new ApiError(400, "End date must be greater than start date");
  }

  return prisma.subscription.update({
    where: {
      id,
    },
    data: {
      ...(data.schoolId !== undefined && {
        schoolId: data.schoolId,
      }),
      ...(data.planId !== undefined && {
        planId: data.planId,
      }),
      ...(data.startDate !== undefined && {
        startDate,
      }),
      ...(data.endDate !== undefined && {
        endDate,
      }),
      ...(data.status !== undefined && {
        status: data.status,
      }),
      ...(data.amount !== undefined && {
        amount: data.amount,
      }),
      ...(data.discount !== undefined && {
        discount: data.discount,
      }),
      ...(data.tax !== undefined && {
        tax: data.tax,
      }),
      ...(data.finalAmount !== undefined && {
        finalAmount: data.finalAmount,
      }),
    },
    include: subscriptionInclude,
  });
};

export const updateSubscriptionStatusService = async (
  id: string,
  status: SubscriptionStatus,
) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id,
    },
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  return prisma.subscription.update({
    where: {
      id,
    },
    data: {
      status,
    },
    include: subscriptionInclude,
  });
};

export const deleteSubscriptionService = async (id: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id,
    },
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  await prisma.subscription.delete({
    where: {
      id,
    },
  });

  return true;
};

export const renewSubscriptionService = async (id: string, endDate: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id,
    },
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  const newEndDate = new Date(endDate);

  if (Number.isNaN(newEndDate.getTime())) {
    throw new ApiError(400, "Invalid end date");
  }

  if (newEndDate <= new Date()) {
    throw new ApiError(400, "End date must be a future date");
  }

  if (newEndDate <= subscription.startDate) {
    throw new ApiError(400, "End date must be greater than start date");
  }

  return prisma.subscription.update({
    where: {
      id,
    },
    data: {
      endDate: newEndDate,
      status: SubscriptionStatus.ACTIVE,
    },
    include: subscriptionInclude,
  });
};

export const getActiveSubscriptionsService = async () => {
  return prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
    },
    take: ANALYTICS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
    include: subscriptionInclude,
  });
};

export const getExpiredSubscriptionsService = async () => {
  return prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.EXPIRED,
    },
    take: ANALYTICS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
    include: subscriptionInclude,
  });
};

export const getSubscriptionStatsService = async () => {
  const [total, active, trial, expired, cancelled] = await Promise.all([
    prisma.subscription.count(),

    prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.count({
      where: {
        status: SubscriptionStatus.TRIAL,
      },
    }),

    prisma.subscription.count({
      where: {
        status: SubscriptionStatus.EXPIRED,
      },
    }),

    prisma.subscription.count({
      where: {
        status: SubscriptionStatus.CANCELLED,
      },
    }),
  ]);

  return {
    total,
    active,
    trial,
    expired,
    cancelled,
  };
};

export const getSubscriptionRevenueService = async () => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
    },
    select: {
      amount: true,
      discount: true,
      tax: true,
      finalAmount: true,
    },
  });

  return subscriptions.reduce(
    (acc, item) => {
      acc.amount += Number(item.amount);
      acc.discount += Number(item.discount);
      acc.tax += Number(item.tax);
      acc.finalAmount += Number(item.finalAmount);

      return acc;
    },
    {
      amount: 0,
      discount: 0,
      tax: 0,
      finalAmount: 0,
    },
  );
};
