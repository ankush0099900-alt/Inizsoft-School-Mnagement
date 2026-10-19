import { RoleEnum } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { generateSchoolData } from "../../../utils/generateSchool";
import { hashPassword } from "../../../utils/bcrypt";

interface CreateSchoolInput {
  name: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPassword?: string;
  ownerPhone?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  principal?: string;
  primaryColor?: string;
  secondaryColor?: string;
  slogan?: string;
  missionStatement?: string;
  visionStatement?: string;
  startHour?: string;
  closeHour?: string;
}

interface UpdateSchoolInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  principal?: string;
  primaryColor?: string;
  secondaryColor?: string;
  slogan?: string;
  missionStatement?: string;
  visionStatement?: string;
  startHour?: string;
  closeHour?: string;
  isActive?: boolean;
}

const ownerSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  schoolId: true,
  createdAt: true,
};

export const createSchoolService = async (
  data: CreateSchoolInput,
  file?: Express.Multer.File,
) => {
  if (!data.name?.trim()) {
    throw new ApiError(400, "School name is required");
  }

  if (
    (data.ownerEmail && !data.ownerPassword) ||
    (!data.ownerEmail && data.ownerPassword)
  ) {
    throw new ApiError(400, "Owner email and password are required together");
  }

  if (data.email) {
    const existingSchool = await prisma.school.findFirst({
      where: {
        email: data.email,
        isDeleted: false,
      },
    });

    if (existingSchool) {
      throw new ApiError(409, "School email already exists");
    }
  }

  if (data.phone) {
    const existingSchool = await prisma.school.findFirst({
      where: {
        phone: data.phone,
        isDeleted: false,
      },
    });

    if (existingSchool) {
      throw new ApiError(409, "School phone already exists");
    }
  }

  if (data.ownerEmail) {
    const existingOwner = await prisma.user.findUnique({
      where: {
        email: data.ownerEmail,
      },
    });

    if (existingOwner) {
      throw new ApiError(409, "Owner email already exists");
    }
  }

  const { code, slug } = await generateSchoolData(data.name);

  const logo = file ? `/uploads/${file.filename}` : data.logo;

  return prisma.$transaction(async (tx) => {
    const school = await tx.school.create({
      data: {
        name: data.name.trim(),
        code,
        slug,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logo,
        principal: data.principal,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        slogan: data.slogan,
        missionStatement: data.missionStatement,
        visionStatement: data.visionStatement,
        startHour: data.startHour,
        closeHour: data.closeHour,
      },
    });

    let owner = null;

    if (data.ownerEmail && data.ownerPassword) {
      const hashedPassword = await hashPassword(data.ownerPassword);

      owner = await tx.user.create({
        data: {
          fullName: data.ownerName ?? "School Admin",
          email: data.ownerEmail,
          phone: data.ownerPhone,
          password: hashedPassword,
          role: RoleEnum.SCHOOL_ADMIN,
          schoolId: school.id,
        },
      });

      await tx.school.update({
        where: {
          id: school.id,
        },
        data: {
          ownerId: owner.id,
        },
      });
    }

    const activeModules = await tx.eRPModule.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (activeModules.length > 0) {
      await tx.schoolModule.createMany({
        data: activeModules.map((m) => ({
          schoolId: school.id,
          moduleId: m.id,
          enabled: true,
          assignedBy: owner?.id,
        })),
        skipDuplicates: true,
      });
    }

    return {
      school,
      owner: owner
        ? {
            id: owner.id,
            fullName: owner.fullName,
            email: owner.email,
            phone: owner.phone,
            role: owner.role,
            schoolId: owner.schoolId,
          }
        : null,
    };
  });
};

export const getSchoolsService = async (page = 1, limit = 10, search = "") => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 10));

  const skip = (page - 1) * limit;
  const trimmedSearch = search.trim();

  const where = {
    isDeleted: false,
    ...(trimmedSearch
      ? {
          OR: [
            {
              name: {
                contains: trimmedSearch,
                mode: "insensitive" as const,
              },
            },
            {
              code: {
                contains: trimmedSearch,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: trimmedSearch,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [schools, total] = await Promise.all([
    prisma.school.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        logo: true,
        principal: true,
        primaryColor: true,
        secondaryColor: true,
        slogan: true,
        missionStatement: true,
        visionStatement: true,
        startHour: true,
        closeHour: true,
        status: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: ownerSelect,
        },
        _count: {
          select: {
            students: true,
            teachers: true,
            users: true,
          },
        },
      },
    }),
    prisma.school.count({
      where,
    }),
  ]);

  return {
    schools,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrevious: page > 1,
    },
  };
};

export const getSchoolByIdService = async (id: string) => {
  const school = await prisma.school.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      code: true,
      slug: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      logo: true,
      principal: true,
      primaryColor: true,
      secondaryColor: true,
      slogan: true,
      missionStatement: true,
      visionStatement: true,
      startHour: true,
      closeHour: true,
      status: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: ownerSelect,
      },
      modules: {
        where: {
          enabled: true,
        },
        select: {
          id: true,
          enabled: true,
          assignedAt: true,
          assignedBy: true,
          module: {
            select: {
              id: true,
              name: true,
              key: true,
              route: true,
              category: true,
              icon: true,
              isActive: true,
            },
          },
        },
      },
      _count: {
        select: {
          students: true,
          teachers: true,
          users: true,
        },
      },
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  return {
    ...school,
    stats: {
      students: school._count.students,
      teachers: school._count.teachers,
      users: school._count.users,
    },
  };
};

export const updateSchoolService = async (
  id: string,
  body: UpdateSchoolInput,
  file?: Express.Multer.File,
) => {
  const school = await prisma.school.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  if (body.email && body.email !== school.email) {
    const existingEmail = await prisma.school.findFirst({
      where: {
        email: body.email,
        isDeleted: false,
        NOT: {
          id,
        },
      },
    });

    if (existingEmail) {
      throw new ApiError(409, "School email already exists");
    }
  }

  if (body.phone && body.phone !== school.phone) {
    const existingPhone = await prisma.school.findFirst({
      where: {
        phone: body.phone,
        isDeleted: false,
        NOT: {
          id,
        },
      },
    });

    if (existingPhone) {
      throw new ApiError(409, "School phone already exists");
    }
  }

  const logo = file ? `/uploads/${file.filename}` : undefined;

  return prisma.school.update({
    where: {
      id,
    },
    data: {
      ...(body.name !== undefined && {
        name: body.name.trim(),
      }),
      ...(body.email !== undefined && {
        email: body.email,
      }),
      ...(body.phone !== undefined && {
        phone: body.phone,
      }),
      ...(body.address !== undefined && {
        address: body.address,
      }),
      ...(body.principal !== undefined && {
        principal: body.principal,
      }),
      ...(body.primaryColor !== undefined && {
        primaryColor: body.primaryColor,
      }),
      ...(body.secondaryColor !== undefined && {
        secondaryColor: body.secondaryColor,
      }),
      ...(body.slogan !== undefined && {
        slogan: body.slogan,
      }),
      ...(body.missionStatement !== undefined && {
        missionStatement: body.missionStatement,
      }),
      ...(body.visionStatement !== undefined && {
        visionStatement: body.visionStatement,
      }),
      ...(body.startHour !== undefined && {
        startHour: body.startHour,
      }),
      ...(body.closeHour !== undefined && {
        closeHour: body.closeHour,
      }),
      ...(body.isActive !== undefined && {
        isActive: body.isActive,
      }),
      ...(logo && {
        logo,
      }),
    },
    include: {
      owner: {
        select: ownerSelect,
      },
    },
  });
};

export const deleteSchoolService = async (id: string) => {
  const school = await prisma.school.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.school.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.updateMany({
      where: {
        schoolId: id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  });

  return {
    success: true,
    message: "School deleted successfully",
  };
};

export const updateSchoolStatusService = async (
  id: string,
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED",
) => {
  const school = await prisma.school.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  return prisma.school.update({
    where: {
      id,
    },
    data: {
      status,
    },
    include: {
      owner: {
        select: ownerSelect,
      },
    },
  });
};

export const updateSchoolAdminService = async (
  schoolId: string,
  data: {
    fullName: string;
    email: string;
    phone?: string;
  },
) => {
  const school = await prisma.school.findFirst({
    where: {
      id: schoolId,
      isDeleted: false,
    },
    include: {
      owner: true,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  if (!school.owner) {
    throw new ApiError(404, "School admin not assigned");
  }

  if (school.owner.role !== RoleEnum.SCHOOL_ADMIN) {
    throw new ApiError(400, "Invalid school owner");
  }

  if (data.email !== school.owner.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }
  }

  return prisma.user.update({
    where: {
      id: school.owner.id,
    },
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    },
    select: ownerSelect,
  });
};

export const resetSchoolAdminPasswordService = async (
  schoolId: string,
  newPassword: string,
) => {
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const school = await prisma.school.findFirst({
    where: {
      id: schoolId,
      isDeleted: false,
    },
    include: {
      owner: true,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  if (!school.owner) {
    throw new ApiError(404, "School admin not assigned");
  }

  if (school.owner.role !== RoleEnum.SCHOOL_ADMIN) {
    throw new ApiError(400, "Invalid school admin");
  }

  const hashedPassword = await hashPassword(newPassword);

  return prisma.user.update({
    where: {
      id: school.owner.id,
    },
    data: {
      password: hashedPassword,
    },
    select: ownerSelect,
  });
};

export const getSchoolAdminService = async (schoolId: string) => {
  const school = await prisma.school.findFirst({
    where: {
      id: schoolId,
      isDeleted: false,
    },
    include: {
      owner: true,
    },
  });

  if (!school) {
    throw new ApiError(404, "School not found");
  }

  if (!school.owner) {
    throw new ApiError(404, "School admin not assigned");
  }

  if (school.owner.role !== RoleEnum.SCHOOL_ADMIN) {
    throw new ApiError(400, "Invalid school admin");
  }

  return {
    id: school.owner.id,
    fullName: school.owner.fullName,
    email: school.owner.email,
    phone: school.owner.phone,
    role: school.owner.role,
    schoolId: school.owner.schoolId,
    createdAt: school.owner.createdAt,
  };
};
