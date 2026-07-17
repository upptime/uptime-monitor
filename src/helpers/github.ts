import { Octokit } from "@octokit/rest";
import { getConfig } from "./config";
import { getSecret } from "./secrets";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const getGitHubErrorStatus = (error: unknown) => {
  if (typeof error !== "object" || error === null) return undefined;
  const status = (error as { status?: unknown }).status;
  if (typeof status === "number") return status;
  const responseStatus = (error as { response?: { status?: unknown } }).response?.status;
  return typeof responseStatus === "number" ? responseStatus : undefined;
};

export const retryTransientGitHubRequest = async <T>(
  request: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
    wait?: (ms: number) => Promise<void>;
    log?: (message: string) => void;
  } = {}
): Promise<T> => {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 1000;
  const waitForRetry = options.wait ?? wait;
  const log = options.log ?? console.warn;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const status = getGitHubErrorStatus(error);
      const isTransient = status !== undefined && status >= 500 && status <= 599;
      if (!isTransient || attempt === maxAttempts) throw error;

      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      log(`GitHub API request failed with HTTP ${status}; retrying in ${delayMs}ms`);
      await waitForRetry(delayMs);
    }
  }

  throw new Error("GitHub API retry attempts exhausted");
};

export const getOctokit = async (): Promise<Octokit> => {
  const config = await getConfig();
  return new Octokit({
    auth: config.PAT || getSecret("GH_PAT") || getSecret("GITHUB_TOKEN"),
    userAgent: config["user-agent"] || getSecret("USER_AGENT") || "upptime",
  });
};
