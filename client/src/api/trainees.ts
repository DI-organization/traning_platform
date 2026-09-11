import { apiClient } from "./client";
import type { ApiSuccess, Pagination, Submission, TraineeListItem, User } from "@/types";

export interface ListTraineesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
}

export async function listTrainees(params: ListTraineesParams) {
  const { data } = await apiClient.get<ApiSuccess<TraineeListItem[]>>("/trainees", { params });
  return { items: data.data, pagination: data.pagination as Pagination };
}

export interface TraineeDetail extends User {
  enrollment: { id: string; currentWeek: number; status: string; program: { id: string; title: string } } | null;
  overallProgress: { totalTasks: number; completedTasks: number; pendingTasks: number; overdueTasks: number; progressPercent: number };
  averageScore: number;
  submissions: Submission[];
  activity: { id: string; type: string; description: string; createdAt: string }[];
  githubProfile: { username: string; profileUrl: string } | null;
}

export async function getTraineeDetail(id: string) {
  const { data } = await apiClient.get<ApiSuccess<TraineeDetail>>(`/trainees/${id}`);
  return data.data;
}

export interface CreateTraineeInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  githubUsername?: string;
}

export async function createTrainee(input: CreateTraineeInput) {
  const { data } = await apiClient.post<ApiSuccess<User>>("/trainees", input);
  return data.data;
}

export async function updateTrainee(id: string, input: Partial<CreateTraineeInput>) {
  const { data } = await apiClient.patch<ApiSuccess<User>>(`/trainees/${id}`, input);
  return data.data;
}

export async function setTraineeStatus(id: string, isActive: boolean) {
  const { data } = await apiClient.patch<ApiSuccess<User>>(`/trainees/${id}/status`, { isActive });
  return data.data;
}

export async function getMyProfile() {
  const { data } = await apiClient.get<ApiSuccess<TraineeDetail>>("/users/me/profile");
  return data.data;
}

export async function updateMyProfile(input: Partial<{ firstName: string; lastName: string; phone: string; githubUsername: string; avatar: string }>) {
  const { data } = await apiClient.patch<ApiSuccess<User>>("/users/me", input);
  return data.data;
}
