import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as authApi from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/api/client";

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await authApi.getMe();
      setUser(user);
      return user;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
    meta: { onError: () => logout() },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate(user.role === "TRAINER" ? "/trainer/dashboard" : "/trainee/dashboard", { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Login failed"));
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    authApi.logout().catch(() => undefined);
    logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  };
}
