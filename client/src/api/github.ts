import { apiClient } from "./client";
import type { ApiSuccess } from "@/types";

export interface GithubLookupResult {
  owner: string;
  repo: string;
  status: "OK" | "NOT_FOUND" | "FAILED";
  name?: string;
  description?: string | null;
  defaultBranch?: string;
  lastPushAt?: string | null;
  stars?: number;
  forks?: number;
  languages?: string[];
}

export async function lookupRepository(url: string) {
  const { data } = await apiClient.get<ApiSuccess<GithubLookupResult>>("/github/lookup", { params: { url } });
  return data.data;
}
