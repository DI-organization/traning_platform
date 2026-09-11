import { apiClient } from "./client";
import type { ApiSuccess, Notification } from "@/types";

export async function listNotifications(unreadOnly = false) {
  const { data } = await apiClient.get<ApiSuccess<{ notifications: Notification[]; unreadCount: number }>>("/notifications", {
    params: unreadOnly ? { unread: "true" } : undefined,
  });
  return data.data;
}

export async function markAsRead(id: string) {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
  await apiClient.patch("/notifications/read-all");
}
