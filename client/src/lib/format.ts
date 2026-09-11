import { format, formatDistanceToNow, isPast } from "date-fns";

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date | null | undefined, pattern = "MMM d, yyyy"): string {
  if (!date) return "—";
  return format(new Date(date), pattern);
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return isPast(new Date(date));
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function fullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}
