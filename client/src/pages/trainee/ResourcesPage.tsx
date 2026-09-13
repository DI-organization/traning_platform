import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProfile } from "@/hooks/useTrainees";
import { useProgram } from "@/hooks/usePrograms";
import type { ResourceType } from "@/types";

const TYPES: ResourceType[] = ["DOCUMENTATION", "ARTICLE", "VIDEO", "COURSE", "BOOK", "OTHER"];

export default function TraineeResourcesPage() {
  const { t } = useTranslation(["resources", "common"]);
  const { data: profile, isLoading: profileLoading, isError, refetch } = useMyProfile();
  const programId = profile?.enrollment?.program.id;
  const { data: program, isLoading: programLoading } = useProgram(programId);
  const [weekFilter, setWeekFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const weeks = useMemo(
    () => [...(program?.phases?.flatMap((p) => p.weeks) ?? [])].filter((w) => !w.isLocked).sort((a, b) => a.weekNumber - b.weekNumber),
    [program]
  );

  const resources = useMemo(() => {
    return weeks
      .filter((w) => weekFilter === "all" || w.id === weekFilter)
      .flatMap((w) => w.resources.map((r) => ({ ...r, week: w })))
      .filter((r) => typeFilter === "all" || r.type === typeFilter);
  }, [weeks, weekFilter, typeFilter]);

  if (profileLoading || programLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !profile) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader title={t("resources:trainee.title")} description={t("resources:trainee.subtitle")} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={weekFilter} onValueChange={setWeekFilter}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder={t("resources:trainee.allWeeks")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("resources:trainee.allWeeks")}</SelectItem>
            {weeks.map((w) => (
              <SelectItem key={w.id} value={w.id}>{t("common:table.week")} {w.weekNumber}: {w.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder={t("resources:trainee.allTypes")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("resources:trainee.allTypes")}</SelectItem>
            {TYPES.map((ty) => (
              <SelectItem key={ty} value={ty}>{t(`common:resourceTypeLabels.${ty}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {resources.length === 0 ? (
            <EmptyState className="border-0" title={t("resources:trainee.noResults")} />
          ) : (
            <div className="divide-y">
              {resources.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 p-4 hover:bg-accent/50">
                  <div>
                    <p className="flex items-center gap-1 font-medium">{r.title} <ExternalLink className="h-3 w-3" /></p>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("common:table.week")} {r.week.weekNumber}</p>
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
    </div>
  );
}
