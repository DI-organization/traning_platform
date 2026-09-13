import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Lock, LockOpen, Plus, Loader2, Layers } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrograms, useProgram, useCreatePhase, useCreateWeek, useSetWeekLock } from "@/hooks/usePrograms";
import { getErrorMessage } from "@/api/client";
import type { Phase } from "@/types";

const phaseSchema = z.object({
  phaseNumber: z.coerce.number().int().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});
type PhaseFormValues = z.infer<typeof phaseSchema>;

const weekSchema = z.object({
  weekNumber: z.coerce.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});
type WeekFormValues = z.infer<typeof weekSchema>;

export default function TrainerProgramPage() {
  const { t } = useTranslation(["program", "common"]);
  const { data: programs, isLoading: programsLoading, isError: programsError } = usePrograms();
  const programId = programs?.[0]?.id;
  const { data: program, isLoading: programLoading, isError: programError, refetch } = useProgram(programId);
  const isLoading = programsLoading || (Boolean(programId) && programLoading);
  const isError = programsError || programError;
  const [phaseDialogOpen, setPhaseDialogOpen] = useState(false);
  const createPhase = useCreatePhase(program?.id ?? "");

  const phaseForm = useForm<PhaseFormValues>({ resolver: zodResolver(phaseSchema) });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (isError || !program) {
    return <ErrorState onRetry={() => refetch()} title={t("program:trainer.noProgramFound")} />;
  }

  const phases = [...(program.phases ?? [])].sort((a, b) => a.order - b.order || a.phaseNumber - b.phaseNumber);
  const totalWeeks = phases.reduce((sum, p) => sum + p.weeks.length, 0);

  const onCreatePhase = (values: PhaseFormValues) => {
    createPhase.mutate(values, {
      onSuccess: () => {
        toast.success(t("program:trainer.phaseCreated", { number: values.phaseNumber }));
        phaseForm.reset();
        setPhaseDialogOpen(false);
        refetch();
      },
      onError: (error) => toast.error(getErrorMessage(error, t("program:trainer.phaseCreateError"))),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={program.title}
        description={t("program:trainer.weeksConfigured", {
          count: totalWeeks,
          total: program.totalWeeks,
          strategy: program.weekUnlockStrategy === "MANUAL" ? t("program:trainer.strategyManual") : t("program:trainer.strategyAutomatic"),
        })}
        actions={
          <Dialog open={phaseDialogOpen} onOpenChange={setPhaseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layers className="h-4 w-4" /> {t("program:trainer.addPhase")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("program:trainer.addPhaseTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={phaseForm.handleSubmit(onCreatePhase)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="phaseNumber">{t("program:trainer.phaseNumber")}</Label>
                  <Input id="phaseNumber" type="number" {...phaseForm.register("phaseNumber")} />
                  {phaseForm.formState.errors.phaseNumber && (
                    <p className="text-xs text-destructive">{phaseForm.formState.errors.phaseNumber.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phaseTitle">{t("program:trainer.title")}</Label>
                  <Input id="phaseTitle" {...phaseForm.register("title")} />
                  {phaseForm.formState.errors.title && <p className="text-xs text-destructive">{phaseForm.formState.errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phaseDescription">{t("program:trainer.description")}</Label>
                  <Textarea id="phaseDescription" rows={2} {...phaseForm.register("description")} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPhaseDialogOpen(false)}>
                    {t("common:actions.cancel")}
                  </Button>
                  <Button type="submit" disabled={createPhase.isPending}>
                    {createPhase.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t("program:trainer.createPhase")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {phases.length === 0 ? (
        <EmptyState title={t("program:trainer.noPhasesTitle")} description={t("program:trainer.noPhasesDescription")} />
      ) : (
        phases.map((phase) => <PhaseSection key={phase.id} programId={program.id} phase={phase} onChanged={() => refetch()} />)
      )}
    </div>
  );
}

function PhaseSection({ programId, phase, onChanged }: { programId: string; phase: Phase; onChanged: () => void }) {
  const { t } = useTranslation(["program", "common"]);
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  const createWeek = useCreateWeek(programId);
  const setWeekLock = useSetWeekLock();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeekFormValues>({ resolver: zodResolver(weekSchema) });

  const weeks = [...phase.weeks].sort((a, b) => a.weekNumber - b.weekNumber);

  const onSubmit = (values: WeekFormValues) => {
    createWeek.mutate(
      { ...values, phaseId: phase.id, objectives: [], submissionRequirements: [] },
      {
        onSuccess: () => {
          toast.success(t("program:trainer.weekCreated", { number: values.weekNumber }));
          reset();
          setWeekDialogOpen(false);
          onChanged();
        },
        onError: (error) => toast.error(getErrorMessage(error, t("program:trainer.weekCreateError"))),
      }
    );
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 border-b pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Badge>{t("program:trainer.phaseLabel", { number: phase.phaseNumber })}</Badge>
            <h2 className="text-lg font-semibold">{phase.title}</h2>
          </div>
          {phase.description && <p className="mt-0.5 text-sm text-muted-foreground">{phase.description}</p>}
        </div>
        <Dialog open={weekDialogOpen} onOpenChange={setWeekDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> {t("program:trainer.addWeek")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("program:trainer.addWeekTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor={`weekNumber-${phase.id}`}>{t("program:trainer.weekNumber")}</Label>
                <Input id={`weekNumber-${phase.id}`} type="number" {...register("weekNumber")} />
                {errors.weekNumber && <p className="text-xs text-destructive">{errors.weekNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`title-${phase.id}`}>{t("program:trainer.title")}</Label>
                <Input id={`title-${phase.id}`} {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`description-${phase.id}`}>{t("program:trainer.description")}</Label>
                <Textarea id={`description-${phase.id}`} rows={3} {...register("description")} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setWeekDialogOpen(false)}>
                  {t("common:actions.cancel")}
                </Button>
                <Button type="submit" disabled={createWeek.isPending}>
                  {createWeek.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("program:trainer.createWeek")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {weeks.length === 0 ? (
        <EmptyState className="border-0" title={t("program:trainer.noWeeksTitle")} description={t("program:trainer.noWeeksDescription")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {weeks.map((week) => (
            <Card key={week.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <Badge variant="outline">{t("common:table.week")} {week.weekNumber}</Badge>
                  {week.isLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <LockOpen className="h-4 w-4 text-success" />}
                </div>
                <div className="flex-1">
                  <Link to={`/trainer/program/weeks/${week.id}`} className="font-semibold hover:underline">
                    {week.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{week.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("program:trainer.taskResourceCount", { tasks: week.tasks?.length ?? 0, resources: week.resources?.length ?? 0 })}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!week.isLocked}
                      onCheckedChange={(checked) =>
                        setWeekLock.mutate(
                          { weekId: week.id, isLocked: !checked },
                          {
                            onSuccess: () => toast.success(checked ? t("program:trainer.weekUnlocked") : t("program:trainer.weekLocked")),
                            onError: (error) => toast.error(getErrorMessage(error)),
                          }
                        )
                      }
                    />
                    <span className="text-xs text-muted-foreground">{week.isLocked ? t("common:status.locked") : t("common:status.unlocked")}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/trainer/program/weeks/${week.id}`}>{t("common:actions.manage")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
