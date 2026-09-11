import { useQuery } from "@tanstack/react-query";
import * as analyticsApi from "@/api/analytics";

export function useDashboard() {
  return useQuery({ queryKey: ["analytics", "dashboard"], queryFn: analyticsApi.getDashboard });
}

export function useAnalytics() {
  return useQuery({ queryKey: ["analytics", "full"], queryFn: analyticsApi.getAnalytics });
}
