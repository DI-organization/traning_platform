import { prisma } from "../config/prisma";
import { env } from "../config/env";

const GITHUB_API = "https://api.github.com";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.githubToken) headers.Authorization = `Bearer ${env.githubToken}`;
  return headers;
}

export interface ParsedRepo {
  owner: string;
  repo: string;
}

export interface ParsedPullRequest extends ParsedRepo {
  number: number;
}

/** Parses https://github.com/<owner>/<repo>(.git)?(/...)? */
export function parseRepositoryUrl(url: string): ParsedRepo | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

/** Parses https://github.com/<owner>/<repo>/pull/<number> */
export function parsePullRequestUrl(url: string): ParsedPullRequest | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.replace(/^\//, "").split("/").filter(Boolean);
    const pullIndex = parts.indexOf("pull");
    if (pullIndex === -1 || !parts[pullIndex + 1]) return null;
    const number = Number(parts[pullIndex + 1]);
    if (!Number.isFinite(number)) return null;
    return { owner: parts[0], repo: parts[1], number };
  } catch {
    return null;
  }
}

export async function fetchRepositoryMetadata(owner: string, repo: string) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: authHeaders() });
  if (res.status === 404) return { status: "NOT_FOUND" as const };
  if (!res.ok) return { status: "FAILED" as const };

  const json = (await res.json()) as {
    name: string;
    description: string | null;
    default_branch: string;
    pushed_at: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
  };

  return {
    status: "OK" as const,
    name: json.name,
    description: json.description,
    defaultBranch: json.default_branch,
    lastPushAt: json.pushed_at ? new Date(json.pushed_at) : null,
    stars: json.stargazers_count,
    forks: json.forks_count,
    languages: json.language ? [json.language] : [],
  };
}

export async function fetchPullRequestMetadata(owner: string, repo: string, number: number) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${number}`, { headers: authHeaders() });
  if (res.status === 404) return { status: "NOT_FOUND" as const };
  if (!res.ok) return { status: "FAILED" as const };

  const json = (await res.json()) as {
    title: string;
    state: string;
    user: { login: string } | null;
    created_at: string;
    updated_at: string;
    merged_at: string | null;
  };

  return {
    status: "OK" as const,
    title: json.title,
    state: json.state,
    author: json.user?.login ?? null,
    prCreatedAt: json.created_at ? new Date(json.created_at) : null,
    prUpdatedAt: json.updated_at ? new Date(json.updated_at) : null,
    mergedAt: json.merged_at ? new Date(json.merged_at) : null,
  };
}

/**
 * Best-effort background enrichment. Any failure (rate limit, network,
 * invalid URL) is caught and recorded as fetchStatus so the submission
 * itself is never blocked by GitHub availability.
 */
export async function fetchAndStoreGitHubMetadata(
  submissionId: string,
  urls: { repositoryUrl?: string; pullRequestUrl?: string }
) {
  if (urls.repositoryUrl) {
    const parsed = parseRepositoryUrl(urls.repositoryUrl);
    if (parsed) {
      try {
        const meta = await fetchRepositoryMetadata(parsed.owner, parsed.repo);
        await prisma.gitHubRepository.upsert({
          where: { submissionId },
          update: {
            owner: parsed.owner,
            name: parsed.repo,
            fetchStatus: meta.status,
            fetchedAt: new Date(),
            ...(meta.status === "OK"
              ? {
                  description: meta.description,
                  defaultBranch: meta.defaultBranch,
                  lastPushAt: meta.lastPushAt,
                  stars: meta.stars,
                  forks: meta.forks,
                  languages: meta.languages,
                }
              : {}),
          },
          create: {
            submissionId,
            owner: parsed.owner,
            name: parsed.repo,
            fetchStatus: meta.status,
            fetchedAt: new Date(),
            ...(meta.status === "OK"
              ? {
                  description: meta.description,
                  defaultBranch: meta.defaultBranch,
                  lastPushAt: meta.lastPushAt,
                  stars: meta.stars,
                  forks: meta.forks,
                  languages: meta.languages,
                }
              : {}),
          },
        });
      } catch {
        await prisma.gitHubRepository
          .upsert({
            where: { submissionId },
            update: { fetchStatus: "FAILED", fetchedAt: new Date() },
            create: {
              submissionId,
              owner: parsed.owner,
              name: parsed.repo,
              fetchStatus: "FAILED",
              fetchedAt: new Date(),
            },
          })
          .catch(() => undefined);
      }
    }
  }

  if (urls.pullRequestUrl) {
    const parsed = parsePullRequestUrl(urls.pullRequestUrl);
    if (parsed) {
      try {
        const meta = await fetchPullRequestMetadata(parsed.owner, parsed.repo, parsed.number);
        await prisma.gitHubPullRequest.upsert({
          where: { submissionId },
          update: {
            owner: parsed.owner,
            repo: parsed.repo,
            number: parsed.number,
            fetchStatus: meta.status,
            fetchedAt: new Date(),
            ...(meta.status === "OK"
              ? {
                  title: meta.title,
                  state: meta.state,
                  author: meta.author,
                  prCreatedAt: meta.prCreatedAt,
                  prUpdatedAt: meta.prUpdatedAt,
                  mergedAt: meta.mergedAt,
                }
              : {}),
          },
          create: {
            submissionId,
            owner: parsed.owner,
            repo: parsed.repo,
            number: parsed.number,
            fetchStatus: meta.status,
            fetchedAt: new Date(),
            ...(meta.status === "OK"
              ? {
                  title: meta.title,
                  state: meta.state,
                  author: meta.author,
                  prCreatedAt: meta.prCreatedAt,
                  prUpdatedAt: meta.prUpdatedAt,
                  mergedAt: meta.mergedAt,
                }
              : {}),
          },
        });
      } catch {
        await prisma.gitHubPullRequest
          .upsert({
            where: { submissionId },
            update: { fetchStatus: "FAILED", fetchedAt: new Date() },
            create: {
              submissionId,
              owner: parsed.owner,
              repo: parsed.repo,
              number: parsed.number,
              fetchStatus: "FAILED",
              fetchedAt: new Date(),
            },
          })
          .catch(() => undefined);
      }
    }
  }
}

export async function refetchSubmissionMetadata(submissionId: string) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) return;
  await fetchAndStoreGitHubMetadata(submissionId, {
    repositoryUrl: submission.repositoryUrl ?? undefined,
    pullRequestUrl: submission.pullRequestUrl ?? undefined,
  });
}
