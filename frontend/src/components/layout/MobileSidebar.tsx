"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import { GraduationCap, ChevronRight, X } from "lucide-react";

=======
import { X } from "lucide-react";
>>>>>>> d2c4d6ae (chore: prepare project for Vercel and Render deployment)
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

export default function MobileSidebar() {
  const pathname = usePathname();
  const { user, mobileOpen, closeMobile, sidebarItems, } = useSidebar();


<<<<<<< HEAD
  const displayRole =
    user?.role?.replaceAll("_", " ") ?? "SCHOOL ERP";
=======
  const displayRole = user?.role?.replaceAll("_", " ") ?? "USER";
>>>>>>> d2c4d6ae (chore: prepare project for Vercel and Render deployment)

  const displayName = user?.fullName ?? "Admin User";

<<<<<<< HEAD
  const avatarLetter =
    displayName.charAt(0).toUpperCase() || "A";
=======
  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";
>>>>>>> d2c4d6ae (chore: prepare project for Vercel and Render deployment)

  return (
    <>
      {/* Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col",
          "border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-transform duration-300 ease-in-out",
<<<<<<< HEAD
          "lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between bg-sidebar-primary px-4 text-white shadow-xs">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
              <GraduationCap size={22} />
            </div>

            <div className="min-w-0">
              <span className="block truncate text-xl font-black uppercase tracking-wider text-white">
                INIZSOFT
              </span>

              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-white/80">
=======
          "lg:hidden", mobileOpen
          ? "translate-x-0"
          : "-translate-x-full",
        )}
      >
        {/* Header: Banner */}
        <div className="flex h-16 items-center justify-between bg-sidebar-primary text-white px-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-wider text-xl text-white uppercase">INIZSOFT</span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-white/80 uppercase truncate">
>>>>>>> d2c4d6ae (chore: prepare project for Vercel and Render deployment)
                {displayRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation menu"
            className="shrink-0 rounded-lg p-2 text-white transition-colors hover:bg-black/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-3">
          <nav className="space-y-1 px-3">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
<<<<<<< HEAD

              const prevItem =
                index > 0 ? sidebarItems[index - 1] : null;

              const showSection =
                item.section &&
                (!prevItem || prevItem.section !== item.section);

              return (
                <div key={item.href} className="space-y-1">
                  {/* Section Heading */}
                  {showSection && (
                    <div
                      className={cn(
                        "px-3",
                        index === 0 ? "pb-1 pt-1" : "pb-1 pt-4",
                      )}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.section}
                      </p>
                    </div>
                  )}

                  {/* Navigation Link */}
=======
              const prevItem = index > 0 ? sidebarItems[index - 1] : null;

              return (
                <div key={item.href} className="space-y-1">
>>>>>>> d2c4d6ae (chore: prepare project for Vercel and Render deployment)
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5",
                      "transition-all duration-200",
                      active
<<<<<<< HEAD
                        ? "bg-white/10 font-semibold text-white shadow-xs"
                        : "font-medium text-slate-200 hover:bg-white/5 hover:text-white",
=======
                        ? "bg-white/10 text-white font-semibold border-sidebar-primary shadow-xs"
                        : "text-slate-200 hover:bg-white/5 hover:text-white font-medium",
>>>>>>> d2c4d6ae (chore: prepare project for Vercel and Render deployment)
                    )}
                  >
                    <Icon
                      size={20}
                      className={cn(
                        "shrink-0 text-sidebar-icon transition-transform duration-200",
                        !active && "group-hover:scale-110",
                      )}
                    />

                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.title}
                    </span>

                    <ChevronRight
                      size={14}
                      className={cn(
                        "ml-auto shrink-0 text-slate-400 transition-colors",
                        "group-hover:text-white",
                        active && "text-white",
                      )}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile */}
        <div className="shrink-0 border-t border-sidebar-border p-3.5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-white">
                {avatarLetter}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {displayName}
                </p>

                <p className="truncate text-[11px] text-slate-400">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
