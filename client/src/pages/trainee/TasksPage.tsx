import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useTasks } from "@/hooks/useTasks";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/format";
import type { AssignmentStatus } from "@/types";

const STATUSES: AssignmentStatus[] = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "CHANGES_REQUESTED", "APPROVED", "OVERDUE"];

export default function TraineeTasksPage() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useTasks({
    page,
    limit: 15,
    userId: user?.id,
    search: search || undefined,
    status: status === "all" ? undefined : (status as AssignmentStatus),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My Tasks" description="Everything assigned to you across the program." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-8" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <ErrorState className="border-0" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="p-5"><TableSkeleton rows={8} cols={4} /></div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState className="border-0" title="No tasks found" />
          ) : (
            <div className="divide-y">
              {data.items.map((task) => (
                <Link key={task.id} to={`/trainee/tasks/${task.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-accent/50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.code}</Badge>
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-muted-foreground">Week {task.week?.weekNumber}</span>
                    </div>
                    <p className="mt-1 truncate font-medium">{task.title}</p>
                    {task.dueDate && <p className="text-xs text-muted-foreground">Due {formatDate(task.dueDate)}</p>}
                  </div>
                  <StatusBadge status={task.assignmentStatus ?? "NOT_STARTED"} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <div className="flex gap-2">
            <button className="rounded-md border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <button className="rounded-md border px-3 py-1 disabled:opacity-50" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
