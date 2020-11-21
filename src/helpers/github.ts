import { Octokit } from "@octokit/rest";
import { getConfig } from "./config";

export const getOctokit = async (): Promise<Octokit> => {
  const config = await getConfig();
  return new Octokit({
    auth: config.PAT || process.env.GH_PAT || process.env.GITHUB_TOKEN,
    userAgent: config["user-agent"] || process.env.USER_AGENT || "KojBot",
  });
};
