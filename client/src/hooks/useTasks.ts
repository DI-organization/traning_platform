import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "@/api/tasks";
import type { AssignmentStatus } from "@/types";

export function useTasks(params: tasksApi.ListTasksParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksApi.listTasks(params),
  });
}

export function useTask(id: string | undefined, userId?: string) {
  return useQuery({
    queryKey: ["tasks", id, userId],
    queryFn: () => tasksApi.getTask(id!, userId),
    enabled: Boolean(id),
  });
}

function invalidateTasks(queryClient: ReturnType<typeof useQueryClient>, taskId?: string) {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  if (taskId) queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => invalidateTasks(queryClient),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<tasksApi.CreateTaskInput> }) => tasksApi.updateTask(id, input),
    onSuccess: (_d, vars) => invalidateTasks(queryClient, vars.id),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => invalidateTasks(queryClient),
  });
}

export function useStartTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.startTask(id),
    onSuccess: (_d, id) => invalidateTasks(queryClient, id),
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userId, status }: { taskId: string; userId: string; status: AssignmentStatus }) =>
      tasksApi.updateAssignmentStatus(taskId, userId, status),
    onSuccess: (_d, vars) => invalidateTasks(queryClient, vars.taskId),
  });
}
