import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as submissionsApi from "@/api/submissions";

export function useSubmissions(params: submissionsApi.ListSubmissionsParams) {
  return useQuery({
    queryKey: ["submissions", params],
    queryFn: () => submissionsApi.listSubmissions(params),
  });
}

export function useSubmission(id: string | undefined) {
  return useQuery({
    queryKey: ["submissions", id],
    queryFn: () => submissionsApi.getSubmission(id!),
    enabled: Boolean(id),
  });
}

function invalidateSubmissions(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["submissions"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["submissions", id] });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["trainees"] });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submissionsApi.createSubmission,
    onSuccess: () => invalidateSubmissions(queryClient),
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof submissionsApi.updateSubmission>[1] }) =>
      submissionsApi.updateSubmission(id, input),
    onSuccess: (_d, vars) => invalidateSubmissions(queryClient, vars.id),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, input }: { submissionId: string; input: submissionsApi.CreateReviewInput }) =>
      submissionsApi.createReview(submissionId, input),
    onSuccess: (_d, vars) => invalidateSubmissions(queryClient, vars.submissionId),
  });
}

export function useRefetchGithubMetadata() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submissionsApi.refetchGithubMetadata,
    onSuccess: (_d, id) => invalidateSubmissions(queryClient, id),
  });
}
