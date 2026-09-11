import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/authStore";

import LoginPage from "@/pages/auth/LoginPage";

import TrainerDashboardPage from "@/pages/trainer/DashboardPage";
import TraineesListPage from "@/pages/trainer/TraineesListPage";
import TraineeDetailPage from "@/pages/trainer/TraineeDetailPage";
import TrainerProgramPage from "@/pages/trainer/ProgramPage";
import TrainerWeekDetailPage from "@/pages/trainer/WeekDetailPage";
import TrainerTasksPage from "@/pages/trainer/TasksPage";
import TrainerSubmissionsPage from "@/pages/trainer/SubmissionsPage";
import TrainerSubmissionDetailPage from "@/pages/trainer/SubmissionDetailPage";
import TrainerResourcesPage from "@/pages/trainer/ResourcesPage";
import TrainerAnalyticsPage from "@/pages/trainer/AnalyticsPage";
import TrainerSettingsPage from "@/pages/trainer/SettingsPage";

import TraineeDashboardPage from "@/pages/trainee/DashboardPage";
import TraineeProgramPage from "@/pages/trainee/ProgramPage";
import TraineeWeekDetailPage from "@/pages/trainee/WeekDetailPage";
import TraineeTasksPage from "@/pages/trainee/TasksPage";
import TraineeTaskDetailPage from "@/pages/trainee/TaskDetailPage";
import TraineeSubmissionsPage from "@/pages/trainee/SubmissionsPage";
import TraineeFeedbackPage from "@/pages/trainee/FeedbackPage";
import TraineeResourcesPage from "@/pages/trainee/ResourcesPage";
import TraineeProfilePage from "@/pages/trainee/ProfilePage";

import NotFoundPage from "@/pages/NotFoundPage";

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === "TRAINER" ? "/trainer/dashboard" : "/trainee/dashboard"} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={["TRAINER"]} />}>
        <Route element={<DashboardLayout role="TRAINER" />}>
          <Route path="/trainer/dashboard" element={<TrainerDashboardPage />} />
          <Route path="/trainer/trainees" element={<TraineesListPage />} />
          <Route path="/trainer/trainees/:id" element={<TraineeDetailPage />} />
          <Route path="/trainer/program" element={<TrainerProgramPage />} />
          <Route path="/trainer/program/weeks/:weekId" element={<TrainerWeekDetailPage />} />
          <Route path="/trainer/tasks" element={<TrainerTasksPage />} />
          <Route path="/trainer/submissions" element={<TrainerSubmissionsPage />} />
          <Route path="/trainer/submissions/:id" element={<TrainerSubmissionDetailPage />} />
          <Route path="/trainer/resources" element={<TrainerResourcesPage />} />
          <Route path="/trainer/analytics" element={<TrainerAnalyticsPage />} />
          <Route path="/trainer/settings" element={<TrainerSettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["TRAINEE"]} />}>
        <Route element={<DashboardLayout role="TRAINEE" />}>
          <Route path="/trainee/dashboard" element={<TraineeDashboardPage />} />
          <Route path="/trainee/program" element={<TraineeProgramPage />} />
          <Route path="/trainee/program/weeks/:weekId" element={<TraineeWeekDetailPage />} />
          <Route path="/trainee/tasks" element={<TraineeTasksPage />} />
          <Route path="/trainee/tasks/:id" element={<TraineeTaskDetailPage />} />
          <Route path="/trainee/submissions" element={<TraineeSubmissionsPage />} />
          <Route path="/trainee/feedback" element={<TraineeFeedbackPage />} />
          <Route path="/trainee/resources" element={<TraineeResourcesPage />} />
          <Route path="/trainee/profile" element={<TraineeProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
