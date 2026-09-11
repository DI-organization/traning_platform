import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Lock, LockOpen, Plus, Loader2 } from "lucide-react";
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
import { usePrograms, useProgram, useCreateWeek, useSetWeekLock } from "@/hooks/usePrograms";
import { getErrorMessage } from "@/api/client";

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
  const [createOpen, setCreateOpen] = useState(false);
  const createWeek = useCreateWeek(program?.id ?? "");
  const setWeekLock = useSetWeekLock();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeekFormValues>({ resolver: zodResolver(weekSchema) });

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

  const weeks = [...(program.weeks ?? [])].sort((a, b) => a.weekNumber - b.weekNumber);

  const onSubmit = (values: WeekFormValues) => {
    createWeek.mutate(
      { ...values, objectives: [], submissionRequirements: [] },
      {
        onSuccess: () => {
          toast.success(t("program:trainer.weekCreated", { number: values.weekNumber }));
          reset();
          setCreateOpen(false);
          refetch();
        },
        onError: (error) => toast.error(getErrorMessage(error, t("program:trainer.weekCreateError"))),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={program.title}
        description={t("program:trainer.weeksConfigured", {
          count: weeks.length,
          total: program.totalWeeks,
          strategy: program.weekUnlockStrategy === "MANUAL" ? t("program:trainer.strategyManual") : t("program:trainer.strategyAutomatic"),
        })}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> {t("program:trainer.addWeek")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("program:trainer.addWeekTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="weekNumber">{t("program:trainer.weekNumber")}</Label>
                  <Input id="weekNumber" type="number" {...register("weekNumber")} />
                  {errors.weekNumber && <p className="text-xs text-destructive">{errors.weekNumber.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">{t("program:trainer.title")}</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">{t("program:trainer.description")}</Label>
                  <Textarea id="description" rows={3} {...register("description")} />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
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
        }
      />

      {weeks.length === 0 ? (
        <EmptyState title={t("program:trainer.noWeeksTitle")} description={t("program:trainer.noWeeksDescription")} />
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
    </div>
  );
}
