import { getOctokit } from "./helpers/github";
export declare const normalizeWorkflowBadges: (readmeContent: string, owner: string, repo: string) => string;
export declare const deleteRecentStatusIssues: (octokit: Awaited<ReturnType<typeof getOctokit>>, owner: string, repo: string, now?: number) => Promise<void>;
export declare const generateSummary: () => Promise<void>;
