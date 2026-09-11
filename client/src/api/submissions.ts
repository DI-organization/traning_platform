import { apiClient } from "./client";
import type { ApiSuccess, Pagination, ReviewDecision, Submission, SubmissionReview } from "@/types";

export interface ListSubmissionsParams {
  page?: number;
  limit?: number;
  userId?: string;
  weekId?: string;
  taskId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export async function listSubmissions(params: ListSubmissionsParams) {
  const { data } = await apiClient.get<ApiSuccess<Submission[]>>("/submissions", { params });
  return { items: data.data, pagination: data.pagination as Pagination };
}

export async function getSubmission(id: string) {
  const { data } = await apiClient.get<ApiSuccess<Submission>>(`/submissions/${id}`);
  return data.data;
}

export interface SubmitWorkInput {
  taskId: string;
  repositoryUrl?: string;
  branchName?: string;
  pullRequestUrl?: string;
  liveDemoUrl?: string;
  notes?: string;
}

export async function createSubmission(input: SubmitWorkInput) {
  const { data } = await apiClient.post<ApiSuccess<Submission>>("/submissions", input);
  return data.data;
}

export async function updateSubmission(id: string, input: Partial<Omit<SubmitWorkInput, "taskId">>) {
  const { data } = await apiClient.patch<ApiSuccess<Submission>>(`/submissions/${id}`, input);
  return data.data;
}

export interface CreateReviewInput {
  decision: ReviewDecision;
  feedback: string;
  scores?: Partial<{
    taskCompletion: number;
    functionality: number;
    codeQuality: number;
    architecture: number;
    gitUsage: number;
    problemSolving: number;
    documentation: number;
    testing: number;
    technicalUnderstanding: number;
  }>;
}

export async function createReview(submissionId: string, input: CreateReviewInput) {
  const { data } = await apiClient.post<ApiSuccess<SubmissionReview>>(`/submissions/${submissionId}/reviews`, input);
  return data.data;
}

export async function refetchGithubMetadata(submissionId: string) {
  await apiClient.post(`/submissions/${submissionId}/github/refetch`);
}
