import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTasks } from "@/hooks/useTasks";
import { formatDate } from "@/lib/format";
import type { TaskType } from "@/types";

const TASK_TYPES: TaskType[] = ["LEARNING", "CODING", "PROBLEM_SOLVING", "RESEARCH", "PROJECT"];

export default function TrainerTasksPage() {
  const { t } = useTranslation(["tasks", "common"]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useTasks({
    page,
    limit: 15,
    search: search || undefined,
    type: type === "all" ? undefined : type,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("tasks:trainer.title")} description={t("tasks:trainer.subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("tasks:trainer.searchPlaceholder")} className="pl-8" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks:trainer.allTypes")}</SelectItem>
            {TASK_TYPES.map((ty) => (
              <SelectItem key={ty} value={ty}>{t(`common:taskTypeLabels.${ty}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <ErrorState className="border-0" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="p-5"><TableSkeleton rows={8} cols={6} /></div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState className="border-0" title={t("tasks:trainer.noResults")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common:table.code")}</TableHead>
                  <TableHead>{t("common:table.title")}</TableHead>
                  <TableHead>{t("common:table.week")}</TableHead>
                  <TableHead>{t("common:table.type")}</TableHead>
                  <TableHead>{t("common:table.priority")}</TableHead>
                  <TableHead>{t("common:table.points")}</TableHead>
                  <TableHead>{t("common:table.dueDate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono text-xs">{task.code}</TableCell>
                    <TableCell>
                      {task.week ? (
                        <Link to={`/trainer/program/weeks/${task.week.id}`} className="font-medium hover:underline">
                          {task.title}
                        </Link>
                      ) : (
                        task.title
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t("common:table.week")} {task.week?.weekNumber}</TableCell>
                    <TableCell><Badge variant="outline">{t(`common:taskTypeLabels.${task.type}`)}</Badge></TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell>{task.points}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</TableCell>
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
