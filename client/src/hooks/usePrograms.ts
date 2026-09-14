import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as programsApi from "@/api/programs";

export function usePrograms() {
  return useQuery({ queryKey: ["programs"], queryFn: programsApi.listPrograms });
}

export function useProgram(id: string | undefined) {
  return useQuery({
    queryKey: ["programs", id],
    queryFn: () => programsApi.getProgram(id!),
    enabled: Boolean(id),
  });
}

export function useWeek(weekId: string | undefined) {
  return useQuery({
    queryKey: ["weeks", weekId],
    queryFn: () => programsApi.getWeek(weekId!),
    enabled: Boolean(weekId),
  });
}

function invalidateProgramTree(queryClient: ReturnType<typeof useQueryClient>, programId?: string, weekId?: string) {
  queryClient.invalidateQueries({ queryKey: ["programs"] });
  if (programId) queryClient.invalidateQueries({ queryKey: ["programs", programId] });
  if (weekId) queryClient.invalidateQueries({ queryKey: ["weeks", weekId] });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: programsApi.createProgram,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof programsApi.updateProgram>[1] }) => programsApi.updateProgram(id, input),
    onSuccess: (_d, vars) => invalidateProgramTree(queryClient, vars.id),
  });
}

export function useCreatePhase(programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: programsApi.CreatePhaseInput) => programsApi.createPhase(programId, input),
    onSuccess: () => invalidateProgramTree(queryClient, programId),
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phaseId, input }: { phaseId: string; input: Partial<programsApi.CreatePhaseInput> }) =>
      programsApi.updatePhase(phaseId, input),
    onSuccess: (data) => invalidateProgramTree(queryClient, data.programId),
  });
}

export function useCreateWeek(programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: programsApi.CreateWeekInput) => programsApi.createWeek(programId, input),
    onSuccess: () => invalidateProgramTree(queryClient, programId),
  });
}

export function useUpdateWeek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ weekId, input }: { weekId: string; input: Parameters<typeof programsApi.updateWeek>[1] }) =>
      programsApi.updateWeek(weekId, input),
    onSuccess: (data) => invalidateProgramTree(queryClient, data.programId, data.id),
  });
}

export function useSetWeekLock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ weekId, isLocked }: { weekId: string; isLocked: boolean }) => programsApi.setWeekLock(weekId, isLocked),
    onSuccess: (data) => invalidateProgramTree(queryClient, data.programId, data.id),
  });
}

export function useCreateTopic(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, order, content }: { title: string; order?: number; content?: string }) =>
      programsApi.createTopic(weekId, title, order, content),
    onSuccess: () => invalidateProgramTree(queryClient, undefined, weekId),
  });
}

export function useDeleteTopic(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topicId: string) => programsApi.deleteTopic(weekId, topicId),
    onSuccess: () => invalidateProgramTree(queryClient, undefined, weekId),
  });
}

export function useCreateResearchQuestion(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ question, order }: { question: string; order?: number }) => programsApi.createResearchQuestion(weekId, question, order),
    onSuccess: () => invalidateProgramTree(queryClient, undefined, weekId),
  });
}

export function useDeleteResearchQuestion(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => programsApi.deleteResearchQuestion(weekId, questionId),
    onSuccess: () => invalidateProgramTree(queryClient, undefined, weekId),
  });
}

export function useAnswerResearchQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) => programsApi.answerResearchQuestion(questionId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research", "me"] });
      queryClient.invalidateQueries({ queryKey: ["weeks"] });
    },
  });
}

export function useMyResearchAnswers() {
  return useQuery({ queryKey: ["research", "me"], queryFn: programsApi.listMyResearchAnswers });
}

export function useScoreResearchAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ answerId, score, feedback }: { answerId: string; score: number; feedback?: string }) =>
      programsApi.scoreResearchAnswer(answerId, score, feedback),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weeks"] }),
  });
}

// Resources
export function useCreateResource(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<programsApi.CreateResourceInput, "weekId">) => programsApi.createResource({ ...input, weekId }),
    onSuccess: () => invalidateProgramTree(queryClient, undefined, weekId),
  });
}

export function useUpdateResource(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<programsApi.CreateResourceInput> }) => programsApi.updateResource(id, input),
    onSuccess: () => invalidateProgramTree(queryClient, undefined, weekId),
  });
}

export function useDeleteResource(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programsApi.deleteResource(id),
    onSuccess: () => invalidateProgramTree(queryClient, undefined, weekId),
  });
}
