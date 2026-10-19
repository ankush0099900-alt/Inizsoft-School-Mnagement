import { EnrollmentStatus, Gender, Prisma, RoleEnum } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { hashPassword } from "../../../utils/bcrypt";

interface StudentListQuery {
  page?: number;
  limit?: number;
  search?: string;
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  sortBy?: "name" | "admissionNo" | "createdAt";
  sortOrder?: "asc" | "desc";
}

interface CreateStudentData {
  fullName: string;
  email: string;
  phone?: string | null;
  password: string;
  avatar?: string | null;
  rollNo?: string | null;
  dob?: Date | null;
  gender?: Gender | null;
  address?: string | null;
  parentId?: string | null;
  guardianId?: string | null;
  admissionDate?: Date | null;
  bloodGroup?: string | null;
  academicYearId: string;
  classId: string;
  sectionId?: string | null;
  parentFullName?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
  parentOccupation?: string | null;
  parentPassword?: string | null;
  guardianFullName?: string | null;
  guardianRelationship?: string | null;
  guardianPhone?: string | null;
}

interface UpdateStudentData {
  fullName?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  avatar?: string | null;
  rollNo?: string | null;
  dob?: Date | null;
  gender?: Gender | null;
  address?: string | null;
  parentId?: string | null;
  guardianId?: string | null;
  admissionDate?: Date | null;
  bloodGroup?: string | null;
  academicYearId?: string;
  classId?: string;
  sectionId?: string | null;
  parentFullName?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
  parentOccupation?: string | null;
  guardianFullName?: string | null;
  guardianRelationship?: string | null;
  guardianPhone?: string | null;
}

const studentSelect = {
  id: true,
  schoolId: true,
  admissionNo: true,
  rollNo: true,
  dob: true,
  gender: true,
  address: true,
  parentId: true,
  guardianId: true,
  admissionDate: true,
  bloodGroup: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      status: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
    },
  },
  parent: {
    select: {
      id: true,
      occupation: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  enrollments: {
    where: {
      isDeleted: false,
    },
    orderBy: {
      enrolledAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      academicYearId: true,
      classId: true,
      sectionId: true,
      rollNo: true,
      status: true,
      enrolledAt: true,
      withdrawnAt: true,
      academicYear: {
        select: {
          id: true,
          name: true,
          code: true,
          isCurrent: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
        },
      },
      section: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.StudentSelect;

const userUploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "users",
);

const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const deleteAvatarFile = async (avatar?: string | null): Promise<void> => {
  if (!avatar || !avatar.startsWith("/uploads/users/")) {
    return;
  }

  const fileName = path.basename(avatar);

  if (!fileName || fileName === "." || fileName === "..") {
    return;
  }

  const filePath = path.join(userUploadDirectory, fileName);

  try {
    await fs.unlink(filePath);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
  }
};

const generateAdmissionNo = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
): Promise<string> => {
  const school = await tx.school.findUnique({
    where: { id: schoolId },
    select: { admissionSequence: true },
  });

  const existingStudents = await tx.student.findMany({
    where: {
      schoolId,
      admissionNo: { startsWith: "ADM" },
    },
    select: { admissionNo: true },
  });

  let maxNum = school?.admissionSequence ?? 0;
  for (const st of existingStudents) {
    const numPart = parseInt(st.admissionNo.replace("ADM", ""), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  }

  let nextSequence = maxNum + 1;
  let candidateAdmissionNo = `ADM${String(nextSequence).padStart(3, "0")}`;

  const existingSet = new Set(existingStudents.map((s) => s.admissionNo));
  while (existingSet.has(candidateAdmissionNo)) {
    nextSequence++;
    candidateAdmissionNo = `ADM${String(nextSequence).padStart(3, "0")}`;
  }

  await tx.school.update({
    where: { id: schoolId },
    data: {
      admissionSequence: nextSequence,
    },
  });

  return candidateAdmissionNo;
};

const validateParent = async (
  schoolId: string,
  parentId?: string | null,
): Promise<void> => {
  if (!parentId) {
    return;
  }

  const parent = await prisma.parent.findFirst({
    where: {
      id: parentId,
      schoolId,
      user: {
        isDeleted: false,
      },
    },
    select: {
      id: true,
    },
  });

  if (!parent) {
    throw new ApiError(400, "Invalid parent");
  }
};

const validateGuardian = async (
  schoolId: string,
  guardianId?: string | null,
): Promise<void> => {
  if (!guardianId) {
    return;
  }

  const guardian = await prisma.guardian.findFirst({
    where: {
      id: guardianId,
      schoolId,
      user: {
        isDeleted: false,
      },
    },
    select: {
      id: true,
    },
  });

  if (!guardian) {
    throw new ApiError(400, "Invalid guardian");
  }
};

const validateEnrollmentData = async (
  schoolId: string,
  academicYearId: string,
  classId: string,
  sectionId?: string | null,
  excludeStudentId?: string,
): Promise<void> => {
  const academicYear = await prisma.academicYear.findFirst({
    where: {
      id: academicYearId,
      schoolId,
      isDeleted: false,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!academicYear) {
    throw new ApiError(404, "Academic year not found");
  }

  const classRecord = await prisma.class.findFirst({
    where: {
      id: classId,
      schoolId,
    },
    select: {
      id: true,
    },
  });

  if (!classRecord) {
    throw new ApiError(404, "Class not found");
  }

  if (!sectionId) {
    return;
  }

  const section = await prisma.section.findFirst({
    where: {
      id: sectionId,
      classId,
      schoolId,
    },
    select: {
      id: true,
      capacity: true,
    },
  });

  if (!section) {
    throw new ApiError(404, "Section not found for selected class");
  }

  const activeEnrollmentCount = await prisma.enrollment.count({
    where: {
      schoolId,
      academicYearId,
      sectionId,
      status: EnrollmentStatus.ACTIVE,
      isDeleted: false,
      ...(excludeStudentId
        ? {
            studentId: {
              not: excludeStudentId,
            },
          }
        : {}),
    },
  });

  if (section.capacity !== null && activeEnrollmentCount >= section.capacity) {
    throw new ApiError(409, "Selected section is full");
  }
};

const getStudentOrThrow = async (schoolId: string, studentId: string) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
    select: studentSelect,
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return student;
};

const validateStudentListFilters = async (
  schoolId: string,
  query: StudentListQuery,
): Promise<void> => {
  if (query.academicYearId) {
    const academicYear = await prisma.academicYear.findFirst({
      where: {
        id: query.academicYearId,
        schoolId,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    if (!academicYear) {
      throw new ApiError(404, "Academic year not found");
    }
  }

  if (query.classId) {
    const classRecord = await prisma.class.findFirst({
      where: {
        id: query.classId,
        schoolId,
      },
      select: {
        id: true,
      },
    });

    if (!classRecord) {
      throw new ApiError(404, "Class not found");
    }
  }

  if (query.sectionId) {
    const section = await prisma.section.findFirst({
      where: {
        id: query.sectionId,
        schoolId,
      },
      select: {
        id: true,
        classId: true,
      },
    });

    if (!section) {
      throw new ApiError(404, "Section not found");
    }

    if (query.classId && section.classId !== query.classId) {
      throw new ApiError(400, "Section does not belong to the selected class");
    }
  }
};

export const getStudents = async (
  schoolId: string,
  query: StudentListQuery,
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const search = query.search?.trim();
  const academicYearId = query.academicYearId;
  const classId = query.classId;
  const sectionId = query.sectionId;
  const status = query.status;

  await validateStudentListFilters(schoolId, {
    ...query,
    page,
    limit,
  });

  const where: Prisma.StudentWhereInput = {
    schoolId,
    isDeleted: false,
    user: {
      isDeleted: false,
      ...(status ? { status } : {}),
    },
  };

  if (search) {
    where.OR = [
      {
        admissionNo: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        rollNo: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        user: {
          isDeleted: false,
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          isDeleted: false,
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const enrollmentWhere: Prisma.EnrollmentWhereInput = {
    isDeleted: false,
    status: EnrollmentStatus.ACTIVE,
  };

  if (academicYearId) {
    enrollmentWhere.academicYearId = academicYearId;
  }

  if (classId) {
    enrollmentWhere.classId = classId;
  }

  if (sectionId) {
    enrollmentWhere.sectionId = sectionId;
  }

  if (academicYearId || classId || sectionId) {
    where.enrollments = {
      some: enrollmentWhere,
    };
  }

  const orderBy: Prisma.StudentOrderByWithRelationInput =
    query.sortBy === "name"
      ? {
          user: {
            fullName: query.sortOrder ?? "desc",
          },
        }
      : query.sortBy === "admissionNo"
        ? {
            admissionNo: query.sortOrder ?? "desc",
          }
        : {
            createdAt: query.sortOrder ?? "desc",
          };

  const skip = (page - 1) * limit;

  const [students, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      select: studentSelect,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.student.count({
      where,
    }),
  ]);

  return {
    items: students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStudentById = async (schoolId: string, studentId: string) => {
  return getStudentOrThrow(schoolId, studentId);
};

export const createStudent = async (
  schoolId: string,
  data: CreateStudentData,
) => {
  const email = data.email.trim().toLowerCase();

  const existingEmail = await prisma.user.findFirst({
    where: {
      email,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  if (existingEmail) {
    throw new ApiError(409, "Email already exists");
  }

  await validateEnrollmentData(
    schoolId,
    data.academicYearId,
    data.classId,
    data.sectionId,
  );

  let resolvedParentId: string | null = data.parentId ?? null;
  let resolvedGuardianId: string | null = data.guardianId ?? null;

  const parentEmail = data.parentEmail?.trim().toLowerCase();
  const parentFullName = data.parentFullName?.trim();

  if (parentFullName && parentEmail) {
    if (parentEmail === email) {
      throw new ApiError(
        400,
        "Student email and parent email cannot be identical",
      );
    }

    const existingParentUser = await prisma.user.findFirst({
      where: {
        email: parentEmail,
        isDeleted: false,
      },
      select: {
        id: true,
        role: true,
        schoolId: true,
        parent: {
          select: {
            id: true,
            schoolId: true,
          },
        },
      },
    });

    if (existingParentUser) {
      if (
        existingParentUser.role === RoleEnum.PARENT &&
        existingParentUser.parent &&
        existingParentUser.parent.schoolId === schoolId
      ) {
        resolvedParentId = existingParentUser.parent.id;
        if (data.parentOccupation || data.parentPhone || data.parentFullName) {
          await prisma.parent.update({
            where: { id: existingParentUser.parent.id },
            data: {
              occupation: data.parentOccupation?.trim() || undefined,
            },
          });
          await prisma.user.update({
            where: { id: existingParentUser.id },
            data: {
              fullName: parentFullName,
              phone: data.parentPhone?.trim() || undefined,
            },
          });
        }
      } else {
        throw new ApiError(
          409,
          "Parent email is already registered to another user account",
        );
      }
    }
  } else if (resolvedParentId) {
    await validateParent(schoolId, resolvedParentId);
  }

  if (resolvedGuardianId) {
    await validateGuardian(schoolId, resolvedGuardianId);
  }

  const hashedPassword = await hashPassword(data.password);

  try {
    const studentId = await prisma.$transaction(async (tx) => {
      // Create Parent atomically if provided and not already existing
      if (parentFullName && parentEmail && !resolvedParentId) {
        const parentPassword = data.parentPassword?.trim() || "Parent@123";
        const hashedParentPassword = await hashPassword(parentPassword);

        const parentUser = await tx.user.create({
          data: {
            schoolId,
            fullName: parentFullName,
            email: parentEmail,
            phone: data.parentPhone?.trim() || null,
            password: hashedParentPassword,
            role: RoleEnum.PARENT,
          },
          select: { id: true },
        });

        const createdParent = await tx.parent.create({
          data: {
            schoolId,
            userId: parentUser.id,
            occupation: data.parentOccupation?.trim() || null,
            address: data.address?.trim() || null,
          },
          select: { id: true },
        });

        resolvedParentId = createdParent.id;
      }

      // Create Guardian atomically if provided and not already existing
      const guardianFullName = data.guardianFullName?.trim();
      if (guardianFullName && !resolvedGuardianId) {
        const createdGuardian = await tx.guardian.create({
          data: {
            schoolId,
            fullName: guardianFullName,
            relationship: data.guardianRelationship?.trim() || null,
            phone: data.guardianPhone?.trim() || null,
          },
          select: { id: true },
        });
        resolvedGuardianId = createdGuardian.id;
      }

      const admissionNo = await generateAdmissionNo(tx, schoolId);

      const user = await tx.user.create({
        data: {
          schoolId,
          fullName: data.fullName.trim(),
          email,
          phone: data.phone ?? null,
          password: hashedPassword,
          avatar: data.avatar ?? null,
          role: RoleEnum.STUDENT,
        },
        select: {
          id: true,
        },
      });

      const student = await tx.student.create({
        data: {
          schoolId,
          userId: user.id,
          admissionNo,
          rollNo: data.rollNo ?? null,
          dob: data.dob ?? null,
          gender: data.gender ?? null,
          address: data.address ?? null,
          admissionDate: data.admissionDate ?? null,
          bloodGroup: data.bloodGroup ?? null,
          parentId: resolvedParentId,
          guardianId: resolvedGuardianId,
        },
        select: {
          id: true,
        },
      });

      await tx.enrollment.create({
        data: {
          schoolId,
          academicYearId: data.academicYearId,
          studentId: student.id,
          classId: data.classId,
          sectionId: data.sectionId ?? null,
          rollNo: data.rollNo ?? null,
          status: EnrollmentStatus.ACTIVE,
        },
      });

      return student.id;
    });

    return getStudentOrThrow(schoolId, studentId);
  } catch (error) {
    if (data.avatar) {
      await deleteAvatarFile(data.avatar);
    }

    if (isUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Student with the provided unique information already exists",
      );
    }

    throw error;
  }
};

export const updateStudent = async (
  schoolId: string,
  studentId: string,
  data: UpdateStudentData,
) => {
  const existingStudent = await getStudentOrThrow(schoolId, studentId);

  const email = data.email?.trim().toLowerCase();
  const oldAvatar = existingStudent.user.avatar;
  const newAvatar = data.avatar;

  if (email && email !== existingStudent.user.email) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
        NOT: {
          id: existingStudent.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingEmail) {
      throw new ApiError(409, "Email already exists");
    }
  }

  let resolvedParentId = data.parentId;
  let resolvedGuardianId = data.guardianId;

  const parentFullName = data.parentFullName?.trim();
  const parentEmail = data.parentEmail?.trim().toLowerCase();

  if (
    parentFullName ||
    parentEmail ||
    data.parentOccupation ||
    data.parentPhone
  ) {
    if (existingStudent.parentId) {
      const currentParent = await prisma.parent.findUnique({
        where: { id: existingStudent.parentId },
        include: { user: true },
      });
      if (currentParent) {
        if (parentEmail && parentEmail !== currentParent.user.email) {
          const duplicateEmail = await prisma.user.findFirst({
            where: {
              email: parentEmail,
              isDeleted: false,
              NOT: { id: currentParent.userId },
            },
            select: { id: true },
          });
          if (duplicateEmail) {
            throw new ApiError(
              409,
              "Parent email already exists for another user",
            );
          }
        }
        await prisma.user.update({
          where: { id: currentParent.userId },
          data: {
            fullName: parentFullName || undefined,
            email: parentEmail || undefined,
            phone:
              data.parentPhone !== undefined ? data.parentPhone : undefined,
          },
        });
        if (data.parentOccupation !== undefined) {
          await prisma.parent.update({
            where: { id: currentParent.id },
            data: {
              occupation: data.parentOccupation?.trim() || null,
            },
          });
        }
      }
    } else if (parentFullName && parentEmail) {
      const existingParentUser = await prisma.user.findFirst({
        where: { email: parentEmail, isDeleted: false },
        include: { parent: true },
      });
      if (
        existingParentUser?.role === RoleEnum.PARENT &&
        existingParentUser.parent &&
        existingParentUser.parent.schoolId === schoolId
      ) {
        resolvedParentId = existingParentUser.parent.id;
      } else if (!existingParentUser) {
        const hashedPPassword = await hashPassword("Parent@123");
        const newParentUser = await prisma.user.create({
          data: {
            schoolId,
            fullName: parentFullName,
            email: parentEmail,
            phone: data.parentPhone?.trim() || null,
            password: hashedPPassword,
            role: RoleEnum.PARENT,
          },
          select: { id: true },
        });
        const newParent = await prisma.parent.create({
          data: {
            schoolId,
            userId: newParentUser.id,
            occupation: data.parentOccupation?.trim() || null,
          },
          select: { id: true },
        });
        resolvedParentId = newParent.id;
      } else {
        throw new ApiError(
          409,
          "Parent email already exists for another account",
        );
      }
    }
  }

  const guardianFullName = data.guardianFullName?.trim();
  if (guardianFullName || data.guardianRelationship || data.guardianPhone) {
    if (existingStudent.guardianId) {
      await prisma.guardian.update({
        where: { id: existingStudent.guardianId },
        data: {
          fullName: guardianFullName || undefined,
          relationship:
            data.guardianRelationship !== undefined
              ? data.guardianRelationship
              : undefined,
          phone:
            data.guardianPhone !== undefined ? data.guardianPhone : undefined,
        },
      });
    } else if (guardianFullName) {
      const newGuardian = await prisma.guardian.create({
        data: {
          schoolId,
          fullName: guardianFullName,
          relationship: data.guardianRelationship?.trim() || null,
          phone: data.guardianPhone?.trim() || null,
        },
        select: { id: true },
      });
      resolvedGuardianId = newGuardian.id;
    }
  }

  if (resolvedParentId && resolvedParentId !== existingStudent.parentId) {
    await validateParent(schoolId, resolvedParentId);
  }
  if (resolvedGuardianId && resolvedGuardianId !== existingStudent.guardianId) {
    await validateGuardian(schoolId, resolvedGuardianId);
  }

  const currentEnrollment =
    existingStudent.enrollments.find(
      (enrollment) => enrollment.status === EnrollmentStatus.ACTIVE,
    ) ?? existingStudent.enrollments[0];

  const enrollmentChanged =
    data.academicYearId !== undefined ||
    data.classId !== undefined ||
    data.sectionId !== undefined ||
    data.rollNo !== undefined;

  let enrollmentAcademicYearId = currentEnrollment?.academicYearId;
  let enrollmentClassId = currentEnrollment?.classId;
  let enrollmentSectionId = currentEnrollment?.sectionId ?? null;

  if (enrollmentChanged) {
    enrollmentAcademicYearId =
      data.academicYearId ?? currentEnrollment?.academicYearId;

    enrollmentClassId = data.classId ?? currentEnrollment?.classId;

    enrollmentSectionId =
      data.sectionId !== undefined
        ? data.sectionId
        : (currentEnrollment?.sectionId ?? null);

    if (!enrollmentAcademicYearId || !enrollmentClassId) {
      throw new ApiError(400, "Academic year and class are required");
    }

    await validateEnrollmentData(
      schoolId,
      enrollmentAcademicYearId,
      enrollmentClassId,
      enrollmentSectionId,
      studentId,
    );
  }

  const hashedPassword = data.password
    ? await hashPassword(data.password)
    : undefined;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: existingStudent.user.id,
        },
        data: {
          ...(data.fullName !== undefined
            ? {
                fullName: data.fullName.trim(),
              }
            : {}),
          ...(email !== undefined
            ? {
                email,
              }
            : {}),
          ...(data.phone !== undefined
            ? {
                phone: data.phone,
              }
            : {}),
          ...(hashedPassword
            ? {
                password: hashedPassword,
              }
            : {}),
          ...(newAvatar !== undefined
            ? {
                avatar: newAvatar,
              }
            : {}),
          status: "ACTIVE",
        },
      });

      await tx.student.update({
        where: {
          id: studentId,
        },
        data: {
          ...(data.rollNo !== undefined
            ? {
                rollNo: data.rollNo,
              }
            : {}),
          ...(data.dob !== undefined
            ? {
                dob: data.dob,
              }
            : {}),
          ...(data.gender !== undefined
            ? {
                gender: data.gender,
              }
            : {}),
          ...(data.address !== undefined
            ? {
                address: data.address,
              }
            : {}),
          ...(data.admissionDate !== undefined
            ? {
                admissionDate: data.admissionDate,
              }
            : {}),
          ...(data.bloodGroup !== undefined
            ? {
                bloodGroup: data.bloodGroup,
              }
            : {}),
          ...(resolvedParentId !== undefined
            ? {
                parentId: resolvedParentId,
              }
            : {}),
          ...(resolvedGuardianId !== undefined
            ? {
                guardianId: resolvedGuardianId,
              }
            : {}),
        },
      });

      if (enrollmentChanged) {
        if (!enrollmentAcademicYearId || !enrollmentClassId) {
          throw new ApiError(400, "Academic year and class are required");
        }

        const existingEnrollmentForYear = await tx.enrollment.findFirst({
          where: {
            schoolId,
            academicYearId: enrollmentAcademicYearId,
            studentId,
          },
        });

        if (existingEnrollmentForYear) {
          await tx.enrollment.update({
            where: {
              id: existingEnrollmentForYear.id,
            },
            data: {
              classId: enrollmentClassId,
              sectionId: enrollmentSectionId,
              rollNo:
                data.rollNo !== undefined
                  ? data.rollNo
                  : (existingEnrollmentForYear.rollNo ?? null),
              status: EnrollmentStatus.ACTIVE,
              withdrawnAt: null,
              isDeleted: false,
              deletedAt: null,
            },
          });
        } else if (currentEnrollment) {
          await tx.enrollment.update({
            where: {
              id: currentEnrollment.id,
            },
            data: {
              academicYearId: enrollmentAcademicYearId,
              classId: enrollmentClassId,
              sectionId: enrollmentSectionId,
              rollNo:
                data.rollNo !== undefined
                  ? data.rollNo
                  : (currentEnrollment.rollNo ?? null),
              status: EnrollmentStatus.ACTIVE,
              withdrawnAt: null,
              isDeleted: false,
              deletedAt: null,
            },
          });
        } else {
          await tx.enrollment.create({
            data: {
              schoolId,
              academicYearId: enrollmentAcademicYearId,
              studentId,
              classId: enrollmentClassId,
              sectionId: enrollmentSectionId,
              rollNo: data.rollNo ?? null,
              status: EnrollmentStatus.ACTIVE,
            },
          });
        }
      }
    });

    if (newAvatar && oldAvatar && oldAvatar !== newAvatar) {
      await deleteAvatarFile(oldAvatar);
    }

    return getStudentOrThrow(schoolId, studentId);
  } catch (error) {
    if (newAvatar && newAvatar !== oldAvatar) {
      await deleteAvatarFile(newAvatar);
    }

    if (isUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Student with the provided unique information already exists",
      );
    }

    throw error;
  }
};

export const deleteStudent = async (schoolId: string, studentId: string) => {
  const student = await getStudentOrThrow(schoolId, studentId);

  const now = new Date();
  const avatar = student.user.avatar;

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.updateMany({
      where: {
        schoolId,
        studentId,
        isDeleted: false,
        status: EnrollmentStatus.ACTIVE,
      },
      data: {
        status: EnrollmentStatus.WITHDRAWN,
        withdrawnAt: now,
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.student.update({
      where: {
        id: studentId,
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.user.update({
      where: {
        id: student.user.id,
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });
  });

  if (avatar) {
    await deleteAvatarFile(avatar);
  }

  return {
    id: studentId,
  };
};
