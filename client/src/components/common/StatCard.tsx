import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "success" | "warning" | "destructive";
  loading?: boolean;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-primary/15 text-primary shadow-[0_0_20px_-6px_hsl(var(--primary)/0.55)]",
  success: "bg-success/15 text-success shadow-[0_0_20px_-6px_hsl(var(--success)/0.5)]",
  warning: "bg-warning/15 text-warning shadow-[0_0_20px_-6px_hsl(var(--warning)/0.5)]",
  destructive: "bg-destructive/15 text-destructive shadow-[0_0_20px_-6px_hsl(var(--destructive)/0.5)]",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "default", loading }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
      <div className="gradient-primary absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity group-hover:opacity-100" />
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
