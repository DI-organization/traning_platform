import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuthStore } from "@/store/authStore";
import { formatRelativeTime } from "@/lib/format";
import type { SubmissionStatus } from "@/types";

const STATUSES: SubmissionStatus[] = ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "APPROVED"];

export default function TraineeSubmissionsPage() {
  const { t } = useTranslation(["submissions", "common"]);
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useSubmissions({
    page,
    limit: 15,
    userId: user?.id,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("submissions:trainee.title")} description={t("submissions:trainee.subtitle")} />

      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("submissions:trainee.allStatuses")}</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{t(`common:statusLabels.${s}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <ErrorState className="border-0" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="p-5"><TableSkeleton rows={8} cols={3} /></div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState className="border-0" title={t("submissions:trainee.noResultsTitle")} description={t("submissions:trainee.noResultsDescription")} />
          ) : (
            <div className="divide-y">
              {data.items.map((s) => (
                <Link key={s.id} to={`/trainee/tasks/${s.taskId}`} className="flex items-center justify-between gap-3 p-4 hover:bg-accent/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{s.task?.code}</Badge>
                      <span className="text-xs text-muted-foreground">{t("submissions:trainee.attempt", { number: s.attemptNumber })}</span>
                    </div>
                    <p className="mt-1 font-medium">{s.task?.title}</p>
                    <p className="text-xs text-muted-foreground">{t("common:table.submitted")} {formatRelativeTime(s.submittedAt)}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("common:pagination.pageOf", { page: data.pagination.page, totalPages: data.pagination.totalPages })}</span>
          <div className="flex gap-2">
            <button className="rounded-md border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t("common:actions.previous")}</button>
            <button className="rounded-md border px-3 py-1 disabled:opacity-50" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>{t("common:actions.next")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
