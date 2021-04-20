import { Octokit } from "@octokit/rest";
import { getConfig } from "./config";
import { getSecret } from "./secrets";

export const getOctokit = async (): Promise<Octokit> => {
  const config = await getConfig();
  return new Octokit({
    auth: config.PAT || getSecret("GH_PAT") || getSecret("GITHUB_TOKEN"),
    userAgent: config["user-agent"] || getSecret("USER_AGENT") || "upptime",
  });
};
