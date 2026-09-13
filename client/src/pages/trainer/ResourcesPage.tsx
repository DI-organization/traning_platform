import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrograms, useProgram } from "@/hooks/usePrograms";
import type { ResourceType } from "@/types";

const TYPES: ResourceType[] = ["DOCUMENTATION", "ARTICLE", "VIDEO", "COURSE", "BOOK", "OTHER"];

export default function TrainerResourcesPage() {
  const { t } = useTranslation(["resources", "common"]);
  const { data: programs } = usePrograms();
  const programId = programs?.[0]?.id;
  const { data: program, isLoading, isError, refetch } = useProgram(programId);
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const weeks = useMemo(
    () => [...(program?.phases?.flatMap((p) => p.weeks) ?? [])].sort((a, b) => a.weekNumber - b.weekNumber),
    [program]
  );

  const resources = useMemo(() => {
    return weeks
      .filter((w) => weekFilter === "all" || w.id === weekFilter)
      .flatMap((w) => w.resources.map((r) => ({ ...r, week: w })))
      .filter((r) => typeFilter === "all" || r.type === typeFilter);
  }, [weeks, weekFilter, typeFilter]);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !program) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader title={t("resources:trainer.title")} description={t("resources:trainer.subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={weekFilter} onValueChange={setWeekFilter}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder={t("resources:trainer.allWeeks")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("resources:trainer.allWeeks")}</SelectItem>
            {weeks.map((w) => (
              <SelectItem key={w.id} value={w.id}>{t("common:table.week")} {w.weekNumber}: {w.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder={t("resources:trainer.allTypes")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("resources:trainer.allTypes")}</SelectItem>
            {TYPES.map((ty) => (
              <SelectItem key={ty} value={ty}>{t(`common:resourceTypeLabels.${ty}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {resources.length === 0 ? (
            <EmptyState className="border-0" title={t("resources:trainer.noResults")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common:table.title")}</TableHead>
                  <TableHead>{t("common:table.week")}</TableHead>
                  <TableHead>{t("common:table.type")}</TableHead>
                  <TableHead>{t("common:status.required")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium hover:underline">
                        {r.title} <ExternalLink className="h-3 w-3" />
                      </a>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </TableCell>
                    <TableCell>
                      <Link to={`/trainer/program/weeks/${r.week.id}`} className="text-xs text-muted-foreground hover:underline">
                        {t("common:table.week")} {r.week.weekNumber}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{t(`common:resourceTypeLabels.${r.type}`)}</Badge></TableCell>
                    <TableCell>
                      {r.isRequired ? (
                        <Badge variant="warning">{t("common:status.required")}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("common:status.optional")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link to={`/trainer/program/weeks/${r.week.id}`} className="text-xs text-primary hover:underline">{t("common:actions.manage")}</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
