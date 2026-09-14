import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ListChecks,
  FileCheck2,
  Library,
  BarChart3,
  Settings,
  GraduationCap,
  ClipboardList,
  Star,
  UserCircle,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";
import type { Role } from "@/types";

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const trainerNav: NavItem[] = [
  { to: "/trainer/dashboard", labelKey: "nav:trainer.dashboard", icon: LayoutDashboard },
  { to: "/trainer/trainees", labelKey: "nav:trainer.trainees", icon: Users },
  { to: "/trainer/program", labelKey: "nav:trainer.program", icon: BookOpen },
  { to: "/trainer/tasks", labelKey: "nav:trainer.tasks", icon: ListChecks },
  { to: "/trainer/submissions", labelKey: "nav:trainer.submissions", icon: FileCheck2 },
  { to: "/trainer/resources", labelKey: "nav:trainer.resources", icon: Library },
  { to: "/trainer/analytics", labelKey: "nav:trainer.analytics", icon: BarChart3 },
  { to: "/trainer/settings", labelKey: "nav:trainer.settings", icon: Settings },
];

const traineeNav: NavItem[] = [
  { to: "/trainee/dashboard", labelKey: "nav:trainee.dashboard", icon: LayoutDashboard },
  { to: "/trainee/program", labelKey: "nav:trainee.program", icon: BookOpen },
  { to: "/trainee/tasks", labelKey: "nav:trainee.tasks", icon: ClipboardList },
  { to: "/trainee/submissions", labelKey: "nav:trainee.submissions", icon: FileCheck2 },
  { to: "/trainee/feedback", labelKey: "nav:trainee.feedback", icon: Star },
  { to: "/trainee/resources", labelKey: "nav:trainee.resources", icon: Library },
  { to: "/trainee/profile", labelKey: "nav:trainee.profile", icon: UserCircle },
];

export function Sidebar({ role }: { role: Role }) {
  const { t } = useTranslation(["nav"]);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);

  const items = role === "TRAINER" ? trainerNav : traineeNav;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:sticky lg:inset-y-auto lg:top-0 lg:bottom-auto lg:z-0 lg:h-screen",
          collapsed ? "lg:w-[68px]" : "lg:w-64",
          "w-64",
          mobileOpen ? "left-0" : "-left-64 lg:left-0"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="gradient-primary shadow-glow flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            {!collapsed && <span className="truncate text-sm font-semibold tracking-tight">Training Platform</span>}
          </div>
          <button className="text-sidebar-foreground/70 hover:text-sidebar-foreground lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2 scrollbar-thin">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    : "text-sidebar-foreground/65 hover:bg-white/[0.04] hover:text-sidebar-foreground"
                )
              }
              title={collapsed ? t(item.labelKey) : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="gradient-primary absolute inset-y-1 start-0 w-[3px] rounded-full shadow-glow" />
                  )}
                  <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive && "text-primary")} />
                  {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={toggleSidebar}
          className="hidden items-center justify-center gap-2 border-t border-sidebar-border px-3 py-3 text-xs text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground lg:flex"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && t("nav:collapse")}
        </button>
      </aside>
    </>
  );
}
