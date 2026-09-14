import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import * as authApi from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { getErrorMessage } from "@/api/client";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

/**
 * A trainer-created trainee account starts with mustChangePassword: true.
 * This gate replaces the entire app shell (rendered by ProtectedRoute
 * instead of the normal Outlet) until the trainee sets their own password
 * — it's a hard block, not a dismissible banner, so a temporary credential
 * can never be reused as a permanent one.
 */
export function ForcePasswordChangeGate() {
  const { t } = useTranslation(["auth", "common"]);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = useMutation({
    mutationFn: (values: FormValues) => authApi.changePassword(values.currentPassword, values.newPassword),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success(t("auth:forcePasswordChange.success"));
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 600px 500px at 20% 20%, hsl(var(--primary) / 0.28), transparent), radial-gradient(ellipse 500px 500px at 85% 80%, hsl(var(--gradient-end) / 0.22), transparent)",
        }}
      />
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="relative w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="gradient-primary shadow-glow flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{t("common:app.name")}</h1>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>{t("auth:forcePasswordChange.title")}</CardTitle>
            <CardDescription>{t("auth:forcePasswordChange.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((values) => submit.mutate(values))} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">{t("auth:forcePasswordChange.currentPassword")}</Label>
                <Input id="currentPassword" type="password" autoComplete="current-password" {...register("currentPassword")} />
                {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">{t("auth:forcePasswordChange.newPassword")}</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
                {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submit.isPending}>
                {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("auth:forcePasswordChange.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <button onClick={logout} className="block w-full text-center text-xs text-muted-foreground hover:underline">
          {t("common:actions.logout")}
        </button>
      </div>
    </div>
  );
}
