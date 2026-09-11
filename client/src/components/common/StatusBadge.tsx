import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  NOT_STARTED: { label: "Not Started", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  CHANGES_REQUESTED: { label: "Changes Requested", variant: "destructive" },
  APPROVED: { label: "Approved", variant: "success" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  ACTIVE: { label: "Active", variant: "success" },
  INACTIVE: { label: "Inactive", variant: "secondary" },
  PAUSED: { label: "Paused", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "success" },
  WITHDRAWN: { label: "Withdrawn", variant: "destructive" },
};

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status] ?? { label: status.replace(/_/g, " "), variant: "secondary" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

const PRIORITY_MAP: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  LOW: { label: "Low", variant: "secondary" },
  MEDIUM: { label: "Medium", variant: "default" },
  HIGH: { label: "High", variant: "warning" },
  URGENT: { label: "Urgent", variant: "destructive" },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const entry = PRIORITY_MAP[priority] ?? { label: priority, variant: "secondary" as const };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
