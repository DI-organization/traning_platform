import { apiClient } from "./client";
import type { ActivityLogEntry, ApiSuccess, DashboardKpis, Submission, TraineeProgressRow } from "@/types";

export interface DashboardData {
  kpis: DashboardKpis;
  traineeProgress: TraineeProgressRow[];
  pendingReviews: Submission[];
  recentActivity: ActivityLogEntry[];
}

export async function getDashboard() {
  const { data } = await apiClient.get<ApiSuccess<DashboardData>>("/analytics/dashboard");
  return data.data;
}

export interface AnalyticsData {
  kpis: DashboardKpis;
  weeklyCompletion: { weekNumber: number; title: string; completionPercent: number }[];
  scoreDistribution: { excellent: number; good: number; needsImprovement: number; improvementRequired: number };
  taskStatusDistribution: { status: string; count: number }[];
  taskDifficultyPerformance: { difficulty: string; averageScore: number; count: number }[];
  traineeComparison: TraineeProgressRow[];
}

export async function getAnalytics() {
  const { data } = await apiClient.get<ApiSuccess<AnalyticsData>>("/analytics");
  return data.data;
}
