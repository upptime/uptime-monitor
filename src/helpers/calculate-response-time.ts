import dayjs from "dayjs";
import { Downtimes } from "../interfaces";
import { getConfig } from "./config";
import { getOctokit } from "./github";
import { Octokit } from "@octokit/rest";
import { getOwnerRepo } from "./secrets";

/** Calculate the average of some numbers */
const avg = (array: number[]) => (array.length ? array.reduce((a, b) => a + b) / array.length : 0);

/**
 * Read the response time from a commit message
 * Matches " in <number> ms" so that a site name containing " in " (e.g. "Signing in") is not mistaken for it
 * @example "🟥 Broken Site is down (500 in 321 ms) [skip ci] [upptime]" => 321
 */
export const responseTimeFromCommitMessage = (message: string) => {
  const match = message.match(/ in (\d+) ?ms/);
  return match ? parseInt(match[1]) : NaN;
};

/** Get commits for a history file */
const getHistoryItems = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  slug: string,
  page: number
) => {
  console.log("Fetching history - page", 1);
  const results = await octokit.repos.listCommits({
    owner,
    repo,
    path: `history/${slug}.yml`,
    per_page: 100,
    page,
  });
  let data = results.data;
  if (!data[0]) return [];
  if (
    data.length === 100 &&
    !dayjs((data[0].commit.author || {}).date).isBefore(dayjs().subtract(1, "year"))
  )
    data.push(...(await getHistoryItems(octokit, owner, repo, slug, page + 1)));
  return data;
};

export const getResponseTimeForSite = async (
  slug: string
): Promise<Omit<Downtimes & { currentStatus: "up" | "down" | "degraded" }, "dailyMinutesDown">> => {
  const [owner, repo] = getOwnerRepo();
  const octokit = await getOctokit();
  const config = await getConfig();

  const data = await getHistoryItems(octokit, owner, repo, slug, 1);
  const responseTimes: [string, number][] = data
    .map(
      (item) =>
        [(item.commit.author || {}).date, responseTimeFromCommitMessage(item.commit.message)] as [
          string,
          number
        ]
    )
    .filter((item) => item[1] && !isNaN(item[1]));

  const daySum: number[] = responseTimes
    .filter((i) => dayjs(i[0]).isAfter(dayjs().subtract(1, "day")))
    .map((i) => i[1]);
  const weekSum: number[] = responseTimes
    .filter((i) => dayjs(i[0]).isAfter(dayjs().subtract(1, "week")))
    .map((i) => i[1]);
  const monthSum: number[] = responseTimes
    .filter((i) => dayjs(i[0]).isAfter(dayjs().subtract(1, "month")))
    .map((i) => i[1]);
  const yearSum: number[] = responseTimes
    .filter((i) => dayjs(i[0]).isAfter(dayjs().subtract(1, "year")))
    .map((i) => i[1]);
  const allSum: number[] = responseTimes.map((i) => i[1]);
  console.log("weekSum", weekSum, avg(weekSum));

  // Current status is "up", "down", or "degraded" based on the emoji prefix of the commit message
  const currentStatus: "up" | "down" | "degraded" = data[0]
    ? data[0].commit.message.split(" ")[0].includes(config.commitPrefixStatusUp || "🟩")
      ? "up"
      : data[0].commit.message.split(" ")[0].includes(config.commitPrefixStatusDegraded || "🟨")
      ? "degraded"
      : "down"
    : "up";

  return {
    day: Math.round(avg(daySum) || 0),
    week: Math.round(avg(weekSum) || 0),
    month: Math.round(avg(monthSum) || 0),
    year: Math.round(avg(yearSum) || 0),
    all: Math.round(avg(allSum) || 0),
    currentStatus,
  };
};
