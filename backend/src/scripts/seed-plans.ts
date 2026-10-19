import { prisma } from "../config/prisma";

export async function seedPlans() {
  console.log("⚡ Seeding dynamic subscription plans (Basic, Standard, Premium)...");

  // Fetch all existing ERP modules
  const allModules = await prisma.eRPModule.findMany();
  const moduleMap = new Map(allModules.map((m) => [m.key.toUpperCase(), m.id]));

  const basicModuleKeys = [
    "DASHBOARD",
    "STUDENTS",
    "TEACHERS",
    "PARENTS",
    "ACADEMIC_YEARS",
    "CLASSES",
    "SECTIONS",
    "SUBJECTS",
    "TIMETABLE",
    "ATTENDANCE",
    "COMMUNICATION",
    "NOTICES",
    "ANNOUNCEMENTS",
    "EVENTS",
    "NOTIFICATIONS",
    "SETTINGS",
    "HOME",
  ];

  const standardExtraModuleKeys = [
    "HOMEWORK",
    "ASSIGNMENTS",
    "EXAMS",
    "EXAM_SCHEDULE",
    "MARKS",
    "RESULTS",
    "REPORT_CARDS",
    "FEES",
    "FEE_STRUCTURES",
    "FEE_COLLECTION",
    "INVOICES",
    "PAYMENTS",
    "LEAVE_REQUESTS",
    "STAFF",
    "ADMISSIONS",
    "ENROLLMENTS",
  ];

  const premiumExtraModuleKeys = [
    "FINANCE",
    "LIBRARY",
    "BOOKS",
    "BOOK_ISSUE",
    "TRANSPORT",
    "VEHICLES",
    "TRANSPORT_ROUTES",
    "HOSTEL",
    "HOSTEL_ROOMS",
    "INVENTORY",
    "STOCK",
    "REPORTS",
    "ATTENDANCE_REPORTS",
    "FEE_REPORTS",
  ];

  const standardModuleKeys = [
    ...basicModuleKeys,
    ...standardExtraModuleKeys,
  ];

  const premiumModuleKeys = [
    ...standardModuleKeys,
    ...premiumExtraModuleKeys,
  ];

  const plans = [
    {
      code: "BASIC",
      name: "Basic",
      description: "Essential academic management for small institutions and coaching centers",
      price: 4999,
      currency: "INR",
      durationInDays: 365,
      maxStudents: 250,
      maxTeachers: 20,
      maxAdmins: 3,
      moduleKeys: basicModuleKeys,
    },
    {
      code: "STANDARD",
      name: "Standard",
      description: "Comprehensive ERP suite with exams, fee collection, homework, and reports",
      price: 9999,
      currency: "INR",
      durationInDays: 365,
      maxStudents: 1000,
      maxTeachers: 75,
      maxAdmins: 10,
      moduleKeys: standardModuleKeys,
    },
    {
      code: "PREMIUM",
      name: "Premium",
      description: "Enterprise school ERP with hostel, transport, library, and complete operations",
      price: 19999,
      currency: "INR",
      durationInDays: 365,
      maxStudents: 3500,
      maxTeachers: 250,
      maxAdmins: 25,
      moduleKeys: premiumModuleKeys,
    },
  ];

  for (const planData of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { code: planData.code },
    });

    let planId: string;

    if (existing) {
      const updated = await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: {
          name: planData.name,
          description: planData.description,
          price: planData.price,
          currency: planData.currency,
          durationInDays: planData.durationInDays,
          maxStudents: planData.maxStudents,
          maxTeachers: planData.maxTeachers,
          maxAdmins: planData.maxAdmins,
          isActive: true,
        },
      });
      planId = updated.id;
      console.log(`✓ Updated plan: ${planData.name} (${planData.code})`);
    } else {
      const created = await prisma.subscriptionPlan.create({
        data: {
          code: planData.code,
          name: planData.name,
          description: planData.description,
          price: planData.price,
          currency: planData.currency,
          durationInDays: planData.durationInDays,
          maxStudents: planData.maxStudents,
          maxTeachers: planData.maxTeachers,
          maxAdmins: planData.maxAdmins,
          isActive: true,
        },
      });
      planId = created.id;
      console.log(`✓ Created plan: ${planData.name} (${planData.code})`);
    }

    // Link modules
    const targetModuleIds = planData.moduleKeys
      .map((key) => moduleMap.get(key.toUpperCase()))
      .filter((id): id is string => Boolean(id));

    if (targetModuleIds.length > 0) {
      await prisma.planModule.createMany({
        data: targetModuleIds.map((moduleId) => ({
          planId,
          moduleId,
        })),
        skipDuplicates: true,
      });
      console.log(`  Linked ${targetModuleIds.length} modules to ${planData.name}`);
    }
  }

  console.log("✅ All subscription plans and feature matrices seeded successfully!");
}

if (require.main === module) {
  seedPlans()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Plan seed failed:", err);
      process.exit(1);
    });
}
