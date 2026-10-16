"use client";

import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Award,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const studentName = user?.fullName || "Student";

  const statCards = [
    {
      label: "Attendance Rate",
      value: "96.5%",
      icon: ClipboardCheck,
      color: "bg-[#d1f3e0] text-[#00b074]",
      subtext: "Present 42 / 44 Days",
    },
    {
      label: "Pending Homework",
      value: "2",
      icon: FileText,
      color: "bg-[#fff2d8] text-[#ffa000]",
      subtext: "Due this week",
    },
    {
      label: "Enrolled Subjects",
      value: "6",
      icon: BookOpen,
      color: "bg-[#e1f1ff] text-[#3f78e0]",
      subtext: "Current Semester",
    },
    {
      label: "Latest Average",
      value: "A (88%)",
      icon: Award,
      color: "bg-[#ede7f6] text-[#673ab7]",
      subtext: "Mid-Term Exams",
    },
  ];

  const quickLinks = [
    {
      title: "View Timetable",
      description: "Check daily class schedule and period timings",
      href: "/student/classes",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "My Attendance",
      description: "Review detailed monthly attendance breakdown",
      href: "/student/attendance",
      icon: ClipboardCheck,
      color: "text-emerald-500",
    },
    {
      title: "Homework & Tasks",
      description: "Submit pending homework and view teacher feedback",
      href: "/student/assignments",
      icon: FileText,
      color: "text-amber-500",
    },
    {
      title: "Exam Results",
      description: "View published report cards and grade analysis",
      href: "/student/results",
      icon: Award,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 via-primary to-primary/80 p-8 text-primary-foreground shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Student Learning Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {studentName}!
          </h1>
          <p className="text-sm opacity-90 leading-relaxed">
            Stay on top of your studies. Check today&apos;s schedule, review your homework deadlines, and keep track of your academic performance.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <GraduationCap className="h-72 w-72" />
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-border"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.color} shadow-xs transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div className="text-right min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                  {card.label}
                </p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-1 truncate">
                  {card.value}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Actions & Timetable Highlight */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Quick Access
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Frequently accessed academic modules
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-5 transition-all duration-200 hover:bg-muted/40 hover:border-primary/40 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl bg-background border border-border shadow-xs ${item.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule Preview */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Today&apos;s Class Schedule
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                Active Term
              </span>
            </div>

            <div className="divide-y divide-border/60">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center w-16">
                    <p className="text-xs font-bold text-foreground">09:00 AM</p>
                    <p className="text-[10px] text-muted-foreground">Period 1</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Mathematics</h4>
                    <p className="text-xs text-muted-foreground">Room 101 • Advanced Algebra</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">Completed</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center w-16">
                    <p className="text-xs font-bold text-foreground">10:00 AM</p>
                    <p className="text-[10px] text-muted-foreground">Period 2</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Physics</h4>
                    <p className="text-xs text-muted-foreground">Lab B • Electromagnetism</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">Completed</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center w-16">
                    <p className="text-xs font-bold text-primary font-mono">11:15 AM</p>
                    <p className="text-[10px] text-primary font-semibold">Period 3</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">English Literature</h4>
                    <p className="text-xs text-muted-foreground">Room 104 • Shakespeare Analysis</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-primary/15 text-primary font-bold animate-pulse">Now In Session</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center w-16">
                    <p className="text-xs font-bold text-foreground">01:00 PM</p>
                    <p className="text-[10px] text-muted-foreground">Period 4</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Computer Science</h4>
                    <p className="text-xs text-muted-foreground">Lab A • Database Management</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-medium">Upcoming</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notices & Upcoming Events */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notice Board */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-foreground">
                  Notice Board
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-primary">Academic Notice</span>
                  <span>Today</span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  Mid-Term Exam Schedule Published
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Final timetable for upcoming semester exams is now posted on the exam portal.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-semibold text-emerald-600">Event</span>
                  <span>2 days ago</span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  Annual Sports Meet Registration
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Students interested in track and field events should contact the physical education department.
                </p>
              </div>
            </div>
          </div>

          {/* Student Profile Quick View */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-2xl mb-4 border border-primary/20">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-foreground text-base">{studentName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            <div className="mt-4 pt-4 border-t border-border/60 flex justify-center gap-2">
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Role: Student
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
