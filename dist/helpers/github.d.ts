import { Octokit } from "@octokit/rest";
export declare const retryTransientGitHubRequest: <T>(request: () => Promise<T>, options?: {
    maxAttempts?: number;
    initialDelayMs?: number;
    wait?: (ms: number) => Promise<void>;
    log?: (message: string) => void;
}) => Promise<T>;
export declare const getOctokit: () => Promise<Octokit>;
