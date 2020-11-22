"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUptimePercentForSite = void 0;
const fs_extra_1 = require("fs-extra");
const js_yaml_1 = require("js-yaml");
const github_1 = require("./github");
const path_1 = require("path");
/**
 * Get the number of seconds a website has been down
 * @param slug - Slug of the site
 */
const getDowntimeSecondsForSite = async (slug) => {
    let [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
    const octokit = await github_1.getOctokit();
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
    data.forEach((issue) => (msDown +=
        new Date(issue.closed_at || new Date()).getTime() - new Date(issue.created_at).getTime()));
    return Math.round(msDown / 1000);
};
/**
 * Get the uptime percentage for a website
 * @returns Percent string, e.g., 94.43%
 * @param slug - Slug of the site
 */
const getUptimePercentForSite = async (slug) => {
    const site = js_yaml_1.safeLoad((await fs_extra_1.readFile(path_1.join(".", "history", `${slug}.yml`), "utf8"))
        .split("\n")
        .map((line) => (line.startsWith("- ") ? line.replace("- ", "") : line))
        .join("\n"));
    // Time when we started tracking this website's downtime
    const startDate = new Date(site.startTime || new Date());
    // Number of seconds we have been tracking this site
    const totalSeconds = (new Date().getTime() - startDate.getTime()) / 1000;
    // Number of seconds the site has been down
    const downtimeSeconds = await getDowntimeSecondsForSite(slug);
    // Return a percentage string
    return `${(100 - (downtimeSeconds / totalSeconds) * 100).toFixed(2)}%`;
};
exports.getUptimePercentForSite = getUptimePercentForSite;
//# sourceMappingURL=calculate-uptime.js.map