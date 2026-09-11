import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { useCreateTrainee } from "@/hooks/useTrainees";
import { getErrorMessage } from "@/api/client";
import { useMemo, useState } from "react";

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function buildSchema(t: (key: string) => string) {
  return z.object({
    firstName: z.string().min(1, t("trainees:create.validation.required")),
    lastName: z.string().min(1, t("trainees:create.validation.required")),
    email: z.string().email(t("trainees:create.validation.email")),
    password: z.string().min(8, t("trainees:create.validation.password")),
    phone: z.string().optional(),
    githubUsername: z.string().optional(),
  });
}

export function CreateTraineeDialog() {
  const { t } = useTranslation(["trainees", "common"]);
  const [open, setOpen] = useState(false);
  const createTrainee = useCreateTrainee();
  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    createTrainee.mutate(values, {
      onSuccess: () => {
        toast.success(t("trainees:create.success"));
        reset();
        setOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error, t("trainees:create.error"))),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          {t("trainees:create.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("trainees:create.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t("trainees:create.firstName")}</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t("trainees:create.lastName")}</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("trainees:create.email")}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("trainees:create.password")}</Label>
            <Input id="password" type="text" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("trainees:create.phone")}</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="githubUsername">{t("trainees:create.githubUsername")}</Label>
              <Input id="githubUsername" {...register("githubUsername")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common:actions.cancel")}
            </Button>
            <Button type="submit" disabled={createTrainee.isPending}>
              {createTrainee.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("trainees:create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
