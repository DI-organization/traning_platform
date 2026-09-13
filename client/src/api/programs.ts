import { apiClient } from "./client";
import type { ApiSuccess, Phase, ResearchAnswer, ResearchQuestion, Resource, Topic, TrainingProgram, Week } from "@/types";

export async function listPrograms() {
  const { data } = await apiClient.get<ApiSuccess<TrainingProgram[]>>("/programs");
  return data.data;
}

export async function getProgram(id: string) {
  const { data } = await apiClient.get<ApiSuccess<TrainingProgram>>(`/programs/${id}`);
  return data.data;
}

export interface CreateProgramInput {
  title: string;
  description: string;
  totalWeeks: number;
  weekUnlockStrategy: "AUTOMATIC_BY_DATE" | "MANUAL";
}

export async function createProgram(input: CreateProgramInput) {
  const { data } = await apiClient.post<ApiSuccess<TrainingProgram>>("/programs", input);
  return data.data;
}

export async function updateProgram(id: string, input: Partial<CreateProgramInput & { isActive: boolean }>) {
  const { data } = await apiClient.patch<ApiSuccess<TrainingProgram>>(`/programs/${id}`, input);
  return data.data;
}

export interface CreatePhaseInput {
  phaseNumber: number;
  title: string;
  description?: string;
  order?: number;
}

export async function createPhase(programId: string, input: CreatePhaseInput) {
  const { data } = await apiClient.post<ApiSuccess<Phase>>(`/programs/${programId}/phases`, input);
  return data.data;
}

export async function updatePhase(phaseId: string, input: Partial<CreatePhaseInput>) {
  const { data } = await apiClient.patch<ApiSuccess<Phase>>(`/programs/phases/${phaseId}`, input);
  return data.data;
}

export async function deletePhase(phaseId: string) {
  await apiClient.delete(`/programs/phases/${phaseId}`);
}

export interface CreateWeekInput {
  phaseId: string;
  weekNumber: number;
  title: string;
  description: string;
  objectives: string[];
  weeklyProjectTitle?: string;
  weeklyProjectDescription?: string;
  submissionRequirements: string[];
  startDate?: string;
  endDate?: string;
}

export async function createWeek(programId: string, input: CreateWeekInput) {
  const { data } = await apiClient.post<ApiSuccess<Week>>(`/programs/${programId}/weeks`, input);
  return data.data;
}

export async function getWeek(weekId: string) {
  const { data } = await apiClient.get<ApiSuccess<Week>>(`/weeks/${weekId}`);
  return data.data;
}

export async function updateWeek(weekId: string, input: Partial<CreateWeekInput> & { isLocked?: boolean }) {
  const { data } = await apiClient.patch<ApiSuccess<Week>>(`/weeks/${weekId}`, input);
  return data.data;
}

export async function setWeekLock(weekId: string, isLocked: boolean) {
  const { data } = await apiClient.patch<ApiSuccess<Week>>(`/weeks/${weekId}/lock`, { isLocked });
  return data.data;
}

export async function createTopic(weekId: string, title: string, order = 0) {
  const { data } = await apiClient.post<ApiSuccess<Topic>>(`/weeks/${weekId}/topics`, { title, order });
  return data.data;
}

export async function deleteTopic(weekId: string, topicId: string) {
  await apiClient.delete(`/weeks/${weekId}/topics/${topicId}`);
}

export async function createResearchQuestion(weekId: string, question: string, order = 0) {
  const { data } = await apiClient.post<ApiSuccess<ResearchQuestion>>(`/weeks/${weekId}/research-questions`, { question, order });
  return data.data;
}

export async function deleteResearchQuestion(weekId: string, questionId: string) {
  await apiClient.delete(`/weeks/${weekId}/research-questions/${questionId}`);
}

export async function answerResearchQuestion(questionId: string, answer: string) {
  const { data } = await apiClient.post<ApiSuccess<ResearchAnswer>>(`/research/questions/${questionId}/answers`, { answer });
  return data.data;
}

export async function scoreResearchAnswer(answerId: string, score: number, feedback?: string) {
  const { data } = await apiClient.patch<ApiSuccess<ResearchAnswer>>(`/research/answers/${answerId}/score`, { score, feedback });
  return data.data;
}

export async function listMyResearchAnswers() {
  const { data } = await apiClient.get<ApiSuccess<ResearchAnswer[]>>("/research/answers/me");
  return data.data;
}

// Resources
export interface CreateResourceInput {
  weekId: string;
  title: string;
  description: string;
  url: string;
  type: Resource["type"];
  isRequired: boolean;
  estimatedMinutes?: number;
  topic?: string;
  order?: number;
}

export async function createResource(input: CreateResourceInput) {
  const { data } = await apiClient.post<ApiSuccess<Resource>>("/resources", input);
  return data.data;
}

export async function updateResource(id: string, input: Partial<CreateResourceInput>) {
  const { data } = await apiClient.patch<ApiSuccess<Resource>>(`/resources/${id}`, input);
  return data.data;
}

export async function deleteResource(id: string) {
  await apiClient.delete(`/resources/${id}`);
}
