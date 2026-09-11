import { useParams, Link } from "react-router-dom";
import { Github, Mail, Phone, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useTraineeDetail } from "@/hooks/useTrainees";
import { formatDate, formatRelativeTime, initials } from "@/lib/format";

export default function TraineeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: trainee, isLoading, isError, refetch } = useTraineeDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !trainee) {
    return <ErrorState onRetry={() => refetch()} description="Could not load this trainee." />;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/trainer/trainees">
          <ArrowLeft className="h-4 w-4" /> Back to trainees
        </Link>
      </Button>

      <PageHeader title={`${trainee.firstName} ${trainee.lastName}`} description={trainee.enrollment?.program.title} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg">{initials(trainee.firstName, trainee.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{trainee.firstName} {trainee.lastName}</p>
                <Badge variant={trainee.isActive ? "success" : "secondary"}>{trainee.isActive ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> {trainee.email}
              </div>
              {trainee.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {trainee.phone}
                </div>
              )}
              {trainee.githubProfile && (
                <a
                  href={trainee.githubProfile.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Github className="h-4 w-4" /> @{trainee.githubProfile.username}
                </a>
              )}
            </div>
            <div className="border-t pt-3 text-sm text-muted-foreground">
              Current Week: <span className="font-medium text-foreground">{trainee.enrollment?.currentWeek ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Progress value={trainee.overallProgress.progressPercent} className="h-2 flex-1" />
              <span className="text-sm font-medium">{trainee.overallProgress.progressPercent}%</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Completed" value={trainee.overallProgress.completedTasks} />
              <Metric label="Pending" value={trainee.overallProgress.pendingTasks} />
              <Metric label="Overdue" value={trainee.overallProgress.overdueTasks} tone="destructive" />
              <Metric label="Avg Score" value={trainee.averageScore} tone="success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Submissions & Reviews</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card>
            <CardContent className="p-5">
              {trainee.submissions.length === 0 ? (
                <EmptyState title="No submissions yet" className="border-0" />
              ) : (
                <div className="divide-y">
                  {trainee.submissions.map((s) => (
                    <Link
                      key={s.id}
                      to={`/trainer/submissions/${s.id}`}
                      className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.task?.code} — {s.task?.title}</p>
                        <p className="text-xs text-muted-foreground">Submitted {formatRelativeTime(s.submittedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.evaluation && <Badge variant="outline">{s.evaluation.totalScore} pts</Badge>}
                        <StatusBadge status={s.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-5">
              {trainee.activity.length === 0 ? (
                <EmptyState title="No activity yet" className="border-0" />
              ) : (
                <div className="space-y-3">
                  {trainee.activity.map((a) => (
                    <div key={a.id} className="flex items-start justify-between text-sm">
                      <p>{a.description}</p>
                      <p className="shrink-0 text-xs text-muted-foreground">{formatDate(a.createdAt, "MMM d, HH:mm")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "destructive" | "success" }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className={`text-xl font-semibold ${tone === "destructive" ? "text-destructive" : tone === "success" ? "text-success" : ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
