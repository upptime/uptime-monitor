import dayjs from "dayjs";
import { readFile } from "fs-extra";
import { load } from "js-yaml";
import { join } from "path";
import { DownPecentages, Downtimes, SiteHistory } from "../interfaces";
import { getOctokit } from "./github";
import { checkOverlap } from "./overlap";
import { getOwnerRepo } from "./secrets";

/**
 * Get the number of seconds a website has been down
 * @param slug - Slug of the site
 */
const getDowntimeSecondsForSite = async (slug: string): Promise<Downtimes> => {
  const [owner, repo] = getOwnerRepo();
  const octokit = await getOctokit();
  let day = 0;
  let week = 0;
  let month = 0;
  let year = 0;
  let all = 0;
  const dailyMinutesDown: Record<string, number> = {};

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
  data.forEach((issue) => {
    const issueDowntime =
      new Date(issue.closed_at || new Date()).getTime() - new Date(issue.created_at).getTime();
    all += issueDowntime;
    const issueOverlap = {
      start: new Date(issue.created_at).getTime(),
      end: new Date(issue.closed_at || new Date()).getTime(),
    };

    [...Array(365).keys()].forEach((day) => {
      const date = dayjs().subtract(day, "day");
      const overlap = checkOverlap(issueOverlap, {
        start: date.startOf("day").toDate().getTime(),
        end: date.endOf("day").toDate().getTime(),
      });
      if (overlap) {
        dailyMinutesDown[date.format("YYYY-MM-DD")] =
          dailyMinutesDown[date.format("YYYY-MM-DD")] || 0;
        dailyMinutesDown[date.format("YYYY-MM-DD")] += Math.round(overlap / 60000);
      }
    });

    const end = dayjs().toDate().getTime();
    day += checkOverlap(issueOverlap, {
      start: dayjs().subtract(1, "day").toDate().getTime(),
      end,
    });
    week += checkOverlap(issueOverlap, {
      start: dayjs().subtract(1, "week").toDate().getTime(),
      end,
    });
    month += checkOverlap(issueOverlap, {
      start: dayjs().subtract(1, "month").toDate().getTime(),
      end,
    });
    year += checkOverlap(issueOverlap, {
      start: dayjs().subtract(1, "year").toDate().getTime(),
      end,
    });
  });

  return {
    day: Math.round(day / 1000),
    week: Math.round(week / 1000),
    month: Math.round(month / 1000),
    year: Math.round(year / 1000),
    all: Math.round(all / 1000),
    dailyMinutesDown,
  };
};

/**
 * Get the uptime percentage for a website
 * @returns Percent string, e.g., 94.43%
 * @param slug - Slug of the site
 */
export const getUptimePercentForSite = async (slug: string): Promise<DownPecentages> => {
  const site = load(
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
  return {
    day: `${Math.max(0, 100 - (downtimeSeconds.day / Math.min(86400, totalSeconds)) * 100).toFixed(
      2
    )}%`,
    week: `${Math.max(
      0,
      100 - (downtimeSeconds.week / Math.min(604800, totalSeconds)) * 100
    ).toFixed(2)}%`,
    month: `${Math.max(
      0,
      100 - (downtimeSeconds.month / Math.min(2628288, totalSeconds)) * 100
    ).toFixed(2)}%`,
    year: `${Math.max(
      0,
      100 - (downtimeSeconds.year / Math.min(31536000, totalSeconds)) * 100
    ).toFixed(2)}%`,
    all: `${Math.max(0, 100 - (downtimeSeconds.all / totalSeconds) * 100).toFixed(2)}%`,
    dailyMinutesDown: downtimeSeconds.dailyMinutesDown,
  };
};
