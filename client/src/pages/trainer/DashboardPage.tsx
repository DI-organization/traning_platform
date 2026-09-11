import { Link } from "react-router-dom";
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
  const trainer = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${trainer?.firstName ?? "Trainer"}`}
        description="Here's how the cohort is progressing this week."
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} description="Could not load the dashboard." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Trainees" value={data?.kpis.totalTrainees ?? 0} icon={Users} loading={isLoading} />
            <StatCard label="Active Trainees" value={data?.kpis.activeTrainees ?? 0} icon={UserCheck} tone="success" loading={isLoading} />
            <StatCard label="Overall Completion" value={`${data?.kpis.overallCompletionPercent ?? 0}%`} icon={TrendingUp} loading={isLoading} />
            <StatCard label="Average Score" value={data?.kpis.averageScore ?? 0} icon={Star} tone="success" loading={isLoading} />
            <StatCard label="Tasks Completed" value={data?.kpis.tasksCompleted ?? 0} icon={CheckCircle2} tone="success" loading={isLoading} />
            <StatCard label="Tasks Pending" value={data?.kpis.tasksPending ?? 0} icon={Clock} tone="warning" loading={isLoading} />
            <StatCard label="Overdue Tasks" value={data?.kpis.overdueTasks ?? 0} icon={AlertTriangle} tone="destructive" loading={isLoading} />
            <StatCard label="Pending Reviews" value={data?.kpis.pendingReviews ?? 0} icon={FileCheck2} tone="warning" loading={isLoading} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Trainee Progress</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/trainer/trainees">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : !data || data.traineeProgress.length === 0 ? (
                  <EmptyState title="No trainees yet" description="Create a trainee account to get started." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trainee</TableHead>
                        <TableHead>Week</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Last Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.traineeProgress.map((t) => (
                        <TableRow key={t.id} className="cursor-pointer">
                          <TableCell>
                            <Link to={`/trainer/trainees/${t.id}`} className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback>{initials(t.firstName, t.lastName)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{t.firstName} {t.lastName}</span>
                              {!t.isActive && <Badge variant="secondary">Inactive</Badge>}
                            </Link>
                          </TableCell>
                          <TableCell>{t.currentWeek ?? "—"}</TableCell>
                          <TableCell className="w-40">
                            <div className="flex items-center gap-2">
                              <Progress value={t.progressPercent} className="h-1.5 w-24" />
                              <span className="text-xs text-muted-foreground">{t.progressPercent}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{t.averageScore}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(t.lastActivityAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pending Reviews</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/trainer/submissions">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <TableSkeleton rows={3} cols={1} />
                ) : !data || data.pendingReviews.length === 0 ? (
                  <EmptyState title="All caught up" description="No submissions awaiting review." className="py-8" />
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
                      <Badge variant="warning">Review</Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <TableSkeleton rows={4} cols={1} />
              ) : !data || data.recentActivity.length === 0 ? (
                <EmptyState title="No recent activity" className="py-8" />
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
