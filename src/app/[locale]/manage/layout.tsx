import React from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#F6F8F7] overflow-hidden">
        <Sidebar className="hidden md:flex" />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto outline-none p-2 md:p-4">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
