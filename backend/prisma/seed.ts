import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "Password@123";

async function main() {
  console.log("🌱 Starting database seed...");

  /*
   * --------------------------------------------------------------------------
   * RESET
   * --------------------------------------------------------------------------
   * This is intended for development/demo databases.
   * It removes existing data before creating fresh seed data.
   */
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "NotificationRead",
      "Notification",
      "AuditLog",
      "File",
      "Document",
      "Communication",
      "InventoryTransaction",
      "InventoryItem",
      "HostelAllocation",
      "Hostel",
      "TransportAssignment",
      "TransportRoute",
      "LibraryIssue",
      "LibraryBook",
      "Payroll",
      "Expense",
      "PaymentAllocation",
      "Payment",
      "Invoice",
      "Fee",
      "Mark",
      "Result",
      "Exam",
      "Homework",
      "LeaveRequest",
      "Admission",
      "Enrollment",
      "AcademicYear",
      "Attendance",
      "Timetable",
      "Subject",
      "Student",
      "Parent",
      "Guardian",
      "Staff",
      "Teacher",
      "Section",
      "Class",
      "UserRole",
      "RolePermission",
      "Permission",
      "Role",
      "Subscription",
      "PlanModule",
      "SubscriptionPlan",
      "SchoolModule",
      "ERPModule",
      "RefreshToken",
      "Setting",
      "Event",
      "Announcement",
      "User",
      "schools"
    RESTART IDENTITY CASCADE
  `);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const superAdmin = await prisma.user.upsert({
    where: {
      email: "admin@erp.com",
    },
    update: {
      password: passwordHash,
      status: "ACTIVE",
      isDeleted: false,
    },
    create: {
      fullName: "Super Admin",
      email: "admin@erp.com",
      password: passwordHash,
      role: "SUPER_ADMIN",
      phone: "9999999998",
      status: "ACTIVE",
      isDeleted: false,
    },
  });

  console.log("Super Admin Created");
  console.log(superAdmin);

  /*
   * --------------------------------------------------------------------------
   * SCHOOL
   * --------------------------------------------------------------------------
   */
  const school = await prisma.school.create({
    data: {
      code: "DPS001",
      name: "Delhi Public Academy",
      slug: "delhi-public-academy",
      email: "admin@delhipublicacademy.edu.in",
      phone: "+91 9876543210",
      website: "https://delhipublicacademy.edu.in",
      address: "25 Knowledge Park, Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      postalCode: "201301",
      primaryColor: "#2563EB",
      secondaryColor: "#0F172A",
      principal: "Dr. Anil Sharma",
      vicePrincipal: "Mrs. Priya Mehta",
      slogan: "Learn. Lead. Inspire.",
      missionStatement:
        "To provide quality education and develop responsible global citizens.",
      visionStatement:
        "To become a leading institution for holistic education.",
      board: "CBSE",
      academicYear: "2026-27",
      language: "English",
      timezone: "Asia/Kolkata",
      currency: "INR",
      startHour: "08:00",
      closeHour: "15:00",
      isActive: true,
      isVerified: true,
      status: "ACTIVE",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * USERS
   * --------------------------------------------------------------------------
   */
  const schoolAdmin = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Rahul Verma",
      email: "admin@school.test",
      password: passwordHash,
      phone: "+91 9876500001",
      role: "SCHOOL_ADMIN",
      status: "ACTIVE",
    },
  });

  const teacherUser1 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Amit Kumar",
      email: "amit@school.test",
      password: passwordHash,
      phone: "+91 9876500002",
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Neha Singh",
      email: "neha@school.test",
      password: passwordHash,
      phone: "+91 9876500003",
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const teacherUser3 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Rohit Sharma",
      email: "rohit@school.test",
      password: passwordHash,
      phone: "+91 9876500004",
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const parentUser1 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Rajesh Kumar",
      email: "rajesh.parent@school.test",
      password: passwordHash,
      phone: "+91 9876500010",
      role: "PARENT",
      status: "ACTIVE",
    },
  });

  const parentUser2 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Sunita Sharma",
      email: "sunita.parent@school.test",
      password: passwordHash,
      phone: "+91 9876500011",
      role: "PARENT",
      status: "ACTIVE",
    },
  });

  const studentUser1 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Aarav Kumar",
      email: "aarav.student@school.test",
      password: passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Ananya Sharma",
      email: "ananya.student@school.test",
      password: passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Vivaan Kumar",
      email: "vivaan.student@school.test",
      password: passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  });

  const studentUser4 = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Ishita Sharma",
      email: "ishita.student@school.test",
      password: passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  });

  /*
   * Make admin the school owner.
   */
  await prisma.school.update({
    where: { id: school.id },
    data: {
      ownerId: schoolAdmin.id,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * ERP MODULES
   * --------------------------------------------------------------------------
   */
  const moduleData = [
    ["Dashboard", "dashboard", "School dashboard", "LayoutDashboard"],
    ["Students", "students", "Student management", "Users"],
    ["Teachers", "teachers", "Teacher management", "GraduationCap"],
    ["Attendance", "attendance", "Attendance management", "ClipboardCheck"],
    ["Exams", "exams", "Examination management", "FileText"],
    ["Fees", "fees", "Fee management", "IndianRupee"],
    ["Finance", "finance", "Finance and accounting", "Wallet"],
    ["Library", "library", "Library management", "Library"],
    ["Transport", "transport", "Transport management", "Bus"],
    ["Hostel", "hostel", "Hostel management", "Building"],
    ["Inventory", "inventory", "Inventory management", "Boxes"],
    ["Communication", "communication", "Communication", "MessageSquare"],
    ["Reports", "reports", "Reports and analytics", "BarChart3"],
    ["Settings", "settings", "School settings", "Settings"],
  ];

  const modules: Record<string, any> = {};

  for (let i = 0; i < moduleData.length; i++) {
    const [name, key, description, icon] = moduleData[i];

    modules[key] = await prisma.eRPModule.create({
      data: {
        name,
        key,
        description,
        icon,
        route: `/${key}`,
        category: "CORE",
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }

  /*
   * Assign all modules to school.
   */
  for (const module of Object.values(modules)) {
    await prisma.schoolModule.create({
      data: {
        schoolId: school.id,
        moduleId: module.id,
        enabled: true,
        assignedBy: schoolAdmin.id,
      },
    });
  }

  /*
   * --------------------------------------------------------------------------
   * SUBSCRIPTION PLANS
   * --------------------------------------------------------------------------
   */
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "Basic" },
    update: {},
    create: {
      name: "Basic",
      code: "BASIC",
      description: "Basic school management plan",
      price: 4999,
      currency: "INR",
      durationInDays: 365,
      maxStudents: 300,
      maxTeachers: 30,
      maxAdmins: 3,
      isActive: true,
    },
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "Premium" },
    update: {},
    create: {
      name: "Premium",
      code: "PREMIUM",
      description: "Complete school ERP plan",
      price: 14999,
      currency: "INR",
      durationInDays: 365,
      maxStudents: 2000,
      maxTeachers: 200,
      maxAdmins: 20,
      isActive: true,
    },
  });

  for (const module of Object.values(modules)) {
    const existing = await prisma.planModule.findFirst({
      where: {
        planId: premiumPlan.id,
        moduleId: module.id,
      },
    });
    if (!existing) {
      await prisma.planModule.create({
        data: {
          planId: premiumPlan.id,
          moduleId: module.id,
        },
      });
    }
  }

  /*
   * --------------------------------------------------------------------------
   * ROLES
   * --------------------------------------------------------------------------
   */
  const adminRole = await prisma.role.create({
    data: {
      schoolId: school.id,
      name: "School Administrator",
      key: "SCHOOL_ADMIN",
      description: "Full school administration access",
      isSystem: true,
    },
  });

  const teacherRole = await prisma.role.create({
    data: {
      schoolId: school.id,
      name: "Teacher",
      key: "TEACHER",
      description: "Teacher access",
      isSystem: true,
    },
  });

  const studentRole = await prisma.role.create({
    data: {
      schoolId: school.id,
      name: "Student",
      key: "STUDENT",
      description: "Student access",
      isSystem: true,
    },
  });

  const parentRole = await prisma.role.create({
    data: {
      schoolId: school.id,
      name: "Parent",
      key: "PARENT",
      description: "Parent access",
      isSystem: true,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * PERMISSIONS
   * --------------------------------------------------------------------------
   */
  const permissionKeys = [
    ["View Dashboard", "dashboard.view", "dashboard"],
    ["Manage Students", "students.manage", "students"],
    ["View Students", "students.view", "students"],
    ["Manage Teachers", "teachers.manage", "teachers"],
    ["View Attendance", "attendance.view", "attendance"],
    ["Manage Attendance", "attendance.manage", "attendance"],
    ["Manage Exams", "exams.manage", "exams"],
    ["View Results", "results.view", "exams"],
    ["Manage Fees", "fees.manage", "fees"],
    ["View Fees", "fees.view", "fees"],
    ["Manage Finance", "finance.manage", "finance"],
    ["Manage Library", "library.manage", "library"],
    ["Manage Transport", "transport.manage", "transport"],
    ["Manage Hostel", "hostel.manage", "hostel"],
    ["Manage Inventory", "inventory.manage", "inventory"],
    ["Manage Communication", "communication.manage", "communication"],
    ["Manage Settings", "settings.manage", "settings"],
  ];

  const permissions: any[] = [];

  for (const [name, key, module] of permissionKeys) {
    permissions.push(
      await prisma.permission.create({
        data: {
          name,
          key,
          module,
        },
      }),
    );
  }

  /*
   * Admin gets all permissions.
   */
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  /*
   * Teacher permissions.
   */
  for (const permission of permissions.filter((p) =>
    [
      "dashboard.view",
      "students.view",
      "attendance.view",
      "attendance.manage",
      "exams.manage",
      "results.view",
      "library.manage",
    ].includes(p.key),
  )) {
    await prisma.rolePermission.create({
      data: {
        roleId: teacherRole.id,
        permissionId: permission.id,
      },
    });
  }

  /*
   * Student permissions.
   */
  for (const permission of permissions.filter((p) =>
    [
      "dashboard.view",
      "students.view",
      "attendance.view",
      "results.view",
      "fees.view",
    ].includes(p.key),
  )) {
    await prisma.rolePermission.create({
      data: {
        roleId: studentRole.id,
        permissionId: permission.id,
      },
    });
  }

  /*
   * Parent permissions.
   */
  for (const permission of permissions.filter((p) =>
    [
      "dashboard.view",
      "students.view",
      "attendance.view",
      "results.view",
      "fees.view",
    ].includes(p.key),
  )) {
    await prisma.rolePermission.create({
      data: {
        roleId: parentRole.id,
        permissionId: permission.id,
      },
    });
  }

  /*
   * User role assignments.
   */
  await prisma.userRole.create({
    data: {
      userId: schoolAdmin.id,
      roleId: adminRole.id,
      assignedBy: schoolAdmin.id,
    },
  });

  await prisma.userRole.createMany({
    data: [
      {
        userId: teacherUser1.id,
        roleId: teacherRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: teacherUser2.id,
        roleId: teacherRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: teacherUser3.id,
        roleId: teacherRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: parentUser1.id,
        roleId: parentRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: parentUser2.id,
        roleId: parentRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: studentUser1.id,
        roleId: studentRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: studentUser2.id,
        roleId: studentRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: studentUser3.id,
        roleId: studentRole.id,
        assignedBy: schoolAdmin.id,
      },
      {
        userId: studentUser4.id,
        roleId: studentRole.id,
        assignedBy: schoolAdmin.id,
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * ACADEMIC YEAR
   * --------------------------------------------------------------------------
   */
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: "Academic Year 2026-27",
      code: "2026-27",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      isActive: true,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * CLASSES
   * --------------------------------------------------------------------------
   */
  const class5 = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: "Class 5",
    },
  });

  const class6 = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: "Class 6",
    },
  });

  const class7 = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: "Class 7",
    },
  });

  const class8 = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: "Class 8",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * SECTIONS
   * --------------------------------------------------------------------------
   */
  const section5A = await prisma.section.create({
    data: {
      schoolId: school.id,
      classId: class5.id,
      name: "A",
      capacity: 40,
    },
  });

  const section6A = await prisma.section.create({
    data: {
      schoolId: school.id,
      classId: class6.id,
      name: "A",
      capacity: 40,
    },
  });

  const section7A = await prisma.section.create({
    data: {
      schoolId: school.id,
      classId: class7.id,
      name: "A",
      capacity: 40,
    },
  });

  const section8A = await prisma.section.create({
    data: {
      schoolId: school.id,
      classId: class8.id,
      name: "A",
      capacity: 40,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * TEACHERS
   * --------------------------------------------------------------------------
   */
  const teacher1 = await prisma.teacher.create({
    data: {
      schoolId: school.id,
      userId: teacherUser1.id,
      employeeId: "TCH001",
      qualification: "M.Sc Mathematics",
      experienceYears: 8,
      designation: "Senior Mathematics Teacher",
      address: "Noida, Uttar Pradesh",
      joiningDate: new Date("2018-07-01"),
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      schoolId: school.id,
      userId: teacherUser2.id,
      employeeId: "TCH002",
      qualification: "M.Sc Physics",
      experienceYears: 6,
      designation: "Science Teacher",
      address: "Delhi",
      joiningDate: new Date("2020-04-01"),
    },
  });

  const teacher3 = await prisma.teacher.create({
    data: {
      schoolId: school.id,
      userId: teacherUser3.id,
      employeeId: "TCH003",
      qualification: "M.A English",
      experienceYears: 5,
      designation: "English Teacher",
      address: "Ghaziabad, Uttar Pradesh",
      joiningDate: new Date("2021-07-01"),
    },
  });

  /*
   * Assign class teachers.
   */
  await prisma.class.update({
    where: { id: class5.id },
    data: { classTeacherId: teacher1.id },
  });

  await prisma.class.update({
    where: { id: class6.id },
    data: { classTeacherId: teacher2.id },
  });

  await prisma.class.update({
    where: { id: class7.id },
    data: { classTeacherId: teacher3.id },
  });

  /*
   * --------------------------------------------------------------------------
   * PARENTS
   * --------------------------------------------------------------------------
   */
  const parent1 = await prisma.parent.create({
    data: {
      schoolId: school.id,
      userId: parentUser1.id,
      occupation: "Software Engineer",
      address: "Noida, Uttar Pradesh",
      annualIncome: 1200000,
    },
  });

  const parent2 = await prisma.parent.create({
    data: {
      schoolId: school.id,
      userId: parentUser2.id,
      occupation: "Business Owner",
      address: "Delhi",
      annualIncome: 1500000,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * STUDENTS
   * --------------------------------------------------------------------------
   */
  const student1 = await prisma.student.create({
    data: {
      schoolId: school.id,
      userId: studentUser1.id,
      admissionNo: "ADM001",
      rollNo: "01",
      dob: new Date("2015-06-12"),
      gender: "MALE",
      address: "Noida, Uttar Pradesh",
      parentId: parent1.id,
      admissionDate: new Date("2024-04-05"),
      bloodGroup: "B+",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      schoolId: school.id,
      userId: studentUser2.id,
      admissionNo: "ADM002",
      rollNo: "02",
      dob: new Date("2015-09-21"),
      gender: "FEMALE",
      address: "Delhi",
      parentId: parent2.id,
      admissionDate: new Date("2024-04-05"),
      bloodGroup: "A+",
    },
  });

  const student3 = await prisma.student.create({
    data: {
      schoolId: school.id,
      userId: studentUser3.id,
      admissionNo: "ADM003",
      rollNo: "03",
      dob: new Date("2014-11-10"),
      gender: "MALE",
      address: "Noida, Uttar Pradesh",
      parentId: parent1.id,
      admissionDate: new Date("2023-04-05"),
      bloodGroup: "O+",
    },
  });

  const student4 = await prisma.student.create({
    data: {
      schoolId: school.id,
      userId: studentUser4.id,
      admissionNo: "ADM004",
      rollNo: "04",
      dob: new Date("2014-08-15"),
      gender: "FEMALE",
      address: "Delhi",
      parentId: parent2.id,
      admissionDate: new Date("2023-04-05"),
      bloodGroup: "AB+",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * ENROLLMENTS
   * --------------------------------------------------------------------------
   */
  await prisma.enrollment.createMany({
    data: [
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        studentId: student1.id,
        classId: class5.id,
        sectionId: section5A.id,
        rollNo: "01",
        status: "ACTIVE",
      },
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        studentId: student2.id,
        classId: class5.id,
        sectionId: section5A.id,
        rollNo: "02",
        status: "ACTIVE",
      },
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        studentId: student3.id,
        classId: class6.id,
        sectionId: section6A.id,
        rollNo: "01",
        status: "ACTIVE",
      },
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        studentId: student4.id,
        classId: class6.id,
        sectionId: section6A.id,
        rollNo: "02",
        status: "ACTIVE",
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * SUBJECTS
   * --------------------------------------------------------------------------
   */
  const math = await prisma.subject.create({
    data: {
      schoolId: school.id,
      name: "Mathematics",
      code: "MATH",
      description: "Mathematics and numerical reasoning",
    },
  });

  const science = await prisma.subject.create({
    data: {
      schoolId: school.id,
      name: "Science",
      code: "SCI",
      description: "Physics, Chemistry and Biology basics",
    },
  });

  const english = await prisma.subject.create({
    data: {
      schoolId: school.id,
      name: "English",
      code: "ENG",
      description: "English language and literature",
    },
  });

  const socialScience = await prisma.subject.create({
    data: {
      schoolId: school.id,
      name: "Social Science",
      code: "SST",
      description: "History, Geography and Civics",
    },
  });

  const computer = await prisma.subject.create({
    data: {
      schoolId: school.id,
      name: "Computer Science",
      code: "CS",
      description: "Computer fundamentals and programming",
    },
  });

  /*
   * Teacher-subject assignments.
   */
  await prisma.teacher.update({
    where: { id: teacher1.id },
    data: {
      subjects: {
        connect: [{ id: math.id }, { id: computer.id }],
      },
    },
  });

  await prisma.teacher.update({
    where: { id: teacher2.id },
    data: {
      subjects: {
        connect: [{ id: science.id }],
      },
    },
  });

  await prisma.teacher.update({
    where: { id: teacher3.id },
    data: {
      subjects: {
        connect: [{ id: english.id }, { id: socialScience.id }],
      },
    },
  });

  /*
   * --------------------------------------------------------------------------
   * TIMETABLE
   * --------------------------------------------------------------------------
   */
  const timetableData = [
    {
      classId: class5.id,
      sectionId: section5A.id,
      subjectId: math.id,
      teacherId: teacher1.id,
      day: "MONDAY",
      startTime: "08:00",
      endTime: "08:45",
      period: 1,
      roomNo: "101",
    },
    {
      classId: class5.id,
      sectionId: section5A.id,
      subjectId: science.id,
      teacherId: teacher2.id,
      day: "MONDAY",
      startTime: "08:45",
      endTime: "09:30",
      period: 2,
      roomNo: "101",
    },
    {
      classId: class5.id,
      sectionId: section5A.id,
      subjectId: english.id,
      teacherId: teacher3.id,
      day: "MONDAY",
      startTime: "09:45",
      endTime: "10:30",
      period: 3,
      roomNo: "101",
    },
    {
      classId: class6.id,
      sectionId: section6A.id,
      subjectId: math.id,
      teacherId: teacher1.id,
      day: "TUESDAY",
      startTime: "08:00",
      endTime: "08:45",
      period: 1,
      roomNo: "102",
    },
    {
      classId: class6.id,
      sectionId: section6A.id,
      subjectId: science.id,
      teacherId: teacher2.id,
      day: "TUESDAY",
      startTime: "08:45",
      endTime: "09:30",
      period: 2,
      roomNo: "102",
    },
    {
      classId: class7.id,
      sectionId: section7A.id,
      subjectId: english.id,
      teacherId: teacher3.id,
      day: "WEDNESDAY",
      startTime: "08:00",
      endTime: "08:45",
      period: 1,
      roomNo: "103",
    },
  ];

  for (const item of timetableData) {
    await prisma.timetable.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        ...item,
      },
    });
  }

  /*
   * --------------------------------------------------------------------------
   * EXAM
   * --------------------------------------------------------------------------
   */
  const midTerm = await prisma.exam.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: "Mid Term Examination",
      startDate: new Date("2026-09-10"),
      endDate: new Date("2026-09-20"),
      examType: "MID_TERM",
      description: "Mid term examination 2026-27",
    },
  });

  const finalExam = await prisma.exam.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: "Annual Examination",
      startDate: new Date("2027-02-15"),
      endDate: new Date("2027-02-28"),
      examType: "ANNUAL",
      description: "Annual examination 2026-27",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * RESULTS
   * --------------------------------------------------------------------------
   */
  const resultRows = [
    [student1.id, math.id, 88, "A"],
    [student1.id, science.id, 91, "A+"],
    [student1.id, english.id, 84, "A"],
    [student1.id, socialScience.id, 79, "B+"],
    [student1.id, computer.id, 94, "A+"],

    [student2.id, math.id, 93, "A+"],
    [student2.id, science.id, 89, "A"],
    [student2.id, english.id, 96, "A+"],
    [student2.id, socialScience.id, 91, "A+"],
    [student2.id, computer.id, 95, "A+"],

    [student3.id, math.id, 76, "B+"],
    [student3.id, science.id, 82, "A"],
    [student3.id, english.id, 80, "A"],
    [student3.id, socialScience.id, 74, "B"],
    [student3.id, computer.id, 86, "A"],
  ] as const;

  for (const [studentId, subjectId, marks, grade] of resultRows) {
    await prisma.result.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        examId: midTerm.id,
        studentId,
        subjectId,
        marks,
        totalMarks: 100,
        grade,
        remarks: "Good performance",
      },
    });
  }

  /*
   * Mark table.
   */
  for (const [studentId, subjectId, marks, grade] of resultRows) {
    await prisma.mark.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        examId: midTerm.id,
        studentId,
        subjectId,
        obtainedMarks: marks,
        maxMarks: 100,
        grade,
        remarks: "Good performance",
        enteredById: teacherUser1.id,
      },
    });
  }

  /*
   * --------------------------------------------------------------------------
   * ATTENDANCE
   * --------------------------------------------------------------------------
   */
  const attendanceDates = [
    new Date("2026-09-01"),
    new Date("2026-09-02"),
    new Date("2026-09-03"),
    new Date("2026-09-04"),
    new Date("2026-09-07"),
  ];

  const studentsWithClasses = [
    [student1, class5],
    [student2, class5],
    [student3, class6],
    [student4, class6],
  ] as const;

  for (const [student, studentClass] of studentsWithClasses) {
    for (let i = 0; i < attendanceDates.length; i++) {
      await prisma.attendance.create({
        data: {
          schoolId: school.id,
          academicYearId: academicYear.id,
          studentId: student.id,
          classId: studentClass.id,
          attendanceDate: attendanceDates[i],
          status:
            student.id === student4.id && i === 2
              ? "ABSENT"
              : student.id === student3.id && i === 4
                ? "LATE"
                : "PRESENT",
          markedById: teacherUser1.id,
        },
      });
    }
  }

  /*
   * --------------------------------------------------------------------------
   * FEES
   * --------------------------------------------------------------------------
   */
  const feeData = [
    {
      studentId: student1.id,
      title: "Tuition Fee - Term 1",
      amount: 30000,
      paidAmount: 30000,
      status: "PAID" as const,
      paidDate: new Date("2026-06-10"),
      paymentMethod: "UPI",
    },
    {
      studentId: student2.id,
      title: "Tuition Fee - Term 1",
      amount: 30000,
      paidAmount: 20000,
      status: "PARTIAL" as const,
      paidDate: new Date("2026-06-12"),
      paymentMethod: "ONLINE",
    },
    {
      studentId: student3.id,
      title: "Tuition Fee - Term 1",
      amount: 30000,
      paidAmount: 0,
      status: "PENDING" as const,
      paymentMethod: undefined,
    },
    {
      studentId: student4.id,
      title: "Tuition Fee - Term 1",
      amount: 30000,
      paidAmount: 30000,
      status: "PAID" as const,
      paidDate: new Date("2026-06-15"),
      paymentMethod: "BANK_TRANSFER",
    },
  ];

  for (const fee of feeData) {
    await prisma.fee.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        studentId: fee.studentId,
        title: fee.title,
        amount: fee.amount,
        paidAmount: fee.paidAmount,
        dueDate: new Date("2026-06-30"),
        paidDate: fee.paidDate,
        paymentMethod: fee.paymentMethod,
        status: fee.status,
      },
    });
  }

  /*
   * --------------------------------------------------------------------------
   * INVOICES
   * --------------------------------------------------------------------------
   */
  const invoice1 = await prisma.invoice.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      studentId: student1.id,
      invoiceNo: "INV-2026-0001",
      issueDate: new Date("2026-06-01"),
      dueDate: new Date("2026-06-30"),
      subtotal: 30000,
      discount: 0,
      tax: 0,
      total: 30000,
      status: "PAID",
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      studentId: student2.id,
      invoiceNo: "INV-2026-0002",
      issueDate: new Date("2026-06-01"),
      dueDate: new Date("2026-06-30"),
      subtotal: 30000,
      discount: 0,
      tax: 0,
      total: 30000,
      status: "PARTIAL",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * PAYMENTS
   * --------------------------------------------------------------------------
   */
  const payment1 = await prisma.payment.create({
    data: {
      schoolId: school.id,
      studentId: student1.id,
      receiptNo: "REC-2026-0001",
      amount: 30000,
      paymentDate: new Date("2026-06-10"),
      method: "UPI",
      referenceNo: "UPI20260610001",
      status: "CAPTURED",
      receivedById: schoolAdmin.id,
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      schoolId: school.id,
      studentId: student2.id,
      receiptNo: "REC-2026-0002",
      amount: 20000,
      paymentDate: new Date("2026-06-12"),
      method: "ONLINE",
      referenceNo: "ONLINE20260612001",
      status: "CAPTURED",
      receivedById: schoolAdmin.id,
    },
  });

  await prisma.paymentAllocation.createMany({
    data: [
      {
        schoolId: school.id,
        paymentId: payment1.id,
        invoiceId: invoice1.id,
        amount: 30000,
      },
      {
        schoolId: school.id,
        paymentId: payment2.id,
        invoiceId: invoice2.id,
        amount: 20000,
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * SUBSCRIPTION
   * --------------------------------------------------------------------------
   */
  await prisma.subscription.create({
    data: {
      schoolId: school.id,
      planId: premiumPlan.id,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
      amount: 14999,
      discount: 1000,
      tax: 2519.82,
      finalAmount: 16518.82,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * STAFF
   * --------------------------------------------------------------------------
   */
  await prisma.staff.createMany({
    data: [
      {
        schoolId: school.id,
        employeeId: "STF001",
        fullName: "Suresh Yadav",
        designation: "Accountant",
        department: "Finance",
        phone: "+91 9876510001",
        email: "accounts@school.test",
        joiningDate: new Date("2021-04-01"),
        salary: 45000,
      },
      {
        schoolId: school.id,
        employeeId: "STF002",
        fullName: "Kavita Rao",
        designation: "Receptionist",
        department: "Administration",
        phone: "+91 9876510002",
        email: "reception@school.test",
        joiningDate: new Date("2022-07-01"),
        salary: 28000,
      },
      {
        schoolId: school.id,
        employeeId: "STF003",
        fullName: "Manoj Kumar",
        designation: "Lab Assistant",
        department: "Science",
        phone: "+91 9876510003",
        email: "lab@school.test",
        joiningDate: new Date("2023-04-01"),
        salary: 30000,
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * GUARDIAN
   * --------------------------------------------------------------------------
   */
  await prisma.guardian.create({
    data: {
      schoolId: school.id,
      fullName: "Mahesh Kumar",
      relationship: "Uncle",
      phone: "+91 9876520001",
      email: "mahesh.guardian@test.com",
      occupation: "Business",
      address: "Noida, Uttar Pradesh",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * ADMISSIONS
   * --------------------------------------------------------------------------
   */
  await prisma.admission.createMany({
    data: [
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        applicationNo: "APP-2026-001",
        studentName: "Kabir Singh",
        appliedClassId: class5.id,
        guardianName: "Vikram Singh",
        guardianPhone: "+91 9876530001",
        status: "PENDING",
      },
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        applicationNo: "APP-2026-002",
        studentName: "Meera Gupta",
        appliedClassId: class6.id,
        guardianName: "Amit Gupta",
        guardianPhone: "+91 9876530002",
        status: "UNDER_REVIEW",
      },
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        applicationNo: "APP-2026-003",
        studentName: "Arjun Malhotra",
        appliedClassId: class7.id,
        guardianName: "Rakesh Malhotra",
        guardianPhone: "+91 9876530003",
        status: "APPROVED",
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * LEAVE REQUEST
   * --------------------------------------------------------------------------
   */
  await prisma.leaveRequest.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      applicantUserId: teacherUser2.id,
      leaveType: "CASUAL",
      startDate: new Date("2026-09-21"),
      endDate: new Date("2026-09-22"),
      reason: "Personal work",
      status: "PENDING",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * HOMEWORK
   * --------------------------------------------------------------------------
   */
  await prisma.homework.createMany({
    data: [
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        classId: class5.id,
        sectionId: section5A.id,
        subjectId: math.id,
        teacherId: teacher1.id,
        title: "Fractions Practice",
        description: "Complete exercises 1-20 from chapter 4.",
        assignedAt: new Date("2026-09-15"),
        dueDate: new Date("2026-09-20"),
        status: "PUBLISHED",
      },
      {
        schoolId: school.id,
        academicYearId: academicYear.id,
        classId: class5.id,
        sectionId: section5A.id,
        subjectId: science.id,
        teacherId: teacher2.id,
        title: "Plants Around Us",
        description: "Prepare a short project on local plants.",
        assignedAt: new Date("2026-09-14"),
        dueDate: new Date("2026-09-22"),
        status: "PUBLISHED",
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * EXPENSES
   * --------------------------------------------------------------------------
   */
  await prisma.expense.createMany({
    data: [
      {
        schoolId: school.id,
        expenseNo: "EXP-2026-001",
        category: "Electricity",
        amount: 18500,
        expenseDate: new Date("2026-09-05"),
        vendor: "Noida Power Company",
        paymentMethod: "BANK_TRANSFER",
        description: "Monthly electricity bill",
        createdById: schoolAdmin.id,
      },
      {
        schoolId: school.id,
        expenseNo: "EXP-2026-002",
        category: "Stationery",
        amount: 7500,
        expenseDate: new Date("2026-09-07"),
        vendor: "Office Supplies India",
        paymentMethod: "UPI",
        description: "Notebooks and stationery",
        createdById: schoolAdmin.id,
      },
      {
        schoolId: school.id,
        expenseNo: "EXP-2026-003",
        category: "Maintenance",
        amount: 12000,
        expenseDate: new Date("2026-09-10"),
        vendor: "ABC Maintenance",
        paymentMethod: "CASH",
        description: "Classroom maintenance",
        createdById: schoolAdmin.id,
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * PAYROLL
   * --------------------------------------------------------------------------
   */
  await prisma.payroll.create({
    data: {
      schoolId: school.id,
      employeeId: teacher1.employeeId,
      periodStart: new Date("2026-09-01"),
      periodEnd: new Date("2026-09-30"),
      grossAmount: 65000,
      deductions: 5000,
      netAmount: 60000,
      status: "PAID",
      paidAt: new Date("2026-09-30"),
      processedById: schoolAdmin.id,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * LIBRARY
   * --------------------------------------------------------------------------
   */
  const book1 = await prisma.libraryBook.create({
    data: {
      schoolId: school.id,
      isbn: "978-0143456789",
      accessionNo: "LIB001",
      title: "The Blue Umbrella",
      author: "Ruskin Bond",
      publisher: "Rupa Publications",
      category: "Fiction",
      quantity: 5,
      availableQty: 4,
      price: 250,
    },
  });

  const book2 = await prisma.libraryBook.create({
    data: {
      schoolId: school.id,
      isbn: "978-0191234567",
      accessionNo: "LIB002",
      title: "Mathematics Made Easy",
      author: "R.S. Aggarwal",
      publisher: "S. Chand",
      category: "Mathematics",
      quantity: 10,
      availableQty: 10,
      price: 450,
    },
  });

  await prisma.libraryIssue.create({
    data: {
      schoolId: school.id,
      bookId: book1.id,
      borrowerId: student1.id,
      issuedAt: new Date("2026-09-10"),
      dueAt: new Date("2026-09-24"),
      fineAmount: 0,
      status: "ISSUED",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * TRANSPORT
   * --------------------------------------------------------------------------
   */
  const route = await prisma.transportRoute.create({
    data: {
      schoolId: school.id,
      name: "Route 1 - Noida Sector 62",
      vehicleNo: "UP16 AB 1234",
      driverName: "Ramesh Singh",
      driverPhone: "+91 9876545001",
      fee: 2500,
      stops: ["Sector 62", "Sector 61", "Sector 60", "School Gate"],
      isActive: true,
    },
  });

  await prisma.transportAssignment.create({
    data: {
      schoolId: school.id,
      studentId: student1.id,
      routeId: route.id,
      pickupStop: "Sector 62",
      dropStop: "Sector 62",
      startDate: new Date("2026-04-01"),
      fee: 2500,
      status: "ACTIVE",
    },
  });

  await prisma.transportAssignment.create({
    data: {
      schoolId: school.id,
      studentId: student2.id,
      routeId: route.id,
      pickupStop: "Sector 61",
      dropStop: "Sector 61",
      startDate: new Date("2026-04-01"),
      fee: 2500,
      status: "ACTIVE",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * HOSTEL
   * --------------------------------------------------------------------------
   */
  const hostel = await prisma.hostel.create({
    data: {
      schoolId: school.id,
      name: "Aryabhata Boys Hostel",
      address: "School Campus, Block B",
      wardenName: "Mr. Dinesh Kumar",
      capacity: 120,
      isActive: true,
    },
  });

  await prisma.hostelAllocation.create({
    data: {
      schoolId: school.id,
      hostelId: hostel.id,
      studentId: student3.id,
      roomNo: "B-201",
      bedNo: "2",
      startDate: new Date("2026-04-01"),
      fee: 60000,
      status: "ACTIVE",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * INVENTORY
   * --------------------------------------------------------------------------
   */
  const inventoryLaptop = await prisma.inventoryItem.create({
    data: {
      schoolId: school.id,
      sku: "LAP-001",
      name: "Dell Latitude Laptop",
      category: "Electronics",
      unit: "PCS",
      quantity: 25,
      reorderLevel: 5,
      unitPrice: 65000,
      status: "ACTIVE",
    },
  });

  const inventoryChair = await prisma.inventoryItem.create({
    data: {
      schoolId: school.id,
      sku: "CHR-001",
      name: "Student Chair",
      category: "Furniture",
      unit: "PCS",
      quantity: 250,
      reorderLevel: 30,
      unitPrice: 1800,
      status: "ACTIVE",
    },
  });

  await prisma.inventoryTransaction.createMany({
    data: [
      {
        schoolId: school.id,
        itemId: inventoryLaptop.id,
        type: "PURCHASE",
        quantity: 25,
        unitPrice: 65000,
        referenceNo: "PO-2026-001",
        remarks: "New computer lab laptops",
        createdById: schoolAdmin.id,
      },
      {
        schoolId: school.id,
        itemId: inventoryChair.id,
        type: "PURCHASE",
        quantity: 250,
        unitPrice: 1800,
        referenceNo: "PO-2026-002",
        remarks: "New classroom chairs",
        createdById: schoolAdmin.id,
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * ANNOUNCEMENTS
   * --------------------------------------------------------------------------
   */
  await prisma.announcement.createMany({
    data: [
      {
        schoolId: school.id,
        title: "Mid Term Examination",
        message: "Mid Term Examination will begin from 10 September 2026.",
        publishedAt: new Date("2026-09-01"),
        expiresAt: new Date("2026-09-25"),
      },
      {
        schoolId: school.id,
        title: "Parent Teacher Meeting",
        message: "Parent Teacher Meeting will be held on 26 September 2026.",
        publishedAt: new Date("2026-09-10"),
        expiresAt: new Date("2026-09-27"),
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * EVENTS
   * --------------------------------------------------------------------------
   */
  await prisma.event.createMany({
    data: [
      {
        schoolId: school.id,
        title: "Annual Sports Day",
        description: "Inter-house sports competition.",
        startDate: new Date("2026-10-15T08:00:00"),
        endDate: new Date("2026-10-15T16:00:00"),
        location: "School Sports Ground",
      },
      {
        schoolId: school.id,
        title: "Science Exhibition",
        description: "Student science projects and demonstrations.",
        startDate: new Date("2026-11-05T09:00:00"),
        endDate: new Date("2026-11-05T15:00:00"),
        location: "Main Auditorium",
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * NOTIFICATIONS
   * --------------------------------------------------------------------------
   */
  const notification1 = await prisma.notification.create({
    data: {
      title: "Fee Payment Reminder",
      message: "Please clear pending school fees before the due date.",
      scope: "PARENT",
      type: "FEES",
      priority: "HIGH",
      schoolId: school.id,
      userId: parentUser2.id,
      createdById: schoolAdmin.id,
      status: "SENT",
      sentAt: new Date(),
      isPinned: true,
    },
  });

  const notification2 = await prisma.notification.create({
    data: {
      title: "Exam Schedule Published",
      message: "Mid Term Examination schedule has been published.",
      scope: "SCHOOL",
      type: "EXAM",
      priority: "NORMAL",
      schoolId: school.id,
      createdById: schoolAdmin.id,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  await prisma.notificationRead.create({
    data: {
      notificationId: notification1.id,
      userId: parentUser2.id,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * COMMUNICATION
   * --------------------------------------------------------------------------
   */
  await prisma.communication.create({
    data: {
      schoolId: school.id,
      channel: "EMAIL",
      subject: "Mid Term Examination Schedule",
      message:
        "Dear Parents, the Mid Term Examination schedule has been published.",
      recipientCount: 120,
      status: "SENT",
      sentAt: new Date(),
      createdById: schoolAdmin.id,
    },
  });

  await prisma.communication.create({
    data: {
      schoolId: school.id,
      channel: "SMS",
      subject: "Fee Reminder",
      message: "Reminder: Please clear pending school fees.",
      recipientCount: 45,
      status: "SENT",
      sentAt: new Date(),
      createdById: schoolAdmin.id,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * SETTINGS
   * --------------------------------------------------------------------------
   */
  await prisma.setting.createMany({
    data: [
      {
        schoolId: school.id,
        key: "attendance.lateThreshold",
        value: 15,
      },
      {
        schoolId: school.id,
        key: "fees.gracePeriodDays",
        value: 7,
      },
      {
        schoolId: school.id,
        key: "school.workingDays",
        value: [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ],
      },
      {
        schoolId: school.id,
        key: "notifications.emailEnabled",
        value: true,
      },
      {
        schoolId: school.id,
        key: "notifications.smsEnabled",
        value: true,
      },
    ],
  });

  /*
   * --------------------------------------------------------------------------
   * FILE
   * --------------------------------------------------------------------------
   */
  const logoFile = await prisma.file.create({
    data: {
      schoolId: school.id,
      uploadedById: schoolAdmin.id,
      fileName: "school-logo.png",
      originalName: "school-logo.png",
      mimeType: "image/png",
      extension: "png",
      size: 24576,
      path: "/uploads/schools/dps001/school-logo.png",
      folder: "school-assets",
      disk: "local",
      isPublic: true,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * DOCUMENT
   * --------------------------------------------------------------------------
   */
  await prisma.document.create({
    data: {
      schoolId: school.id,
      entityType: "SCHOOL",
      entityId: school.id,
      name: "School Registration Certificate",
      fileId: logoFile.id,
      version: 1,
      metadata: {
        documentType: "REGISTRATION_CERTIFICATE",
        verified: true,
      },
      uploadedById: schoolAdmin.id,
    },
  });

  /*
   * --------------------------------------------------------------------------
   * AUDIT LOG
   * --------------------------------------------------------------------------
   */
  await prisma.auditLog.create({
    data: {
      schoolId: school.id,
      userId: schoolAdmin.id,
      action: "CREATE",
      entity: "School",
      entityId: school.id,
      module: "school",
      meta: {
        source: "seed",
      },
      afterData: {
        schoolName: school.name,
      },
      browser: "Chrome",
      device: "Desktop",
      ipAddress: "127.0.0.1",
      userAgent: "Seed Script",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * REFRESH TOKEN
   * --------------------------------------------------------------------------
   */
  await prisma.refreshToken.create({
    data: {
      userId: schoolAdmin.id,
      schoolId: school.id,
      tokenHash: "seed-refresh-token-hash-001",
      deviceInfo: "Development Browser",
      ipAddress: "127.0.0.1",
      expiresAt: new Date("2027-12-31"),
    },
  });

  /*
   * --------------------------------------------------------------------------
   * SUMMARY
   * --------------------------------------------------------------------------
   */
  console.log("");
  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("School:");
  console.log(`  ${school.name}`);
  console.log(`  Code: ${school.code}`);
  console.log("");
  console.log("Login credentials:");
  console.log("----------------------------------------");
  console.log("Admin");
  console.log("  Email:    admin@school.test");
  console.log("  Password:  ");
  console.log("");
  console.log("Teacher");
  console.log("  Email:    amit@school.test");
  console.log("  Password: Password@123");
  console.log("");
  console.log("Parent");
  console.log("  Email:    rajesh.parent@school.test");
  console.log("  Password: Password@123");
  console.log("");
  console.log("Student");
  console.log("  Email:    aarav.student@school.test");
  console.log("  Password: Password@123");
  console.log("----------------------------------------");
  console.log("");
  console.log("Seed data includes:");
  console.log("  ✓ School");
  console.log("  ✓ Users");
  console.log("  ✓ Roles & permissions");
  console.log("  ✓ ERP modules");
  console.log("  ✓ Subscription plans");
  console.log("  ✓ Subscription");
  console.log("  ✓ Academic year");
  console.log("  ✓ Classes & sections");
  console.log("  ✓ Students");
  console.log("  ✓ Parents");
  console.log("  ✓ Teachers");
  console.log("  ✓ Subjects");
  console.log("  ✓ Timetable");
  console.log("  ✓ Exams");
  console.log("  ✓ Results & marks");
  console.log("  ✓ Attendance");
  console.log("  ✓ Fees");
  console.log("  ✓ Invoices & payments");
  console.log("  ✓ Staff");
  console.log("  ✓ Guardians");
  console.log("  ✓ Admissions");
  console.log("  ✓ Leave requests");
  console.log("  ✓ Homework");
  console.log("  ✓ Payroll");
  console.log("  ✓ Expenses");
  console.log("  ✓ Library");
  console.log("  ✓ Transport");
  console.log("  ✓ Hostel");
  console.log("  ✓ Inventory");
  console.log("  ✓ Announcements");
  console.log("  ✓ Events");
  console.log("  ✓ Notifications");
  console.log("  ✓ Communication");
  console.log("  ✓ Settings");
  console.log("  ✓ Files & documents");
  console.log("  ✓ Audit logs");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed: ");
    console.error(error);
    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
