import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values);
  };

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
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Training Platform</h1>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>{t("login.title")}</CardTitle>
            <CardDescription>{t("login.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="trainer@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {login.isPending ? t("login.submitting") : t("login.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Demo trainee: trainee1@example.com — password: Password123!
        </p>
      </div>
    </div>
  );
}
