import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Github, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useUpdateMyProfile } from "@/hooks/useTrainees";
import { getErrorMessage } from "@/api/client";
import { initials } from "@/lib/format";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import * as authApi from "@/api/auth";

export default function TraineeProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const updateProfile = useUpdateMyProfile();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      githubUsername: user?.githubUsername ?? "",
      avatar: user?.avatar ?? "",
    },
  });

  const onSave = handleSubmit((values) => {
    updateProfile.mutate(values, {
      onSuccess: (updated) => {
        setUser(updated);
        toast.success("Profile updated");
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
  } = useForm({ defaultValues: { currentPassword: "", newPassword: "" } });

  const changePassword = useMutation({
    mutationFn: (values: { currentPassword: string; newPassword: string }) => authApi.changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      toast.success("Password changed");
      resetPassword();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not change password")),
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your personal information and preferences." />

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar ?? undefined} />
          <AvatarFallback className="text-lg">{initials(user.firstName, user.lastName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardContent className="p-5">
              <form onSubmit={onSave} className="max-w-md space-y-4">
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
                  <Label>Phone</Label>
                  <Input {...register("phone")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1"><Github className="h-3.5 w-3.5" /> GitHub username</Label>
                  <Input placeholder="octocat" {...register("githubUsername")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Avatar URL</Label>
                  <Input placeholder="https://..." {...register("avatar")} />
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent>
              <form
                onSubmit={handlePasswordSubmit((values) => changePassword.mutate(values))}
                className="max-w-md space-y-4"
              >
                <div className="space-y-1.5">
                  <Label>Current password</Label>
                  <Input type="password" {...registerPassword("currentPassword", { required: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>New password</Label>
                  <Input type="password" {...registerPassword("newPassword", { required: true, minLength: 8 })} />
                </div>
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
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
