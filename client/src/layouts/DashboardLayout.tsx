import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import type { Role } from "@/types";

function useBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean).slice(1);
  if (segments.length === 0) return null;
  return segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" / ");
}

export function DashboardLayout({ role }: { role: Role }) {
  const breadcrumb = useBreadcrumb();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar role={role} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar breadcrumb={breadcrumb} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
