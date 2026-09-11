import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as traineesApi from "@/api/trainees";

export function useTrainees(params: traineesApi.ListTraineesParams) {
  return useQuery({
    queryKey: ["trainees", params],
    queryFn: () => traineesApi.listTrainees(params),
  });
}

export function useTraineeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["trainees", id],
    queryFn: () => traineesApi.getTraineeDetail(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTrainee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: traineesApi.createTrainee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trainees"] }),
  });
}

export function useUpdateTrainee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<traineesApi.CreateTraineeInput> }) => traineesApi.updateTrainee(id, input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainees", vars.id] });
    },
  });
}

export function useSetTraineeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => traineesApi.setTraineeStatus(id, isActive),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainees", vars.id] });
    },
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["trainees", "me"],
    queryFn: () => traineesApi.getMyProfile(),
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: traineesApi.updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainees", "me"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
