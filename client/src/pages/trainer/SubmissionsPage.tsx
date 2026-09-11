import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useSubmissions } from "@/hooks/useSubmissions";
import { formatRelativeTime, initials } from "@/lib/format";
import type { SubmissionStatus } from "@/types";

const STATUSES: SubmissionStatus[] = ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "APPROVED"];

export default function TrainerSubmissionsPage() {
  const { t } = useTranslation(["submissions", "common"]);
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useSubmissions({
    page,
    limit: 15,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("submissions:trainer.title")} description={t("submissions:trainer.subtitle")} />

      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("submissions:trainer.allStatuses")}</SelectItem>
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
            <div className="p-5"><TableSkeleton rows={8} cols={5} /></div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState className="border-0" title={t("submissions:trainer.noResults")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common:table.trainee")}</TableHead>
                  <TableHead>{t("common:table.task")}</TableHead>
                  <TableHead>{t("common:table.attempt")}</TableHead>
                  <TableHead>{t("common:table.submitted")}</TableHead>
                  <TableHead>{t("common:table.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link to={`/trainer/submissions/${s.id}`} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{s.user ? initials(s.user.firstName, s.user.lastName) : "?"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{s.user?.firstName} {s.user?.lastName}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/trainer/submissions/${s.id}`} className="hover:underline">
                        {s.task?.code} — {s.task?.title}
                      </Link>
                    </TableCell>
                    <TableCell>#{s.attemptNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(s.submittedAt)}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
