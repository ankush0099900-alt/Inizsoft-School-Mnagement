"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ROUTE_LABELS: Record<string, string> = {
  "super-admin": "Super Admin",
  "school-admin": "School Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  dashboard: "Dashboard",
  "academic-years": "Academic Years",
  admissions: "Admissions",
  classes: "Classes",
  sections: "Sections",
  students: "Students",
  subjects: "Subjects",
  teachers: "Teachers",
  timetables: "Timetables",
  parents: "Parents",
  guardians: "Guardians",
  fees: "Fees",
  invoices: "Invoices",
  payments: "Payments",
  "payment-allocations": "Payment Allocations",
  enrollments: "Enrollments",
  homework: "Homework",
  exams: "Exams",
  results: "Results",
  events: "Events",
  "leave-requests": "Leave Requests",
  notifications: "Notifications",
  schools: "Schools",
  plans: "Plans",
  subscriptions: "Subscriptions",
  subscription: "Subscription & Billing",
  checkout: "Plan Checkout",
  payment: "Offline Payment",
  billing: "Billing",
  transactions: "Transactions",
  analytics: "Analytics",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  general: "General",
  security: "Security",
  system: "System",
  profile: "Profile",
  features: "Features",
  activity: "Activity",
  admins: "Admins",
  new: "Create New",
  edit: "Edit",
};

function formatSegment(segment: string, previousSegment?: string): string {
  if (ROUTE_LABELS[segment]) {
    return ROUTE_LABELS[segment];
  }

  // Check if it's an ID (UUID, numeric, mongo id, or hex)
  const isId =
    /^\d+$/.test(segment) ||
    /^[0-9a-fA-F]{24}$/.test(segment) ||
    /^[0-9a-fA-F-]{12,}$/.test(segment);

  if (isId) {
    if (previousSegment && ROUTE_LABELS[previousSegment]) {
      // E.g. "Admissions Details", "Student Details", "School Details"
      const singular = ROUTE_LABELS[previousSegment].replace(/s$/, "");
      return `${singular} Details`;
    }
    return "Details";
  }

  // Capitalize hyphenated words
  return segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default function AppBreadcrumbs() {
  const pathname = usePathname();

  if (!pathname) return null;

  const rawSegments = pathname.split("/").filter(Boolean);
  if (rawSegments.length === 0) return null;

  // Determine root dashboard link
  const firstSegment = rawSegments[0];
  const isDashboardRoute = [
    "school-admin",
    "super-admin",
    "teacher",
    "student",
    "parent",
  ].includes(firstSegment);

  const homeHref = isDashboardRoute ? `/${firstSegment}/dashboard` : "/";
  const rootLabel = isDashboardRoute && ROUTE_LABELS[firstSegment] ? ROUTE_LABELS[firstSegment] : "Dashboard";

  // Build crumbs starting after role or from start
  let displaySegments: string[];
  let basePath: string;

  if (isDashboardRoute) {
    basePath = `/${firstSegment}`;
    displaySegments = rawSegments.slice(1);
  } else {
    basePath = "";
    displaySegments = rawSegments;
  }

  return (
    <div className="w-full pb-3 border-b border-border/40 mb-4 sm:mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home / Dashboard Link */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={homeHref} className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors">
                <Home className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{rootLabel}</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Subsequent Crumb Items */}
          {displaySegments.map((segment, index) => {
            const isLast = index === displaySegments.length - 1;
            const currentPath = `${basePath}/${displaySegments
              .slice(0, index + 1)
              .join("/")}`;
            const previousSegment =
              index > 0 ? displaySegments[index - 1] : undefined;
            const label = formatSegment(segment, previousSegment);

            return (
              <span key={currentPath} className="inline-flex items-center gap-1.5 sm:gap-2">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={currentPath}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
