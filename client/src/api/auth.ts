import { apiClient } from "./client";
import type { ApiSuccess, User } from "@/types";

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<ApiSuccess<{ token: string; user: User }>>("/auth/login", { email, password });
  return data.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function getMe() {
  const { data } = await apiClient.get<ApiSuccess<User>>("/auth/me");
  return data.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await apiClient.patch<ApiSuccess<User>>("/auth/change-password", { currentPassword, newPassword });
  return data.data;
}
