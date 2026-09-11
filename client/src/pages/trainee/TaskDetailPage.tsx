import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Clock, Coins, Loader2, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { useTask } from "@/hooks/useTasks";
import { useStartTask } from "@/hooks/useTasks";
import { useCreateSubmission, useUpdateSubmission } from "@/hooks/useSubmissions";
import { useAuthStore } from "@/store/authStore";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { getErrorMessage } from "@/api/client";

const PENDING_STATUSES = new Set(["SUBMITTED", "UNDER_REVIEW"]);

export default function TraineeTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: task, isLoading, isError, refetch } = useTask(id, user?.id);
  const startTask = useStartTask();
  const createSubmission = useCreateSubmission();
  const updateSubmission = useUpdateSubmission();

  const latestSubmission = task?.submissions?.[0];
  const isPending = latestSubmission ? PENDING_STATUSES.has(latestSubmission.status) : false;

  const [form, setForm] = useState({ repositoryUrl: "", branchName: "", pullRequestUrl: "", liveDemoUrl: "", notes: "" });

  useEffect(() => {
    if (latestSubmission && isPending) {
      setForm({
        repositoryUrl: latestSubmission.repositoryUrl ?? "",
        branchName: latestSubmission.branchName ?? "",
        pullRequestUrl: latestSubmission.pullRequestUrl ?? "",
        liveDemoUrl: latestSubmission.liveDemoUrl ?? "",
        notes: latestSubmission.notes ?? "",
      });
    }
  }, [latestSubmission?.id, isPending]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !task) return <ErrorState onRetry={() => refetch()} />;

  const assignmentStatus = task.assignment?.status ?? "NOT_STARTED";

  const submit = () => {
    if (!form.repositoryUrl && !form.pullRequestUrl) {
      toast.error("Provide at least a repository URL or a pull request URL");
      return;
    }
    if (isPending && latestSubmission) {
      updateSubmission.mutate(
        { id: latestSubmission.id, input: form },
        {
          onSuccess: () => toast.success("Submission updated"),
          onError: (error) => toast.error(getErrorMessage(error)),
        }
      );
    } else {
      createSubmission.mutate(
        { taskId: task.id, ...form },
        {
          onSuccess: () => {
            toast.success("Work submitted for review");
            setForm({ repositoryUrl: "", branchName: "", pullRequestUrl: "", liveDemoUrl: "", notes: "" });
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        }
      );
    }
  };

  const canSubmit = assignmentStatus !== "APPROVED";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/trainee/tasks"><ArrowLeft className="h-4 w-4" /> Back to my tasks</Link>
      </Button>

      <PageHeader
        title={task.title}
        description={task.week ? `Week ${task.week.weekNumber}` : undefined}
        actions={<StatusBadge status={assignmentStatus} />}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{task.code}</Badge>
        <PriorityBadge priority={task.priority} />
        <Badge variant="outline">{task.difficulty}</Badge>
        <Badge variant="outline" className="flex items-center gap-1"><Coins className="h-3 w-3" /> {task.points} pts</Badge>
        <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.estimatedHours}h estimated</Badge>
        {task.dueDate && <Badge variant="outline">Due {formatDate(task.dueDate)}</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{task.description}</CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">{task.instructions}</CardContent>
          </Card>

          {task.acceptanceCriteria.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Acceptance Criteria</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {task.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          {task.submissions && task.submissions.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Submission History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {task.submissions.map((s) => (
                  <div key={s.id} className="rounded-md border p-3 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">Attempt #{s.attemptNumber}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">Submitted {formatRelativeTime(s.submittedAt)}</p>
                    {s.reviews && s.reviews.length > 0 && (
                      <div className="mt-2 space-y-2 border-t pt-2">
                        {s.reviews.map((r) => (
                          <div key={r.id}>
                            <p className="text-xs font-medium text-muted-foreground">Trainer feedback</p>
                            <p>{r.feedback}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {s.evaluation && <p className="mt-2 text-xs font-medium">Score: {s.evaluation.totalScore}/100</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {assignmentStatus === "NOT_STARTED" && (
            <Card>
              <CardContent className="p-5">
                <Button
                  className="w-full"
                  onClick={() => startTask.mutate(task.id, { onError: (error) => toast.error(getErrorMessage(error)) })}
                  disabled={startTask.isPending}
                >
                  {startTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                  Start Task
                </Button>
              </CardContent>
            </Card>
          )}

          {canSubmit && (
            <Card>
              <CardHeader><CardTitle>{isPending ? "Update Submission" : "Submit Work"}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Repository URL</Label>
                  <Input placeholder="https://github.com/you/project" value={form.repositoryUrl} onChange={(e) => setForm({ ...form, repositoryUrl: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Branch</Label>
                  <Input placeholder="main" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pull Request URL</Label>
                  <Input placeholder="https://github.com/you/project/pull/1" value={form.pullRequestUrl} onChange={(e) => setForm({ ...form, pullRequestUrl: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Live Demo URL</Label>
                  <Input placeholder="https://..." value={form.liveDemoUrl} onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything the trainer should know..." />
                </div>
                <Button className="w-full" onClick={submit} disabled={createSubmission.isPending || updateSubmission.isPending}>
                  {(createSubmission.isPending || updateSubmission.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPending ? "Update Submission" : "Submit Work"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
