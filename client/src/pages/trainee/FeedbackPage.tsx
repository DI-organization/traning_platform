import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProfile } from "@/hooks/useTrainees";
import { formatDate } from "@/lib/format";

function performanceLevel(score: number) {
  if (score >= 85) return { label: "Excellent", variant: "success" as const };
  if (score >= 75) return { label: "Good", variant: "default" as const };
  if (score >= 65) return { label: "Needs Improvement", variant: "warning" as const };
  return { label: "Improvement Required", variant: "destructive" as const };
}

export default function TraineeFeedbackPage() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !profile) return <ErrorState onRetry={() => refetch()} />;

  const level = performanceLevel(profile.averageScore);
  const reviewed = profile.submissions.filter((s) => s.reviews && s.reviews.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Feedback & Scores" description="Trainer feedback and evaluation scores for your work." />

      <Card>
        <CardHeader><CardTitle>Overall Performance</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-6">
          <div>
            <p className="text-4xl font-bold">{profile.averageScore}<span className="text-lg font-normal text-muted-foreground">/100</span></p>
            <Badge variant={level.variant} className="mt-2">{level.label}</Badge>
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            <p>85-100 Excellent · 75-84 Good · 65-74 Needs Improvement · Below 65 Improvement Required</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reviewed Submissions</CardTitle></CardHeader>
        <CardContent>
          {reviewed.length === 0 ? (
            <EmptyState className="border-0" title="No feedback yet" description="Once a trainer reviews your work, feedback will appear here." />
          ) : (
            <div className="space-y-4">
              {reviewed.map((s) => (
                <div key={s.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{s.task?.code}</Badge>
                      <span className="font-medium">{s.task?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.evaluation && <Badge variant="secondary">{s.evaluation.totalScore} pts</Badge>}
                      <StatusBadge status={s.reviews![0].decision} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.reviews![0].feedback}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(s.reviews![0].createdAt, "MMM d, yyyy")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
