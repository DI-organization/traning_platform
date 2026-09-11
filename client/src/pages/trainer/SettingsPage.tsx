import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
        toast.success("Profile updated");
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, program configuration and preferences." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="program">Program</TabsTrigger>
          <TabsTrigger value="integrations">GitHub Integration</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={onSaveProfile} className="max-w-md space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>First name</Label>
                    <Input {...register("firstName")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last name</Label>
                    <Input {...register("lastName")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input {...register("phone")} />
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
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
              <CardTitle className="flex items-center gap-2"><Github className="h-4 w-4" /> GitHub Integration</CardTitle>
              <CardDescription>
                Repository and pull request metadata is fetched from the public GitHub API when a trainee submits work.
                An optional <code className="rounded bg-muted px-1">GITHUB_TOKEN</code> can be set on the server to raise
                rate limits — it is never required for basic use, and GitHub outages never block submissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              OAuth-based private repository access, webhooks and automatic PR status updates are supported by the
              architecture and can be added later without a rewrite (see the GitHub service on the backend).
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader><CardTitle>Language</CardTitle></CardHeader>
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
        <CardTitle>Program Settings</CardTitle>
        <CardDescription>{program.title}</CardDescription>
      </CardHeader>
      <CardContent className="max-w-xl space-y-4">
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Week unlock strategy</Label>
          <Select value={strategy} onValueChange={(v) => setStrategy(v as WeekUnlockStrategy)}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">Manual — trainer unlocks each week</SelectItem>
              <SelectItem value="AUTOMATIC_BY_DATE">Automatic — unlock by start date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() =>
            updateProgram.mutate(
              { id: program.id, input: { description, weekUnlockStrategy: strategy } },
              {
                onSuccess: () => toast.success("Program settings saved"),
                onError: (error) => toast.error(getErrorMessage(error)),
              }
            )
          }
          disabled={updateProgram.isPending}
        >
          {updateProgram.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save program settings
        </Button>
      </CardContent>
    </Card>
  );
}
