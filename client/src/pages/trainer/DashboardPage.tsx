import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users, UserCheck, CheckCircle2, Clock, AlertTriangle, FileCheck2, Star, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/hooks/useAnalytics";
import { formatRelativeTime, initials } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";

export default function TrainerDashboardPage() {
  const { t } = useTranslation(["dashboard", "common"]);
  const trainer = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard:trainer.welcome", { name: trainer?.firstName ?? "" })}
        description={t("dashboard:trainer.subtitle")}
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} description={t("dashboard:trainer.loadError")} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label={t("dashboard:trainer.kpi.totalTrainees")} value={data?.kpis.totalTrainees ?? 0} icon={Users} loading={isLoading} />
            <StatCard label={t("dashboard:trainer.kpi.activeTrainees")} value={data?.kpis.activeTrainees ?? 0} icon={UserCheck} tone="success" loading={isLoading} />
            <StatCard label={t("dashboard:trainer.kpi.overallCompletion")} value={`${data?.kpis.overallCompletionPercent ?? 0}%`} icon={TrendingUp} loading={isLoading} />
            <StatCard label={t("dashboard:trainer.kpi.averageScore")} value={data?.kpis.averageScore ?? 0} icon={Star} tone="success" loading={isLoading} />
            <StatCard label={t("dashboard:trainer.kpi.tasksCompleted")} value={data?.kpis.tasksCompleted ?? 0} icon={CheckCircle2} tone="success" loading={isLoading} />
            <StatCard label={t("dashboard:trainer.kpi.tasksPending")} value={data?.kpis.tasksPending ?? 0} icon={Clock} tone="warning" loading={isLoading} />
            <StatCard label={t("dashboard:trainer.kpi.overdueTasks")} value={data?.kpis.overdueTasks ?? 0} icon={AlertTriangle} tone="destructive" loading={isLoading} />
            <StatCard label={t("dashboard:trainer.kpi.pendingReviews")} value={data?.kpis.pendingReviews ?? 0} icon={FileCheck2} tone="warning" loading={isLoading} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("dashboard:trainer.traineeProgress")}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/trainer/trainees">{t("common:actions.viewAll")}</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : !data || data.traineeProgress.length === 0 ? (
                  <EmptyState title={t("dashboard:trainer.noTrainees")} description={t("dashboard:trainer.noTraineesDescription")} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common:table.trainee")}</TableHead>
                        <TableHead>{t("common:table.week")}</TableHead>
                        <TableHead>{t("common:table.progress")}</TableHead>
                        <TableHead>{t("common:table.score")}</TableHead>
                        <TableHead>{t("common:table.lastActivity")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.traineeProgress.map((t2) => (
                        <TableRow key={t2.id} className="cursor-pointer">
                          <TableCell>
                            <Link to={`/trainer/trainees/${t2.id}`} className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback>{initials(t2.firstName, t2.lastName)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{t2.firstName} {t2.lastName}</span>
                              {!t2.isActive && <Badge variant="secondary">{t("common:status.inactive")}</Badge>}
                            </Link>
                          </TableCell>
                          <TableCell>{t2.currentWeek ?? "—"}</TableCell>
                          <TableCell className="w-40">
                            <div className="flex items-center gap-2">
                              <Progress value={t2.progressPercent} className="h-1.5 w-24" />
                              <span className="text-xs text-muted-foreground">{t2.progressPercent}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{t2.averageScore}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(t2.lastActivityAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("dashboard:trainer.pendingReviewsTitle")}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/trainer/submissions">{t("common:actions.viewAll")}</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <TableSkeleton rows={3} cols={1} />
                ) : !data || data.pendingReviews.length === 0 ? (
                  <EmptyState title={t("dashboard:trainer.allCaughtUp")} description={t("dashboard:trainer.noSubmissionsAwaiting")} className="py-8" />
                ) : (
                  data.pendingReviews.map((s) => (
                    <Link
                      key={s.id}
                      to={`/trainer/submissions/${s.id}`}
                      className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent"
                    >
                      <div>
                        <p className="font-medium">{s.task?.code} — {s.user?.firstName} {s.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(s.submittedAt)}</p>
                      </div>
                      <Badge variant="warning">{t("dashboard:trainer.review")}</Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard:trainer.recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <TableSkeleton rows={4} cols={1} />
              ) : !data || data.recentActivity.length === 0 ? (
                <EmptyState title={t("dashboard:trainer.noRecentActivity")} className="py-8" />
              ) : (
                data.recentActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-sm">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{a.user ? initials(a.user.firstName, a.user.lastName) : "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p>{a.description}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(a.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
