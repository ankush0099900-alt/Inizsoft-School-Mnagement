import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Layers,
  Bell,
  BarChart3,
  ClipboardList,
  Settings,
  UserCircle,
  GraduationCap,
  UserRound,
  BookOpen,
  ClipboardCheck,
  Wallet,
  FileText,
  LockKeyhole,
  MonitorCog,
  CalendarDays,
  School,
  BookMarked,
  UserCog,
  ClipboardPenLine,
  CalendarCheck,
  Megaphone,
  Calendar,
  Receipt,
  IndianRupee,
  CreditCard as PaymentIcon,
  UserCheck,
  UserPlus,
  DoorOpen,
  Clock3,
  Library,
  BookOpenCheck,
  ListChecks,
} from "lucide-react";

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "PARENT"
  | "STUDENT";

export interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  moduleKey?: string;
  common?: boolean;
  section?: string;
  children?: SidebarItem[];
}


/* -------------------------------------------------------------------------- */
/* Common                                                                    */
/* -------------------------------------------------------------------------- */

const commonSchoolItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/school-admin/dashboard",
    icon: LayoutDashboard,
    moduleKey: "dashboard",
    common: true,
  },
  {
    title: "Notifications",
    href: "/school-admin/notifications",
    icon: Bell,
    moduleKey: "notifications",
    common: true,
  },
  {
    title: "Profile",
    href: "/school-admin/profile",
    icon: UserCircle,
    common: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Super Admin                                                               */
/* -------------------------------------------------------------------------- */

const superAdminSidebar: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: LayoutDashboard,
    common: true,
  },
  {
    title: "Schools",
    href: "/super-admin/schools",
    icon: Building2,
    common: true,
  },
  {
    title: "Users",
    href: "/super-admin/users",
    icon: Users,
    common: true,
  },
  {
    title: "Features",
    href: "/super-admin/features",
    icon: ShieldCheck,
    common: true,
  },
  {
    title: "Subscriptions",
    href: "/super-admin/subscriptions",
    icon: CreditCard,
    common: true,
  },
  {
    title: "Plans",
    href: "/super-admin/plans",
    icon: Layers,
    common: true,
  },
  {
    title: "Billing & Invoices",
    href: "/super-admin/billing",
    icon: IndianRupee,
    common: true,
  },
  {
    title: "Notifications",
    href: "/super-admin/notifications",
    icon: Bell,
    common: true,
  },
  {
    title: "Analytics",
    href: "/super-admin/analytics",
    icon: BarChart3,
    common: true,
  },
  {
    title: "Activity Logs",
    href: "/super-admin/audit-logs",
    icon: ClipboardList,
    common: true,
  },
  {
    title: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
    common: true,
    children: [
      {
        title: "General",
        href: "/super-admin/settings/general",
        icon: Settings,
        common: true,
      },
      {
        title: "Security",
        href: "/super-admin/settings/security",
        icon: LockKeyhole,
        common: true,
      },
      {
        title: "System",
        href: "/super-admin/settings/system",
        icon: MonitorCog,
        common: true,
      },
    ],
  },
  {
    title: "Profile",
    href: "/super-admin/profile",
    icon: UserCircle,
    common: true,
  },
];

/* -------------------------------------------------------------------------- */
/* School Admin                                                              */
/* -------------------------------------------------------------------------- */

const schoolAdminSidebar: SidebarItem[] = [
  // 1. OVERVIEW
  {
    title: "Dashboard",
    href: "/school-admin/dashboard",
    icon: LayoutDashboard,
    section: "Overview",
    common: true,
  },

  // 2. ACADEMIC STRUCTURE
  {
    title: "Academic Sessions",
    href: "/school-admin/academic-years",
    icon: CalendarDays,
    section: "Academic Structure",
    moduleKey: "ACADEMIC_YEARS",
  },
  {
    title: "Classes",
    href: "/school-admin/classes",
    icon: School,
    section: "Academic Structure",
    moduleKey: "CLASSES",
  },
  {
    title: "Sections",
    href: "/school-admin/sections",
    icon: DoorOpen,
    section: "Academic Structure",
    moduleKey: "SECTIONS",
  },
  {
    title: "Subjects",
    href: "/school-admin/subjects",
    icon: BookMarked,
    section: "Academic Structure",
    moduleKey: "SUBJECTS",
  },
  {
    title: "Timetable",
    href: "/school-admin/timetables",
    icon: Clock3,
    section: "Academic Structure",
    moduleKey: "TIMETABLE",
  },

  // 3. STUDENT LIFECYCLE (The User's Flow!)
  {
    title: "Admissions",
    href: "/school-admin/admissions",
    icon: UserPlus,
    section: "Student Lifecycle",
    moduleKey: "ADMISSIONS",
  },
  {
    title: "Enrollments & Promotion",
    href: "/school-admin/enrollments",
    icon: ClipboardPenLine,
    section: "Student Lifecycle",
    moduleKey: "ENROLLMENTS",
  },
  {
    title: "Students Directory",
    href: "/school-admin/students",
    icon: Users,
    section: "Student Lifecycle",
    moduleKey: "STUDENTS",
  },

  // 4. PEOPLE & HR
  {
    title: "Teachers",
    href: "/school-admin/teachers",
    icon: GraduationCap,
    section: "People & HR",
    moduleKey: "TEACHERS",
  },
  {
    title: "Staff Members",
    href: "/school-admin/staff",
    icon: UserCog,
    section: "People & HR",
    moduleKey: "STAFF",
  },
  {
    title: "Parents & Guardians",
    href: "/school-admin/parents",
    icon: UserRound,
    section: "People & HR",
    moduleKey: "PARENTS",
  },

  // 5. DAILY OPERATIONS
  {
    title: "Attendance",
    href: "/school-admin/attendance",
    icon: ClipboardCheck,
    section: "Daily Operations",
    moduleKey: "ATTENDANCE",
  },
  {
    title: "Homework",
    href: "/school-admin/homework",
    icon: FileText,
    section: "Daily Operations",
    moduleKey: "HOMEWORK",
  },
  {
    title: "Examinations",
    href: "/school-admin/exams",
    icon: BookOpenCheck,
    section: "Daily Operations",
    moduleKey: "EXAMS",
  },
  {
    title: "Exam Results",
    href: "/school-admin/results",
    icon: ListChecks,
    section: "Daily Operations",
    moduleKey: "RESULTS",
  },

  // 6. FINANCE & FEES
  {
    title: "Fee Structures",
    href: "/school-admin/fees",
    icon: Wallet,
    section: "Finance & Accounts",
    moduleKey: "FEES",
  },
  {
    title: "Invoices",
    href: "/school-admin/invoices",
    icon: Receipt,
    section: "Finance & Accounts",
    moduleKey: "INVOICES",
  },
  {
    title: "Fee Collections",
    href: "/school-admin/payments",
    icon: IndianRupee,
    section: "Finance & Accounts",
    moduleKey: "PAYMENTS",
  },
  {
    title: "Subscription & Plan",
    href: "/school-admin/subscription",
    icon: CreditCard,
    section: "Finance & Accounts",
    common: true,
  },

  // 7. CAMPUS & CONNECT
  {
    title: "Announcements",
    href: "/school-admin/announcements",
    icon: Megaphone,
    section: "Campus & Connect",
    moduleKey: "ANNOUNCEMENTS",
  },
  {
    title: "Events",
    href: "/school-admin/events",
    icon: Calendar,
    section: "Campus & Connect",
    moduleKey: "EVENTS",
  },
  {
    title: "Leave Requests",
    href: "/school-admin/leave-requests",
    icon: CalendarCheck,
    section: "Campus & Connect",
    moduleKey: "LEAVE_REQUESTS",
  },
  {
    title: "Notifications",
    href: "/school-admin/notifications",
    icon: Bell,
    section: "Campus & Connect",
    moduleKey: "NOTIFICATIONS",
    common: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Teacher                                                                    */
/* -------------------------------------------------------------------------- */

const teacherSidebar: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/teacher/dashboard",
    icon: LayoutDashboard,
    common: true,
  },
  {
    title: "My Classes",
    href: "/teacher/classes",
    icon: BookOpen,
    common: true,
  },
  {
    title: "Students",
    href: "/teacher/students",
    icon: Users,
    moduleKey: "students",
  },
  {
    title: "Attendance",
    href: "/teacher/attendance",
    icon: ClipboardCheck,
    moduleKey: "attendance",
  },
  {
    title: "Assignments",
    href: "/teacher/assignments",
    icon: FileText,
    moduleKey: "homework",
  },
  {
    title: "Results",
    href: "/teacher/results",
    icon: ListChecks,
    moduleKey: "results",
  },
  {
    title: "Profile",
    href: "/teacher/profile",
    icon: UserCircle,
    common: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Parent                                                                     */
/* -------------------------------------------------------------------------- */

const parentSidebar: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/parent/dashboard",
    icon: LayoutDashboard,
    common: true,
  },
  {
    title: "My Children",
    href: "/parent/children",
    icon: Users,
    common: true,
  },
  {
    title: "Attendance",
    href: "/parent/attendance",
    icon: ClipboardCheck,
    moduleKey: "attendance",
  },
  {
    title: "Results",
    href: "/parent/results",
    icon: FileText,
    moduleKey: "results",
  },
  {
    title: "Fees",
    href: "/parent/fees",
    icon: Wallet,
    moduleKey: "fees",
  },
  {
    title: "Notifications",
    href: "/parent/notifications",
    icon: Bell,
    common: true,
  },
  {
    title: "Profile",
    href: "/parent/profile",
    icon: UserCircle,
    common: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Student                                                                    */
/* -------------------------------------------------------------------------- */

const studentSidebar: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
    common: true,
  },
  {
    title: "My Classes",
    href: "/student/classes",
    icon: BookOpen,
    common: true,
  },
  {
    title: "Attendance",
    href: "/student/attendance",
    icon: ClipboardCheck,
    moduleKey: "attendance",
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: FileText,
    moduleKey: "homework",
  },
  {
    title: "Results",
    href: "/student/results",
    icon: FileText,
    moduleKey: "results",
  },
  {
    title: "Profile",
    href: "/student/profile",
    icon: UserCircle,
    common: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Role Based Sidebar                                                        */
/* -------------------------------------------------------------------------- */

export const sidebarByRole: Record<UserRole, SidebarItem[]> = {
  SUPER_ADMIN: superAdminSidebar,
  SCHOOL_ADMIN: schoolAdminSidebar,
  TEACHER: teacherSidebar,
  PARENT: parentSidebar,
  STUDENT: studentSidebar,
};

