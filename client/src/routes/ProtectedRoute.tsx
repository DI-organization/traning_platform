import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useAuth";
import { ForcePasswordChangeGate } from "@/components/common/ForcePasswordChangeGate";
import type { Role } from "@/types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token);
  const storedUser = useAuthStore((s) => s.user);
  const { isLoading, isError } = useCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && !storedUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  if (storedUser?.mustChangePassword) {
    return <ForcePasswordChangeGate />;
  }

  const role = storedUser?.role;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === "TRAINER" ? "/trainer/dashboard" : "/trainee/dashboard"} replace />;
  }

  return <Outlet />;
}
