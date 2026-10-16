"use client";
import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import AppBreadcrumbs from "./Breadcrumbs";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <MobileSidebar />
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
                    <div className="mx-auto w-full p-4 sm:p-6 lg:p-8 min-w-0">
                        <AppBreadcrumbs />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}