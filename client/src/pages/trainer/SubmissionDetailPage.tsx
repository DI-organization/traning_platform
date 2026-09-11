import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink, Github, GitPullRequest, Loader2, Star, GitFork } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useSubmission, useCreateReview, useRefetchGithubMetadata } from "@/hooks/useSubmissions";
import { formatDate, formatRelativeTime, initials } from "@/lib/format";
import { getErrorMessage } from "@/api/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SCORE_FIELD_KEYS = [
  "taskCompletion",
  "functionality",
  "codeQuality",
  "architecture",
  "gitUsage",
  "problemSolving",
  "documentation",
  "testing",
  "technicalUnderstanding",
] as const;

type ScoreKey = (typeof SCORE_FIELD_KEYS)[number];

export default function TrainerSubmissionDetailPage() {
  const { t } = useTranslation(["submissions", "common"]);
  const { id } = useParams<{ id: string }>();
  const { data: submission, isLoading, isError, refetch } = useSubmission(id);
  const createReview = useCreateReview();
  const refetchGithub = useRefetchGithubMetadata();

  const [feedback, setFeedback] = useState("");
  const [scores, setScores] = useState<Record<ScoreKey, string>>(
    Object.fromEntries(SCORE_FIELD_KEYS.map((k) => [k, ""])) as Record<ScoreKey, string>
  );

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !submission) return <ErrorState onRetry={() => refetch()} />;

  const submit = (decision: "APPROVED" | "CHANGES_REQUESTED") => {
    if (!feedback.trim()) {
      toast.error(t("submissions:detail.feedbackRequired"));
      return;
    }
    const parsedScores: Record<string, number> = {};
    for (const key of SCORE_FIELD_KEYS) {
      const v = scores[key];
      if (v !== "") parsedScores[key] = Number(v);
    }

    createReview.mutate(
      { submissionId: submission.id, input: { decision, feedback, scores: Object.keys(parsedScores).length ? parsedScores : undefined } },
      {
        onSuccess: () => {
          toast.success(decision === "APPROVED" ? t("submissions:detail.approved") : t("submissions:detail.changesRequested"));
          setFeedback("");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const canReview = submission.status === "SUBMITTED" || submission.status === "UNDER_REVIEW";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/trainer/submissions"><ArrowLeft className="h-4 w-4" /> {t("submissions:detail.back")}</Link>
      </Button>

      <PageHeader
        title={`${submission.task?.code} — ${submission.task?.title}`}
        description={t("submissions:detail.attemptSubmitted", {
          number: submission.attemptNumber,
          time: formatRelativeTime(submission.submittedAt),
        })}
        actions={<StatusBadge status={submission.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar>
                <AvatarFallback>{submission.user ? initials(submission.user.firstName, submission.user.lastName) : "?"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{submission.user?.firstName} {submission.user?.lastName}</CardTitle>
                {submission.user?.githubUsername && <p className="text-xs text-muted-foreground">@{submission.user.githubUsername}</p>}
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("submissions:detail.submissionCard")}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {submission.repositoryUrl && (
                <DetailRow label={t("submissions:detail.repository")} value={<ExternalLinkText url={submission.repositoryUrl} />} />
              )}
              {submission.branchName && <DetailRow label={t("submissions:detail.branch")} value={submission.branchName} />}
              {submission.pullRequestUrl && <DetailRow label={t("submissions:detail.pullRequest")} value={<ExternalLinkText url={submission.pullRequestUrl} />} />}
              {submission.liveDemoUrl && <DetailRow label={t("submissions:detail.liveDemo")} value={<ExternalLinkText url={submission.liveDemoUrl} />} />}
              {submission.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("submissions:detail.notes")}</p>
                  <p className="mt-1 whitespace-pre-wrap">{submission.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {(submission.githubRepository || submission.githubPullRequest) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Github className="h-4 w-4" /> {t("submissions:detail.githubMetadata")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => refetchGithub.mutate(submission.id)} disabled={refetchGithub.isPending}>
                  {refetchGithub.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("submissions:detail.refetch")}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {submission.githubRepository && (
                  <div className="space-y-1 rounded-md border p-3">
                    {submission.githubRepository.fetchStatus === "OK" ? (
                      <>
                        <p className="font-medium">{submission.githubRepository.owner}/{submission.githubRepository.name}</p>
                        <p className="text-xs text-muted-foreground">{submission.githubRepository.description}</p>
                        <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {submission.githubRepository.stars ?? 0}</span>
                          <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {submission.githubRepository.forks ?? 0}</span>
                          <span>{t("submissions:detail.branch")}: {submission.githubRepository.defaultBranch}</span>
                          <span>{formatRelativeTime(submission.githubRepository.lastPushAt)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {t("submissions:detail.repoUnavailable", { status: submission.githubRepository.fetchStatus.toLowerCase().replace("_", " ") })}
                      </p>
                    )}
                  </div>
                )}
                {submission.githubPullRequest && (
                  <div className="space-y-1 rounded-md border p-3">
                    {submission.githubPullRequest.fetchStatus === "OK" ? (
                      <>
                        <p className="flex items-center gap-1 font-medium"><GitPullRequest className="h-3.5 w-3.5" /> #{submission.githubPullRequest.number} {submission.githubPullRequest.title}</p>
                        <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                          <Badge variant="outline">{submission.githubPullRequest.state}</Badge>
                          <span>{submission.githubPullRequest.author}</span>
                          <span>{formatRelativeTime(submission.githubPullRequest.prCreatedAt)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {t("submissions:detail.prUnavailable", { status: submission.githubPullRequest.fetchStatus.toLowerCase().replace("_", " ") })}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>{t("submissions:detail.taskRequirements")}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {submission.task?.description && <p className="text-muted-foreground">{submission.task.description}</p>}
              {submission.task?.instructions && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("submissions:detail.instructions")}</p>
                  <p className="mt-1 whitespace-pre-wrap">{submission.task.instructions}</p>
                </div>
              )}
              {submission.task?.acceptanceCriteria && submission.task.acceptanceCriteria.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("submissions:detail.acceptanceCriteria")}</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {submission.task.acceptanceCriteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {submission.reviews && submission.reviews.length > 0 && (
            <Card>
              <CardHeader><CardTitle>{t("submissions:detail.previousReviews")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {submission.reviews.map((r) => (
                  <div key={r.id} className="rounded-md border p-3 text-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">{r.reviewer?.firstName} {r.reviewer?.lastName}</span>
                      <StatusBadge status={r.decision} />
                    </div>
                    <p className="text-muted-foreground">{r.feedback}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.createdAt, "MMM d, yyyy HH:mm")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {submission.evaluation && (
            <Card>
              <CardHeader><CardTitle>{t("submissions:detail.score")}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{submission.evaluation.totalScore}<span className="text-base font-normal text-muted-foreground">/100</span></p>
              </CardContent>
            </Card>
          )}

          {canReview ? (
            <Card>
              <CardHeader><CardTitle>{t("submissions:detail.reviewThisSubmission")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{t("submissions:detail.feedback")}</Label>
                  <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t("submissions:detail.feedbackPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("submissions:detail.scoresOptional")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCORE_FIELD_KEYS.map((key) => (
                      <div key={key} className="space-y-1">
                        <span className="text-xs text-muted-foreground">{t(`submissions:detail.scoreFields.${key}`)}</span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={scores[key]}
                          onChange={(e) => setScores({ ...scores, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => submit("APPROVED")} disabled={createReview.isPending}>
                    {createReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t("submissions:detail.approve")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => submit("CHANGES_REQUESTED")} disabled={createReview.isPending}>
                    {t("submissions:detail.requestChanges")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("submissions:detail.alreadyReviewed", { status: t(`common:statusLabels.${submission.status}`) })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="truncate text-right">{value}</span>
    </div>
  );
}

function ExternalLinkText({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
      {url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}
