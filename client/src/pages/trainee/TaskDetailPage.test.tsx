import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/testUtils";
import TraineeTaskDetailPage from "./TaskDetailPage";
import * as tasksApi from "@/api/tasks";
import * as submissionsApi from "@/api/submissions";
import * as githubApi from "@/api/github";
import { useAuthStore } from "@/store/authStore";
import type { Task, User } from "@/types";

vi.mock("@/api/tasks");
vi.mock("@/api/submissions");
vi.mock("@/api/github");
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const fakeUser: User = {
  id: "trainee-1",
  firstName: "Ahmad",
  lastName: "Yousef",
  email: "trainee1@example.com",
  role: "TRAINEE",
  avatar: null,
  phone: null,
  githubUsername: null,
  isActive: true,
  mustChangePassword: false,
  lastLoginAt: null,
  createdAt: "",
  updatedAt: "",
};

const baseTask: Task = {
  id: "task-1",
  code: "JS-001",
  title: "Variables & Conditionals Practice",
  description: "Small warm-up exercises covering variables and conditionals.",
  weekId: "week-1",
  type: "CODING",
  priority: "MEDIUM",
  difficulty: "EASY",
  points: 10,
  estimatedHours: 1.5,
  dueDate: null,
  instructions: "Write a few small functions.",
  acceptanceCriteria: ["Handles edge cases"],
  order: 0,
  isWeeklyProject: false,
  createdAt: "",
  updatedAt: "",
  week: { id: "week-1", weekNumber: 1, title: "Week 1" },
  assignment: { id: "a1", taskId: "task-1", userId: "trainee-1", status: "IN_PROGRESS", dueDate: null, startedAt: null, completedAt: null },
  submissions: [],
};

function renderTaskDetail() {
  return renderWithProviders(
    <Routes>
      <Route path="/trainee/tasks/:id" element={<TraineeTaskDetailPage />} />
    </Routes>,
    { route: "/trainee/tasks/task-1" }
  );
}

describe("Trainee task submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: "fake-token", user: fakeUser });
    vi.mocked(tasksApi.getTask).mockResolvedValue(baseTask);
    vi.mocked(githubApi.lookupRepository).mockResolvedValue({ owner: "octocat", repo: "hello-world", status: "OK" });
  });

  it("lets a trainee submit a repository URL for review", async () => {
    vi.mocked(submissionsApi.createSubmission).mockResolvedValue({
      id: "sub-1",
      taskId: "task-1",
      userId: "trainee-1",
      attemptNumber: 1,
      repositoryUrl: "https://github.com/octocat/hello-world",
      branchName: null,
      pullRequestUrl: null,
      liveDemoUrl: null,
      notes: null,
      status: "SUBMITTED",
      submittedAt: "",
      reviewedAt: null,
    });

    const user = userEvent.setup();
    renderTaskDetail();

    await screen.findByText(/variables & conditionals practice/i);

    await user.type(screen.getByPlaceholderText("https://github.com/you/project"), "https://github.com/octocat/hello-world");
    await user.click(screen.getByRole("button", { name: /submit work/i }));

    await waitFor(() => {
      expect(submissionsApi.createSubmission).toHaveBeenCalled();
    });
    expect(vi.mocked(submissionsApi.createSubmission).mock.calls[0][0]).toMatchObject({
      taskId: "task-1",
      repositoryUrl: "https://github.com/octocat/hello-world",
    });
  });

  it("blocks submission when neither a repository nor a pull request URL is provided", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    renderTaskDetail();

    await screen.findByText(/variables & conditionals practice/i);
    await user.click(screen.getByRole("button", { name: /submit work/i }));

    expect(toast.error).toHaveBeenCalled();
    expect(submissionsApi.createSubmission).not.toHaveBeenCalled();
  });

  it("shows the task's instructions and acceptance criteria", async () => {
    renderTaskDetail();

    await screen.findByText(/variables & conditionals practice/i);

    expect(screen.getByText(/write a few small functions/i)).toBeInTheDocument();
    expect(screen.getByText(/handles edge cases/i)).toBeInTheDocument();
  });
});
