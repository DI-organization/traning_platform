import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { CreateTraineeDialog } from "./CreateTraineeDialog";
import { useSetTraineeStatus, useTrainees } from "@/hooks/useTrainees";
import { formatRelativeTime, initials } from "@/lib/format";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/client";

export default function TraineesListPage() {
  const { t } = useTranslation(["trainees", "common"]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useTrainees({
    page,
    limit: 10,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const setTraineeStatus = useSetTraineeStatus();

  const toggleStatus = (id: string, isActive: boolean) => {
    setTraineeStatus.mutate(
      { id, isActive: !isActive },
      {
        onSuccess: () => toast.success(!isActive ? t("trainees:list.activated") : t("trainees:list.deactivated")),
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("trainees:list.title")} description={t("trainees:list.subtitle")} actions={<CreateTraineeDialog />} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("trainees:list.searchPlaceholder")}
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("trainees:list.allStatuses")}</SelectItem>
            <SelectItem value="active">{t("common:status.active")}</SelectItem>
            <SelectItem value="inactive">{t("common:status.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <ErrorState className="border-0" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="p-5">
              <TableSkeleton rows={6} cols={6} />
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState className="border-0" title={t("trainees:list.noResultsTitle")} description={t("trainees:list.noResultsDescription")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common:table.trainee")}</TableHead>
                  <TableHead>{t("common:table.week")}</TableHead>
                  <TableHead>{t("common:table.progress")}</TableHead>
                  <TableHead>{t("common:table.score")}</TableHead>
                  <TableHead>{t("common:table.lastActivity")}</TableHead>
                  <TableHead>{t("common:table.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      <Link to={`/trainer/trainees/${trainee.id}`} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initials(trainee.firstName, trainee.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-tight">{trainee.firstName} {trainee.lastName}</p>
                          <p className="text-xs text-muted-foreground">{trainee.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>{trainee.currentWeek ?? "—"}</TableCell>
                    <TableCell className="w-40">
                      <div className="flex items-center gap-2">
                        <Progress value={trainee.progress.progressPercent} className="h-1.5 w-24" />
                        <span className="text-xs text-muted-foreground">{trainee.progress.progressPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{trainee.averageScore}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(trainee.lastActivityAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={trainee.isActive} onCheckedChange={() => toggleStatus(trainee.id, trainee.isActive)} />
                        <Badge variant={trainee.isActive ? "success" : "secondary"}>
                          {trainee.isActive ? t("common:status.active") : t("common:status.inactive")}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("common:pagination.pageOfWithTotal", {
              page: data.pagination.page,
              totalPages: data.pagination.totalPages,
              total: data.pagination.total,
              label: t("trainees:list.paginationLabel"),
            })}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-md border px-3 py-1 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("common:actions.previous")}
            </button>
            <button
              className="rounded-md border px-3 py-1 disabled:opacity-50"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("common:actions.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
