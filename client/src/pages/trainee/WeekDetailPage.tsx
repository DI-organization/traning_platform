import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { useWeek } from "@/hooks/usePrograms";
import { useTasks } from "@/hooks/useTasks";
import { useAnswerResearchQuestion, useMyResearchAnswers } from "@/hooks/usePrograms";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/api/client";

export default function TraineeWeekDetailPage() {
  const { weekId } = useParams<{ weekId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: week, isLoading, isError, refetch } = useWeek(weekId);
  const { data: tasksData } = useTasks({ weekId, userId: user?.id, limit: 50 });
  const { data: myAnswers } = useMyResearchAnswers();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !week) return <ErrorState onRetry={() => refetch()} />;

  const weeklyProjectTask = tasksData?.items.find((t) => t.isWeeklyProject);
  const regularTasks = tasksData?.items.filter((t) => !t.isWeeklyProject) ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/trainee/program"><ArrowLeft className="h-4 w-4" /> Back to my program</Link>
      </Button>

      <PageHeader title={`Week ${week.weekNumber}: ${week.title}`} description={week.description} />

      {week.objectives.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Objectives</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {week.objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {week.topics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Topics</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {week.topics.map((t) => <Badge key={t.id} variant="secondary">{t.title}</Badge>)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
        <CardContent>
          {week.resources.length === 0 ? (
            <EmptyState className="border-0" title="No resources yet" />
          ) : (
            <div className="divide-y">
              {week.resources.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary">
                  <div>
                    <p className="flex items-center gap-1 font-medium">{r.title} <ExternalLink className="h-3 w-3" /></p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">{r.type}</Badge>
                    {r.isRequired && <Badge variant="warning">Required</Badge>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
        <CardContent>
          {regularTasks.length === 0 ? (
            <EmptyState className="border-0" title="No tasks yet" />
          ) : (
            <div className="divide-y">
              {regularTasks.map((t) => (
                <Link key={t.id} to={`/trainee/tasks/${t.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-accent/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t.code}</Badge>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <p className="mt-1 font-medium">{t.title}</p>
                  </div>
                  <StatusBadge status={t.assignmentStatus ?? "NOT_STARTED"} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(week.weeklyProjectTitle || weeklyProjectTask) && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle>Weekly Project: {week.weeklyProjectTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{week.weeklyProjectDescription}</p>
            {week.submissionRequirements.length > 0 && (
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {week.submissionRequirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
            {weeklyProjectTask && (
              <Button asChild>
                <Link to={`/trainee/tasks/${weeklyProjectTask.id}`}>Open project task</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {week.researchQuestions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Research Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {week.researchQuestions.map((q) => (
              <ResearchQuestionItem key={q.id} question={q} existingAnswer={myAnswers?.find((a) => a.questionId === q.id)} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResearchQuestionItem({
  question,
  existingAnswer,
}: {
  question: import("@/types").ResearchQuestion;
  existingAnswer?: import("@/types").ResearchAnswer;
}) {
  const [answer, setAnswer] = useState(existingAnswer?.answer ?? "");
  const [editing, setEditing] = useState(!existingAnswer);
  const submitAnswer = useAnswerResearchQuestion();

  const submit = () => {
    submitAnswer.mutate(
      { questionId: question.id, answer },
      {
        onSuccess: () => {
          toast.success("Answer submitted");
          setEditing(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <div className="rounded-lg border p-4">
      <p className="font-medium">{question.question}</p>
      {existingAnswer && !editing ? (
        <div className="mt-2 space-y-2">
          <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{existingAnswer.answer}</p>
          <div className="flex items-center gap-2">
            {existingAnswer.score != null ? (
              <Badge variant="success">Score: {existingAnswer.score}</Badge>
            ) : (
              <Badge variant="secondary">Awaiting review</Badge>
            )}
            {!existingAnswer.reviewedAt && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit answer</Button>
            )}
          </div>
          {existingAnswer.feedback && <p className="text-sm text-muted-foreground">Feedback: {existingAnswer.feedback}</p>}
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <Textarea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer..." />
          <Button size="sm" onClick={submit} disabled={!answer.trim() || submitAnswer.isPending}>
            {submitAnswer.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit answer
          </Button>
        </div>
      )}
    </div>
  );
}
