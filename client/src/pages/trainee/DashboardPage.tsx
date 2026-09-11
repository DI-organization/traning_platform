import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Github, Star } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import { useMyProfile } from "@/hooks/useTrainees";
import { useProgram } from "@/hooks/usePrograms";
import { useTasks } from "@/hooks/useTasks";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDate, formatRelativeTime } from "@/lib/format";

export default function TraineeDashboardPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading: profileLoading, isError, refetch } = useMyProfile();
  const programId = profile?.enrollment?.program.id;
  const { data: program, isLoading: programLoading } = useProgram(programId);
  const { data: notifData } = useNotifications();

  const currentWeek = useMemo(
    () => program?.weeks?.find((w) => w.weekNumber === profile?.enrollment?.currentWeek),
    [program, profile]
  );

  const { data: weekTasks } = useTasks({ weekId: currentWeek?.id, userId: user?.id, limit: 50 });

  const nextTask = weekTasks?.items.find((task) => task.assignmentStatus === "NOT_STARTED" || task.assignmentStatus === "IN_PROGRESS");

  const upcomingDeadlines = useMemo(() => {
    if (!weekTasks) return [];
    const now = Date.now();
    return weekTasks.items
      .filter((task) => task.dueDate && new Date(task.dueDate).getTime() > now && task.assignmentStatus !== "APPROVED")
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 4);
  }, [weekTasks]);

  const latestFeedback = profile?.submissions.find((s) => s.reviews && s.reviews.length > 0);

  if (profileLoading || programLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !profile) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard:trainee.welcome", { name: user?.firstName ?? "" })}
        description={
          profile.enrollment
            ? t("dashboard:trainee.weekProgress", {
                week: profile.enrollment.currentWeek,
                total: program?.totalWeeks ?? 12,
                title: currentWeek?.title ?? "",
              })
            : t("dashboard:trainee.notEnrolled")
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t("dashboard:trainee.kpi.overallProgress")} value={`${profile.overallProgress.progressPercent}%`} icon={BookOpen} />
        <StatCard label={t("dashboard:trainee.kpi.averageScore")} value={profile.averageScore} icon={Star} tone="success" />
        <StatCard label={t("dashboard:trainee.kpi.completedTasks")} value={profile.overallProgress.completedTasks} icon={CheckCircle2} tone="success" />
        <StatCard label={t("dashboard:trainee.kpi.pendingTasks")} value={profile.overallProgress.pendingTasks} icon={Clock} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("dashboard:trainee.continueLearning")}</CardTitle>
            {currentWeek && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/trainee/program/weeks/${currentWeek.id}`}>{t("dashboard:trainee.viewWeek")} <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!nextTask ? (
              <EmptyState className="border-0" title={t("dashboard:trainee.allCaughtUp")} description={t("dashboard:trainee.noPendingTasks")} />
            ) : (
              <Link to={`/trainee/tasks/${nextTask.id}`} className="block rounded-lg border p-4 hover:bg-accent">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline">{nextTask.code}</Badge>
                  <StatusBadge status={nextTask.assignmentStatus ?? "NOT_STARTED"} />
                </div>
                <p className="font-medium">{nextTask.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{nextTask.description}</p>
                <div className="mt-2 flex items-center gap-1 text-sm font-medium text-primary">
                  {t("dashboard:trainee.startWorking")} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("dashboard:trainee.upcomingDeadlines")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <EmptyState className="border-0 py-8" title={t("dashboard:trainee.noUpcomingDeadlines")} />
            ) : (
              upcomingDeadlines.map((task) => (
                <Link key={task.id} to={`/trainee/tasks/${task.id}`} className="flex items-center justify-between rounded-md border p-2.5 text-sm hover:bg-accent">
                  <div>
                    <p className="font-medium">{task.code}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("dashboard:trainee.latestFeedback")}</CardTitle></CardHeader>
          <CardContent>
            {!latestFeedback || !latestFeedback.reviews?.length ? (
              <EmptyState className="border-0 py-8" title={t("dashboard:trainee.noFeedbackYet")} />
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{latestFeedback.task?.code}</p>
                  <StatusBadge status={latestFeedback.reviews[0].decision} />
                </div>
                <p className="text-muted-foreground">{latestFeedback.reviews[0].feedback}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(latestFeedback.reviews[0].createdAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Github className="h-4 w-4" />
            <CardTitle>{t("dashboard:trainee.githubActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {!profile.githubProfile ? (
              <EmptyState className="border-0 py-8" title={t("dashboard:trainee.noGithubLinked")} description={t("dashboard:trainee.noGithubLinkedDescription")} />
            ) : profile.submissions.filter((s) => s.repositoryUrl).length === 0 ? (
              <EmptyState className="border-0 py-8" title={t("dashboard:trainee.noRepoActivity")} />
            ) : (
              <div className="space-y-2">
                {profile.submissions
                  .filter((s) => s.repositoryUrl)
                  .slice(0, 4)
                  .map((s) => (
                    <a
                      key={s.id}
                      href={s.repositoryUrl ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-md border p-2.5 text-sm hover:bg-accent"
                    >
                      <span className="truncate">{s.task?.code} — {s.repositoryUrl?.replace(/^https?:\/\/(www\.)?github\.com\//, "")}</span>
                      <StatusBadge status={s.status} />
                    </a>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {notifData && notifData.unreadCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("dashboard:trainee.unreadNotifications", { count: notifData.unreadCount })}
        </p>
      )}
    </div>
  );
}
