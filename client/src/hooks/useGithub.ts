import { useQuery } from "@tanstack/react-query";
import * as githubApi from "@/api/github";
import { useDebouncedValue } from "./useDebouncedValue";

/** Matches https://github.com/<owner>/<repo> (with or without a trailing path/.git). */
const GITHUB_REPO_URL_PATTERN = /^https?:\/\/(www\.)?github\.com\/[^/\s]+\/[^/\s]+/i;

export function useGithubRepoPreview(url: string) {
  const debouncedUrl = useDebouncedValue(url.trim(), 600);
  const isPlausibleUrl = GITHUB_REPO_URL_PATTERN.test(debouncedUrl);

  const query = useQuery({
    queryKey: ["github-lookup", debouncedUrl],
    queryFn: () => githubApi.lookupRepository(debouncedUrl),
    enabled: isPlausibleUrl,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, isPlausibleUrl };
}
