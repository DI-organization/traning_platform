import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common/EmptyState";
import { formatRelativeTime } from "@/lib/format";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationsDropdown() {
  const { t } = useTranslation("common");
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">{t("notifications.title")}</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-3.5 w-3.5" />
              {t("actions.markAllRead")}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">{t("notifications.loading")}</div>
          ) : !data || data.notifications.length === 0 ? (
            <EmptyState title={t("notifications.empty")} className="border-0 py-8" />
          ) : (
            data.notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left text-sm last:border-0 hover:bg-accent",
                  !n.isRead && "bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <span className="font-medium">{n.title}</span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                <span className="text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
