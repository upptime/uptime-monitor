"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponseTimeForSite = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const config_1 = require("./config");
const github_1 = require("./github");
/** Calculate the average of some numbers */
const avg = (array) => (array.length ? array.reduce((a, b) => a + b) / array.length : 0);
const getResponseTimeForSite = async (slug) => {
    let [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
    const octokit = await github_1.getOctokit();
    const config = await config_1.getConfig();
    const history = await octokit.repos.listCommits({
        owner,
        repo,
        path: `history/${slug}.yml`,
        per_page: 100,
    });
    const responseTimes = history.data
        .filter((item) => item.commit.message.includes(" in ") &&
        Number(item.commit.message.split(" in ")[1].split("ms")[0].trim()) !== 0 &&
        !isNaN(Number(item.commit.message.split(" in ")[1].split("ms")[0].trim())))
        /**
         * Parse the commit message
         * @example "🟥 Broken Site is down (500 in 321 ms) [skip ci] [upptime]"
         * @returns [Date, 321] where Date is the commit date
         */
        .map((item) => [
        item.commit.author.date,
        parseInt(item.commit.message.split(" in ")[1].split("ms")[0].trim()),
    ])
        .filter((item) => item[1] && !isNaN(item[1]));
    const daySum = responseTimes
        .filter((i) => dayjs_1.default(i[0]).isAfter(dayjs_1.default().subtract(1, "day")))
        .map((i) => i[1]);
    const weekSum = responseTimes
        .filter((i) => dayjs_1.default(i[0]).isAfter(dayjs_1.default().subtract(1, "week")))
        .map((i) => i[1]);
    const monthSum = responseTimes
        .filter((i) => dayjs_1.default(i[0]).isAfter(dayjs_1.default().subtract(1, "month")))
        .map((i) => i[1]);
    const yearSum = responseTimes
        .filter((i) => dayjs_1.default(i[0]).isAfter(dayjs_1.default().subtract(1, "year")))
        .map((i) => i[1]);
    const allSum = responseTimes.map((i) => i[1]);
    console.log("weekSum", weekSum, avg(weekSum));
    // Current status is "up", "down", or "degraded" based on the emoji prefix of the commit message
    const currentStatus = history.data[0].commit.message
        .split(" ")[0]
        .includes(config.commitPrefixStatusUp || "🟩")
        ? "up"
        : history.data[0].commit.message
            .split(" ")[0]
            .includes(config.commitPrefixStatusDegraded || "🟨")
            ? "degraded"
            : "down";
    return {
        day: Math.round(avg(daySum) || 0),
        week: Math.round(avg(weekSum) || 0),
        month: Math.round(avg(monthSum) || 0),
        year: Math.round(avg(yearSum) || 0),
        all: Math.round(avg(allSum) || 0),
        currentStatus,
    };
};
exports.getResponseTimeForSite = getResponseTimeForSite;
//# sourceMappingURL=calculate-response-time.js.map