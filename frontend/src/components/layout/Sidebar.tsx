"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, GraduationCap, Menu } from "lucide-react";

import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, collapsed, toggle, sidebarItems } = useSidebar();

  return (
    <aside className={cn("hidden lg:flex", "sticky top-0 h-screen", "border-r border-sidebar-border", "bg-sidebar text-sidebar-foreground", "transition-all duration-300 ease-in-out", "flex-col", collapsed ? "w-20" : "w-72",)}>
      {/* Header:  Banner */}
      <div className="flex h-16 items-center justify-between bg-sidebar-primary text-white px-2 shrink-0 shadow-xs">
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-wider text-xl text-white uppercase">INIZSOFT</span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-white/80 uppercase truncate">
                {user?.role?.replaceAll("_", " ") ?? "SCHOOL ERP"}
              </p>
            </div>
          </div>
        ) : (
          ''
        )}

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-black/10 text-white"
        >
          <Menu size={18} className={cn("transition-transform duration-300", collapsed && "rotate-90",)} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const prevItem = index > 0 ? sidebarItems[index - 1] : null;

            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex cursor-pointer items-center rounded-xl transition-all duration-200",
                    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-2 py-2.5",
                    active
                      ? "bg-white/10 text-white font-semibold border-sidebar-primary shadow-xs"
                      : "text-slate-200 hover:bg-white/5 hover:text-white font-medium",
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-transform duration-200 shrink-0 text-sidebar-icon",
                      !active && "group-hover:scale-110",
                    )}
                  />

                  {!collapsed && (
                    <span className="text-base font-medium truncate flex-1">
                      {item.title}
                    </span>
                  )}

                  {!collapsed && (
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-white shrink-0 ml-auto" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3.5">
        {!collapsed ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-white font-bold text-sm">
                {user?.fullName?.charAt(0).toUpperCase() ?? "A"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.fullName ?? "Admin User"}
                </p>

                <p className="truncate text-[11px] text-slate-400">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-white font-bold text-sm">
              {user?.fullName?.charAt(0).toUpperCase() ?? "A"}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}