import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Github, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { usePrograms, useUpdateProgram } from "@/hooks/usePrograms";
import { useUpdateMyProfile } from "@/hooks/useTrainees";
import { getErrorMessage } from "@/api/client";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import type { WeekUnlockStrategy } from "@/types";

export default function TrainerSettingsPage() {
  const { t } = useTranslation(["settings", "common"]);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const updateProfile = useUpdateMyProfile();

  const { register, handleSubmit } = useForm({
    defaultValues: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phone: user?.phone ?? "" },
  });

  const onSaveProfile = handleSubmit((values) => {
    updateProfile.mutate(values, {
      onSuccess: (updated) => {
        setUser(updated);
        toast.success(t("settings:profile.updated"));
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings:title")} description={t("settings:subtitle")} />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t("settings:tabs.profile")}</TabsTrigger>
          <TabsTrigger value="program">{t("settings:tabs.program")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("settings:tabs.integrations")}</TabsTrigger>
          <TabsTrigger value="language">{t("settings:tabs.language")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>{t("settings:tabs.profile")}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={onSaveProfile} className="max-w-md space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("settings:profile.firstName")}</Label>
                    <Input {...register("firstName")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings:profile.lastName")}</Label>
                    <Input {...register("lastName")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("settings:profile.email")}</Label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("settings:profile.phone")}</Label>
                  <Input {...register("phone")} />
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("settings:profile.saveChanges")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program">
          <ProgramSettingsCard />
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Github className="h-4 w-4" /> {t("settings:integrations.title")}</CardTitle>
              <CardDescription>{t("settings:integrations.description")}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("settings:integrations.note")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader><CardTitle>{t("settings:tabs.language")}</CardTitle></CardHeader>
            <CardContent>
              <LanguageSwitcher />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProgramSettingsCard() {
  const { t } = useTranslation(["settings", "common"]);
  const { data: programs, isLoading } = usePrograms();
  const program = programs?.[0];
  const updateProgram = useUpdateProgram();
  const [strategy, setStrategy] = useState<WeekUnlockStrategy>("MANUAL");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (program) {
      setStrategy(program.weekUnlockStrategy);
      setDescription(program.description);
    }
  }, [program]);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!program) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings:program.title")}</CardTitle>
        <CardDescription>{program.title}</CardDescription>
      </CardHeader>
      <CardContent className="max-w-xl space-y-4">
        <div className="space-y-1.5">
          <Label>{t("settings:program.description")}</Label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("settings:program.unlockStrategy")}</Label>
          <Select value={strategy} onValueChange={(v) => setStrategy(v as WeekUnlockStrategy)}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">{t("settings:program.strategyManual")}</SelectItem>
              <SelectItem value="AUTOMATIC_BY_DATE">{t("settings:program.strategyAutomatic")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() =>
            updateProgram.mutate(
              { id: program.id, input: { description, weekUnlockStrategy: strategy } },
              {
                onSuccess: () => toast.success(t("settings:program.saved")),
                onError: (error) => toast.error(getErrorMessage(error)),
              }
            )
          }
          disabled={updateProgram.isPending}
        >
          {updateProgram.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("settings:program.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
