import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Lock, PlayCircle, Circle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProfile } from "@/hooks/useTrainees";
import { useProgram } from "@/hooks/usePrograms";
import { cn } from "@/lib/utils";
import type { Phase, Week } from "@/types";

type WeekState = "completed" | "current" | "unlocked" | "locked";

export default function TraineeProgramPage() {
  const { t } = useTranslation(["program", "common"]);
  const { data: profile, isLoading: profileLoading, isError, refetch } = useMyProfile();
  const programId = profile?.enrollment?.program.id;
  const { data: program, isLoading: programLoading } = useProgram(programId);

  if (profileLoading || programLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !profile) return <ErrorState onRetry={() => refetch()} />;
  if (!profile.enrollment || !program) {
    return <ErrorState title={t("program:trainee.notEnrolledTitle")} description={t("program:trainee.notEnrolledDescription")} />;
  }

  const currentWeek = profile.enrollment.currentWeek;
  const phases = [...(program.phases ?? [])].sort((a, b) => a.order - b.order || a.phaseNumber - b.phaseNumber);

  return (
    <div className="space-y-8">
      <PageHeader title={t("program:trainee.title")} description={program.title} />

      {phases.map((phase) => (
        <PhaseTimeline key={phase.id} phase={phase} currentWeek={currentWeek} />
      ))}
    </div>
  );
}

function PhaseTimeline({ phase, currentWeek }: { phase: Phase; currentWeek: number }) {
  const { t } = useTranslation(["program", "common"]);

  const stateFor = (weekNumber: number, isLocked: boolean): WeekState => {
    if (weekNumber < currentWeek) return "completed";
    if (weekNumber === currentWeek) return "current";
    return isLocked ? "locked" : "unlocked";
  };

  const STATE_META: Record<WeekState, { label: string; icon: typeof CheckCircle2; badge: "success" | "default" | "secondary" | "outline" }> = {
    completed: { label: t("program:trainee.stateCompleted"), icon: CheckCircle2, badge: "success" },
    current: { label: t("program:trainee.stateCurrent"), icon: PlayCircle, badge: "default" },
    unlocked: { label: t("program:trainee.stateUnlocked"), icon: Circle, badge: "outline" },
    locked: { label: t("program:trainee.stateLocked"), icon: Lock, badge: "secondary" },
  };

  const weeks = [...phase.weeks].sort((a, b) => a.weekNumber - b.weekNumber);

  return (
    <section className="space-y-3">
      <div className="border-b pb-2">
        <div className="flex items-center gap-2">
          <Badge>{t("program:trainer.phaseLabel", { number: phase.phaseNumber })}</Badge>
          <h2 className="text-lg font-semibold">{phase.title}</h2>
        </div>
        {phase.description && <p className="mt-0.5 text-sm text-muted-foreground">{phase.description}</p>}
      </div>

      <div className="space-y-3">
        {weeks.map((week) => (
          <WeekRow key={week.id} week={week} state={stateFor(week.weekNumber, week.isLocked)} meta={STATE_META[stateFor(week.weekNumber, week.isLocked)]} />
        ))}
      </div>
    </section>
  );
}

function WeekRow({
  week,
  state,
  meta,
}: {
  week: Week;
  state: WeekState;
  meta: { label: string; icon: typeof CheckCircle2; badge: "success" | "default" | "secondary" | "outline" };
}) {
  const { t } = useTranslation("common");
  const Icon = meta.icon;
  const clickable = state !== "locked";

  const content = (
    <Card className={cn("transition-colors", clickable && "hover:border-primary/40", state === "locked" && "opacity-60")}>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            state === "completed" && "bg-success/10 text-success",
            state === "current" && "bg-primary/10 text-primary",
            state === "unlocked" && "bg-muted text-muted-foreground",
            state === "locked" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{t("table.week")} {week.weekNumber}</span>
            <Badge variant={meta.badge}>{meta.label}</Badge>
          </div>
          <p className="truncate font-medium">{week.title}</p>
          <p className="truncate text-sm text-muted-foreground">{week.description}</p>
        </div>
      </CardContent>
    </Card>
  );

  return clickable ? <Link to={`/trainee/program/weeks/${week.id}`}>{content}</Link> : <div>{content}</div>;
}
