import { apiClient } from "./client";
import type { ApiSuccess, AssignmentStatus, Pagination, Task, TaskAssignment } from "@/types";

export interface ListTasksParams {
  page?: number;
  limit?: number;
  weekId?: string;
  type?: string;
  status?: AssignmentStatus;
  search?: string;
  userId?: string;
}

export async function listTasks(params: ListTasksParams) {
  const { data } = await apiClient.get<ApiSuccess<Task[]>>("/tasks", { params });
  return { items: data.data, pagination: data.pagination as Pagination };
}

export async function getTask(id: string, userId?: string) {
  const { data } = await apiClient.get<ApiSuccess<Task>>(`/tasks/${id}`, { params: userId ? { userId } : undefined });
  return data.data;
}

export interface CreateTaskInput {
  code: string;
  title: string;
  description: string;
  weekId: string;
  type: Task["type"];
  priority: Task["priority"];
  difficulty: Task["difficulty"];
  points: number;
  estimatedHours: number;
  dueDate?: string;
  instructions: string;
  acceptanceCriteria: string[];
  isWeeklyProject?: boolean;
  order?: number;
}

export async function createTask(input: CreateTaskInput) {
  const { data } = await apiClient.post<ApiSuccess<Task>>("/tasks", input);
  return data.data;
}

export async function updateTask(id: string, input: Partial<CreateTaskInput>) {
  const { data } = await apiClient.patch<ApiSuccess<Task>>(`/tasks/${id}`, input);
  return data.data;
}

export async function deleteTask(id: string) {
  await apiClient.delete(`/tasks/${id}`);
}

export async function reorderTasks(weekId: string, taskIds: string[]) {
  const { data } = await apiClient.post<ApiSuccess<Task[]>>(`/tasks/week/${weekId}/reorder`, { taskIds });
  return data.data;
}

export async function startTask(id: string) {
  const { data } = await apiClient.post<ApiSuccess<TaskAssignment>>(`/tasks/${id}/start`);
  return data.data;
}

export async function updateAssignmentStatus(taskId: string, userId: string, status: AssignmentStatus) {
  const { data } = await apiClient.patch<ApiSuccess<TaskAssignment>>(`/tasks/${taskId}/assignments/${userId}`, { status });
  return data.data;
}
