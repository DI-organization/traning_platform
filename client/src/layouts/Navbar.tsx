import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, User as UserIcon, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationsDropdown } from "@/components/common/NotificationsDropdown";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useLogout } from "@/hooks/useAuth";
import { initials } from "@/lib/format";

export function Navbar({ breadcrumb }: { breadcrumb?: React.ReactNode }) {
  const { t } = useTranslation(["nav", "common"]);
  const user = useAuthStore((s) => s.user);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) return null;
  const settingsPath = user.role === "TRAINER" ? "/trainer/settings" : "/trainee/profile";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-3 overflow-hidden">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="truncate text-sm text-muted-foreground">{breadcrumb}</div>
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <NotificationsDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full">
              <Avatar>
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback>{initials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(settingsPath)}>
              <UserIcon className="h-4 w-4" /> {t("nav:profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(settingsPath)}>
              <Settings className="h-4 w-4" /> {t("nav:settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> {t("common:actions.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
