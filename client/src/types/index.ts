export type Role = "TRAINER" | "TRAINEE";

export type WeekUnlockStrategy = "AUTOMATIC_BY_DATE" | "MANUAL";

export type ResourceType = "DOCUMENTATION" | "ARTICLE" | "VIDEO" | "COURSE" | "BOOK" | "OTHER";

export type TaskType = "LEARNING" | "CODING" | "PROBLEM_SOLVING" | "RESEARCH" | "PROJECT";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskDifficulty = "EASY" | "MEDIUM" | "HARD";

export type AssignmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "OVERDUE";

export type SubmissionStatus = "SUBMITTED" | "UNDER_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";

export type ReviewDecision = "APPROVED" | "CHANGES_REQUESTED";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "DEADLINE_TOMORROW"
  | "TASK_OVERDUE"
  | "SUBMISSION_RECEIVED"
  | "SUBMISSION_APPROVED"
  | "CHANGES_REQUESTED"
  | "FEEDBACK_LEFT"
  | "WEEK_AVAILABLE"
  | "GENERAL";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatar: string | null;
  phone: string | null;
  githubUsername: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  progressPercent: number;
}

export interface TraineeListItem extends User {
  currentWeek: number | null;
  enrollmentStatus: string | null;
  progress: ProgressSummary;
  averageScore: number;
  lastActivityAt: string | null;
}

export interface Topic {
  id: string;
  weekId: string;
  title: string;
  content: string;
  order: number;
}

export interface Resource {
  id: string;
  weekId: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  isRequired: boolean;
  estimatedMinutes: number | null;
  topic: string | null;
  order: number;
}

export interface ResearchQuestion {
  id: string;
  weekId: string;
  question: string;
  order: number;
  answers?: ResearchAnswer[];
}

export interface ResearchAnswer {
  id: string;
  questionId: string;
  userId: string;
  answer: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  question?: ResearchQuestion;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  weekId: string;
  type: TaskType;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  points: number;
  estimatedHours: number;
  dueDate: string | null;
  instructions: string;
  acceptanceCriteria: string[];
  order: number;
  isWeeklyProject: boolean;
  createdAt: string;
  updatedAt: string;
  week?: { id: string; weekNumber: number; title: string; programId?: string };
  assignmentStatus?: AssignmentStatus;
  assignment?: TaskAssignment | null;
  submissions?: Submission[];
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  status: AssignmentStatus;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface Week {
  id: string;
  programId: string;
  phaseId: string;
  weekNumber: number;
  title: string;
  description: string;
  objectives: string[];
  weeklyProjectTitle: string | null;
  weeklyProjectDescription: string | null;
  submissionRequirements: string[];
  startDate: string | null;
  endDate: string | null;
  isLocked: boolean;
  topics: Topic[];
  resources: Resource[];
  tasks: Task[];
  researchQuestions: ResearchQuestion[];
}

export interface Phase {
  id: string;
  programId: string;
  phaseNumber: number;
  title: string;
  description: string | null;
  order: number;
  weeks: Week[];
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  totalWeeks: number;
  weekUnlockStrategy: WeekUnlockStrategy;
  isActive: boolean;
  phases?: Phase[];
}

export interface GitHubRepositoryMeta {
  id: string;
  owner: string;
  name: string;
  description: string | null;
  defaultBranch: string | null;
  lastPushAt: string | null;
  stars: number | null;
  forks: number | null;
  languages: string[] | null;
  fetchStatus: "PENDING" | "OK" | "FAILED" | "NOT_FOUND";
}

export interface GitHubPullRequestMeta {
  id: string;
  owner: string;
  repo: string;
  number: number;
  title: string | null;
  state: string | null;
  author: string | null;
  prCreatedAt: string | null;
  prUpdatedAt: string | null;
  mergedAt: string | null;
  fetchStatus: "PENDING" | "OK" | "FAILED" | "NOT_FOUND";
}

export interface Evaluation {
  id: string;
  submissionId: string;
  evaluatorId: string;
  taskCompletion: number;
  functionality: number;
  codeQuality: number;
  architecture: number;
  gitUsage: number;
  problemSolving: number;
  documentation: number;
  testing: number;
  technicalUnderstanding: number;
  totalScore: number;
  createdAt: string;
}

export interface SubmissionReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  decision: ReviewDecision;
  feedback: string;
  createdAt: string;
  reviewer?: { id: string; firstName: string; lastName: string };
}

export interface Submission {
  id: string;
  taskId: string;
  userId: string;
  attemptNumber: number;
  repositoryUrl: string | null;
  branchName: string | null;
  pullRequestUrl: string | null;
  liveDemoUrl: string | null;
  notes: string | null;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  task?: {
    id: string;
    code: string;
    title: string;
    weekId: string;
    points?: number;
    description?: string;
    instructions?: string;
    acceptanceCriteria?: string[];
    priority?: TaskPriority;
    difficulty?: TaskDifficulty;
    week?: { id: string; weekNumber: number; title: string; programId: string };
  };
  user?: { id: string; firstName: string; lastName: string; avatar: string | null; githubUsername: string | null };
  reviews?: SubmissionReview[];
  evaluation?: Evaluation | null;
  githubRepository?: GitHubRepositoryMeta | null;
  githubPullRequest?: GitHubPullRequestMeta | null;
  history?: { id: string; attemptNumber: number; status: SubmissionStatus; submittedAt: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  type: string;
  description: string;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; avatar: string | null; role: Role };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export interface DashboardKpis {
  totalTrainees: number;
  activeTrainees: number;
  overallCompletionPercent: number;
  tasksCompleted: number;
  tasksPending: number;
  overdueTasks: number;
  pendingReviews: number;
  averageScore: number;
}

export interface TraineeProgressRow {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  isActive: boolean;
  currentWeek: number | null;
  enrollmentStatus: string | null;
  completedTasks: number;
  totalTasks: number;
  progressPercent: number;
  averageScore: number;
  lastActivityAt: string | null;
}
