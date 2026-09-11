import { useTranslation } from "react-i18next";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  NOT_STARTED: "secondary",
  IN_PROGRESS: "default",
  SUBMITTED: "warning",
  UNDER_REVIEW: "warning",
  CHANGES_REQUESTED: "destructive",
  APPROVED: "success",
  OVERDUE: "destructive",
  ACTIVE: "success",
  INACTIVE: "secondary",
  PAUSED: "secondary",
  COMPLETED: "success",
  WITHDRAWN: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("common");
  const variant = STATUS_VARIANTS[status] ?? ("secondary" as const);
  const label = t(`statusLabels.${status}`, { defaultValue: status.replace(/_/g, " ") });
  return <Badge variant={variant}>{label}</Badge>;
}

const PRIORITY_VARIANTS: Record<string, BadgeProps["variant"]> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useTranslation("common");
  const variant = PRIORITY_VARIANTS[priority] ?? ("secondary" as const);
  const label = t(`priorityLabels.${priority}`, { defaultValue: priority });
  return <Badge variant={variant}>{label}</Badge>;
}
