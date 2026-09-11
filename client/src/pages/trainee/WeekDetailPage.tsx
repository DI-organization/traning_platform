import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["program", "common"]);
  const { weekId } = useParams<{ weekId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: week, isLoading, isError, refetch } = useWeek(weekId);
  const { data: tasksData } = useTasks({ weekId, userId: user?.id, limit: 50 });
  const { data: myAnswers } = useMyResearchAnswers();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !week) return <ErrorState onRetry={() => refetch()} />;

  const weeklyProjectTask = tasksData?.items.find((task) => task.isWeeklyProject);
  const regularTasks = tasksData?.items.filter((task) => !task.isWeeklyProject) ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/trainee/program"><ArrowLeft className="h-4 w-4" /> {t("program:trainee.week.back")}</Link>
      </Button>

      <PageHeader title={`${t("common:table.week")} ${week.weekNumber}: ${week.title}`} description={week.description} />

      {week.objectives.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t("program:trainee.week.objectives")}</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {week.objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {week.topics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t("program:trainee.week.topics")}</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {week.topics.map((topic) => <Badge key={topic.id} variant="secondary">{topic.title}</Badge>)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{t("program:trainee.week.resources")}</CardTitle></CardHeader>
        <CardContent>
          {week.resources.length === 0 ? (
            <EmptyState className="border-0" title={t("program:trainee.week.noResourcesYet")} />
          ) : (
            <div className="divide-y">
              {week.resources.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary">
                  <div>
                    <p className="flex items-center gap-1 font-medium">{r.title} <ExternalLink className="h-3 w-3" /></p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">{t(`common:resourceTypeLabels.${r.type}`)}</Badge>
                    {r.isRequired && <Badge variant="warning">{t("common:status.required")}</Badge>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("program:trainee.week.tasks")}</CardTitle></CardHeader>
        <CardContent>
          {regularTasks.length === 0 ? (
            <EmptyState className="border-0" title={t("program:trainee.week.noTasksYet")} />
          ) : (
            <div className="divide-y">
              {regularTasks.map((task) => (
                <Link key={task.id} to={`/trainee/tasks/${task.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-accent/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.code}</Badge>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p className="mt-1 font-medium">{task.title}</p>
                  </div>
                  <StatusBadge status={task.assignmentStatus ?? "NOT_STARTED"} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(week.weeklyProjectTitle || weeklyProjectTask) && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle>{t("program:trainee.week.weeklyProject", { title: week.weeklyProjectTitle })}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{week.weeklyProjectDescription}</p>
            {week.submissionRequirements.length > 0 && (
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {week.submissionRequirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
            {weeklyProjectTask && (
              <Button asChild>
                <Link to={`/trainee/tasks/${weeklyProjectTask.id}`}>{t("program:trainee.week.openProjectTask")}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {week.researchQuestions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t("program:trainee.week.researchQuestions")}</CardTitle></CardHeader>
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
  const { t } = useTranslation(["program", "common"]);
  const [answer, setAnswer] = useState(existingAnswer?.answer ?? "");
  const [editing, setEditing] = useState(!existingAnswer);
  const submitAnswer = useAnswerResearchQuestion();

  const submit = () => {
    submitAnswer.mutate(
      { questionId: question.id, answer },
      {
        onSuccess: () => {
          toast.success(t("program:trainee.week.answerSubmitted"));
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
              <Badge variant="success">{t("program:trainee.week.scoreLabel", { score: existingAnswer.score })}</Badge>
            ) : (
              <Badge variant="secondary">{t("program:trainee.week.awaitingReview")}</Badge>
            )}
            {!existingAnswer.reviewedAt && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>{t("program:trainee.week.editAnswer")}</Button>
            )}
          </div>
          {existingAnswer.feedback && (
            <p className="text-sm text-muted-foreground">{t("program:trainee.week.feedbackLabel", { feedback: existingAnswer.feedback })}</p>
          )}
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <Textarea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={t("program:trainee.week.answerPlaceholder")} />
          <Button size="sm" onClick={submit} disabled={!answer.trim() || submitAnswer.isPending}>
            {submitAnswer.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("program:trainee.week.submitAnswer")}
          </Button>
        </div>
      )}
    </div>
  );
}
