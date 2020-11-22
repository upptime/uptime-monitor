import { readFile } from "fs-extra";
import { safeLoad } from "js-yaml";
import { getOctokit } from "./github";
import { join } from "path";
import { SiteHistory } from "../interfaces";

/**
 * Get the number of seconds a website has been down
 * @param slug - Slug of the site
 */
const getDowntimeSecondsForSite = async (slug: string): Promise<number> => {
  let [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  const octokit = await getOctokit();
  let msDown = 0;

  // Get all the issues for this website
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    labels: `status,${slug}`,
    filter: "all",
    state: "all",
    per_page: 100,
  });

  // If this issue has been closed already, calculate the difference
  // between when it was closed and when it was opened
  // If this issue is still open, calculate the time since it was opened
  data.forEach(
    (issue) =>
      (msDown +=
        new Date(issue.closed_at || new Date()).getTime() - new Date(issue.created_at).getTime())
  );

  return Math.round(msDown / 1000);
};

/**
 * Get the uptime percentage for a website
 * @returns Percent string, e.g., 94.43%
 * @param slug - Slug of the site
 */
export const getUptimePercentForSite = async (slug: string): Promise<string> => {
  const site = safeLoad(
    (await readFile(join(".", "history", `${slug}.yml`), "utf8"))
      .split("\n")
      .map((line) => (line.startsWith("- ") ? line.replace("- ", "") : line))
      .join("\n")
  ) as SiteHistory;
  // Time when we started tracking this website's downtime
  const startDate = new Date(site.startTime || new Date());

  // Number of seconds we have been tracking this site
  const totalSeconds = (new Date().getTime() - startDate.getTime()) / 1000;

  // Number of seconds the site has been down
  const downtimeSeconds = await getDowntimeSecondsForSite(slug);

  // Return a percentage string
  return `${((downtimeSeconds / totalSeconds) * 100).toFixed(2)}%`;
};
