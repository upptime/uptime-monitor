"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const dns_1 = __importDefault(require("dns"));
const net_1 = require("net");
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const dayjs_1 = __importDefault(require("dayjs"));
const fs_extra_1 = require("fs-extra");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const ws_1 = __importDefault(require("ws"));
const config_1 = require("./helpers/config");
const environment_1 = require("./helpers/environment");
const git_1 = require("./helpers/git");
const github_1 = require("./helpers/github");
const init_check_1 = require("./helpers/init-check");
const notifme_1 = require("./helpers/notifme");
const ping_1 = require("./helpers/ping");
const request_1 = require("./helpers/request");
const secrets_1 = require("./helpers/secrets");
const summary_1 = require("./summary");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Get a human-readable time difference between from now
 * @param startTime - Starting time
 * @returns Human-readable time difference, e.g. "2 days, 3 hours, 5 minutes"
 */
function getHumanReadableTimeDifference(startTime) {
    const diffDays = dayjs_1.default().diff(dayjs_1.default(startTime), "day");
    const diffHours = dayjs_1.default().subtract(diffDays, "day").diff(dayjs_1.default(startTime), "hour");
    const diffMinutes = dayjs_1.default()
        .subtract(diffDays, "day")
        .subtract(diffHours, "hour")
        .diff(dayjs_1.default(startTime), "minute");
    const result = [];
    if (diffDays > 0)
        result.push(`${diffDays.toLocaleString()} ${diffDays > 1 ? "days" : "day"}`);
    if (diffHours > 0)
        result.push(`${diffHours.toLocaleString()} ${diffHours > 1 ? "hours" : "hour"}`);
    if (diffMinutes > 0)
        result.push(`${diffMinutes.toLocaleString()} ${diffMinutes > 1 ? "minutes" : "minute"}`);
    return result.join(", ");
}
const update = async (shouldCommit = false) => {
    if (!(await init_check_1.shouldContinue()))
        return;
    await fs_extra_1.mkdirp("history");
    const [owner, repo] = secrets_1.getOwnerRepo();
    const config = await config_1.getConfig();
    const octokit = await github_1.getOctokit();
    let hasDelta = false;
    const _ongoingMaintenanceEvents = await octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
        filter: "all",
        sort: "created",
        direction: "desc",
        labels: "maintenance",
    });
    console.log("Found ongoing maintenance events", _ongoingMaintenanceEvents.data.length);
    const ongoingMaintenanceEvents = [];
    for await (const incident of _ongoingMaintenanceEvents.data) {
        const metadata = {};
        if (incident.body && incident.body.includes("<!--")) {
            const summary = incident.body.split("<!--")[1].split("-->")[0];
            const lines = summary
                .split("\n")
                .filter((i) => i.trim())
                .filter((i) => i.includes(":"));
            lines.forEach((i) => {
                metadata[i.split(/:(.+)/)[0].trim()] = i.split(/:(.+)/)[1].trim();
            });
        }
        if (metadata.start && metadata.end) {
            let expectedDown = [];
            let expectedDegraded = [];
            if (metadata.expectedDown)
                expectedDown = metadata.expectedDown
                    .split(",")
                    .map((i) => i.trim())
                    .filter((i) => i.length);
            if (metadata.expectedDown)
                expectedDegraded = metadata.expectedDown
                    .split(",")
                    .map((i) => i.trim())
                    .filter((i) => i.length);
            if (dayjs_1.default(metadata.end).isBefore(dayjs_1.default())) {
                await octokit.issues.unlock({
                    owner,
                    repo,
                    issue_number: incident.number,
                });
                await octokit.issues.update({
                    owner,
                    repo,
                    issue_number: incident.number,
                    state: "closed",
                });
                await octokit.issues.lock({
                    owner,
                    repo,
                    issue_number: incident.number,
                });
                console.log("Closed maintenance completed event", incident.number);
            }
            else
                ongoingMaintenanceEvents.push({
                    issueNumber: incident.number,
                    metadata: { start: metadata.start, end: metadata.end, expectedDegraded, expectedDown },
                });
        }
    }
    for await (const site of config.sites) {
        console.log("Checking", site.url);
        if (config.delay) {
            console.log(`Waiting for ${config.delay}ms`);
            await delay(config.delay);
        }
        const slug = site.slug || slugify_1.default(site.name);
        let currentStatus = "unknown";
        let startTime = new Date();
        try {
            const siteHistory = js_yaml_1.load((await fs_extra_1.readFile(path_1.join(".", "history", `${slug}.yml`), "utf8"))
                .split("\n")
                .map((line) => (line.startsWith("- ") ? line.replace("- ", "") : line))
                .join("\n"));
            currentStatus = siteHistory.status || "unknown";
            startTime = new Date(siteHistory.startTime || new Date());
        }
        catch (error) { }
        console.log("Current status", site.slug || slugify_1.default(site.name), currentStatus, startTime);
        /**
         * Check whether the site is online
         */
        const performTestOnce = async () => {
            if (site.check === "tcp-ping") {
                console.log("Using tcp-ping instead of curl");
                try {
                    let status = "up";
                    // https://github.com/upptime/upptime/discussions/888
                    const url = environment_1.replaceEnvironmentVariables(site.url);
                    let address = url;
                    if (net_1.isIP(url)) {
                        if (site.ipv6 && !net_1.isIPv6(url))
                            throw new Error("Site URL must be IPv6 for ipv6 check");
                        else if (site.ipv6)
                            address = (await dns_1.default.promises.resolve6(url))[0];
                        else
                            address = (await dns_1.default.promises.resolve4(url))[0];
                        if (net_1.isIP(url) && !net_1.isIP(address))
                            throw new Error("Site IP address could not be resolved");
                    }
                    const tcpResult = await ping_1.ping({
                        address,
                        attempts: 5,
                        port: Number(environment_1.replaceEnvironmentVariables(site.port ? String(site.port) : "")),
                    });
                    if (tcpResult.results.every((result) => Object.prototype.toString.call(result.err) === "[object Error]"))
                        throw Error("all attempts failed");
                    console.log("Got result", tcpResult);
                    let responseTime = (tcpResult.avg || 0).toFixed(0);
                    if (parseInt(responseTime) > (site.maxResponseTime || 60000))
                        status = "degraded";
                    return {
                        result: { httpCode: 200 },
                        responseTime,
                        status,
                    };
                }
                catch (error) {
                    console.log("ERROR Got pinging error", error);
                    return { result: { httpCode: 0 }, responseTime: (0).toFixed(0), status: "down" };
                }
            }
            else if (site.check === "ws") {
                console.log("Using websocket check instead of curl");
                let success = false;
                let status = "up";
                let responseTime = "0";
                //   promise to await:
                const connect = () => {
                    return new Promise(function (resolve, reject) {
                        const ws = new ws_1.default(environment_1.replaceEnvironmentVariables(site.url));
                        ws.on("open", function open() {
                            if (site.body) {
                                ws.send(environment_1.replaceEnvironmentVariables(site.body));
                            }
                            else {
                                ws.send("");
                            }
                            ws.on("message", function message(data) {
                                if (data) {
                                    success = true;
                                }
                            });
                            ws.close();
                            ws.on("close", function close() {
                                console.log("Websocket disconnected");
                            });
                            resolve(ws);
                        });
                        ws.on("error", function error(error) {
                            reject(error);
                        });
                    });
                };
                try {
                    const connection = await connect();
                    if (connection)
                        success = true;
                    if (success) {
                        status = "up";
                    }
                    else {
                        status = "down";
                    }
                    return {
                        result: { httpCode: 200 },
                        responseTime,
                        status,
                    };
                }
                catch (error) {
                    console.log("ERROR Got pinging error from async call", error);
                    return { result: { httpCode: 0 }, responseTime: (0).toFixed(0), status: "down" };
                }
            }
            else {
                const result = await request_1.curl(site);
                console.log("Result from test", result.httpCode, result.totalTime);
                const responseTime = (result.totalTime * 1000).toFixed(0);
                const expectedStatusCodes = (site.expectedStatusCodes || [
                    200,
                    201,
                    202,
                    203,
                    200,
                    204,
                    205,
                    206,
                    207,
                    208,
                    226,
                    300,
                    301,
                    302,
                    303,
                    304,
                    305,
                    306,
                    307,
                    308,
                ]).map(Number);
                let status = expectedStatusCodes.includes(Number(result.httpCode))
                    ? "up"
                    : "down";
                if (parseInt(responseTime) > (site.maxResponseTime || 60000))
                    status = "degraded";
                if (status === "up" && typeof result.data === "string") {
                    if (site.__dangerous__body_down && result.data.includes(site.__dangerous__body_down))
                        status = "down";
                    if (site.__dangerous__body_degraded &&
                        result.data.includes(site.__dangerous__body_degraded))
                        status = "degraded";
                }
                if (site.__dangerous__body_degraded_if_text_missing &&
                    !result.data.includes(site.__dangerous__body_degraded_if_text_missing))
                    status = "degraded";
                if (site.__dangerous__body_down_if_text_missing &&
                    !result.data.includes(site.__dangerous__body_down_if_text_missing))
                    status = "down";
                return { result, responseTime, status };
            }
        };
        let { result, responseTime, status } = await performTestOnce();
        /**
         * If the site is down, we perform the test 2 more times to make
         * sure that it's not a false alarm
         */
        if (status === "down" || status === "degraded") {
            wait(1000);
            const secondTry = await performTestOnce();
            if (secondTry.status === "up") {
                result = secondTry.result;
                responseTime = secondTry.responseTime;
                status = secondTry.status;
            }
            else {
                wait(10000);
                const thirdTry = await performTestOnce();
                if (thirdTry.status === "up") {
                    result = thirdTry.result;
                    responseTime = thirdTry.responseTime;
                    status = thirdTry.status;
                }
            }
        }
        try {
            if (shouldCommit || currentStatus !== status) {
                await fs_extra_1.writeFile(path_1.join(".", "history", `${slug}.yml`), `url: ${site.url}
status: ${status}
code: ${result.httpCode}
responseTime: ${responseTime}
lastUpdated: ${new Date().toISOString()}
startTime: ${startTime.toISOString()}
generator: Upptime <https://github.com/upptime/upptime>
`);
                git_1.commit(((config.commitMessages || {}).statusChange ||
                    "$PREFIX $SITE_NAME is $STATUS ($RESPONSE_CODE in $RESPONSE_TIME ms) [skip ci] [upptime]")
                    .replace("$PREFIX", status === "up"
                    ? config.commitPrefixStatusUp || "🟩"
                    : status === "degraded"
                        ? config.commitPrefixStatusDegraded || "🟨"
                        : config.commitPrefixStatusDown || "🟥")
                    .replace("$SITE_NAME", site.name)
                    .replace("$SITE_URL", site.url)
                    .replace("$SITE_METHOD", site.method || "GET")
                    .replace("$STATUS", status)
                    .replace("$RESPONSE_CODE", result.httpCode.toString())
                    .replace("$RESPONSE_TIME", responseTime), (config.commitMessages || {}).commitAuthorName, (config.commitMessages || {}).commitAuthorEmail);
                const lastCommitSha = git_1.lastCommit();
                if (currentStatus !== status) {
                    console.log("Status is different", currentStatus, "to", status);
                    hasDelta = true;
                    const issues = await octokit.issues.listForRepo({
                        owner,
                        repo,
                        labels: slug,
                        filter: "all",
                        state: "open",
                        sort: "created",
                        direction: "desc",
                        per_page: 1,
                    });
                    console.log(`Found ${issues.data.length} issues`);
                    // Don't create an issue if it's expected that the site is down or degraded
                    let expected = false;
                    if ((status === "down" &&
                        ongoingMaintenanceEvents.find((i) => i.metadata.expectedDown.includes(slug))) ||
                        (status === "degraded" &&
                            ongoingMaintenanceEvents.find((i) => i.metadata.expectedDegraded.includes(slug))))
                        expected = true;
                    // If the site was just recorded as down or degraded, open an issue
                    if ((status === "down" || status === "degraded") && !expected) {
                        if (!issues.data.length) {
                            const newIssue = await octokit.issues.create({
                                owner,
                                repo,
                                title: status === "down"
                                    ? `🛑 ${site.name} is down`
                                    : `⚠️ ${site.name} has degraded performance`,
                                body: `In [\`${lastCommitSha.substr(0, 7)}\`](https://github.com/${owner}/${repo}/commit/${lastCommitSha}), ${site.name} (${site.url}) ${status === "down" ? "was **down**" : "experienced **degraded performance**"}:
- HTTP code: ${result.httpCode}
- Response time: ${responseTime} ms
`,
                                labels: ["status", slug, ...(site.tags || [])],
                            });
                            const assignees = [...(config.assignees || []), ...(site.assignees || [])];
                            await octokit.issues.addAssignees({
                                owner,
                                repo,
                                issue_number: newIssue.data.number,
                                assignees,
                            });
                            await octokit.issues.lock({
                                owner,
                                repo,
                                issue_number: newIssue.data.number,
                            });
                            console.log("Opened and locked a new issue");
                            try {
                                const downmsg = (await secrets_1.getSecret("NOTIFICATIONS_DOWN_MESSAGE"))
                                    ? (secrets_1.getSecret("NOTIFICATIONS_DOWN_MESSAGE") || "")
                                        .replace("$SITE_NAME", site.name)
                                        .replace("$SITE_URL", `(${site.url})`)
                                        .replace("$ISSUE_URL", `${newIssue.data.html_url}`)
                                        .replace("$RESPONSE_CODE", result.httpCode.toString())
                                    : `$EMOJI ${site.name} (${site.url}) is $STATUS : ${newIssue.data.html_url}`;
                                await notifme_1.sendNotification(status === "down"
                                    ? `${downmsg
                                        .replace("$STATUS", "**down**")
                                        .replace("$EMOJI", `${config.commitPrefixStatusDown || "🟥"}`)}`
                                    : `${downmsg
                                        .replace("$STATUS", "experiencing **degraded performance**")
                                        .replace("$EMOJI", `${config.commitPrefixStatusDegraded || "🟨"}`)}`);
                            }
                            catch (error) {
                                console.log(error);
                            }
                        }
                        else {
                            console.log("An issue is already open for this");
                        }
                    }
                    else if (issues.data.length) {
                        // If the site just came back up
                        await octokit.issues.unlock({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                        });
                        await octokit.issues.createComment({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                            body: `**Resolved:** ${site.name} ${issues.data[0].title.includes("degraded")
                                ? "performance has improved"
                                : "is back up"} in [\`${lastCommitSha.substr(0, 7)}\`](https://github.com/${owner}/${repo}/commit/${lastCommitSha}) after ${getHumanReadableTimeDifference(new Date(issues.data[0].created_at))}.`,
                        });
                        console.log("Created comment in issue");
                        await octokit.issues.update({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                            state: "closed",
                        });
                        await octokit.issues.lock({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                        });
                        console.log("Closed issue");
                        try {
                            const upmsg = (await secrets_1.getSecret("NOTIFICATIONS_UP_MESSAGE"))
                                ? (secrets_1.getSecret("NOTIFICATIONS_UP_MESSAGE") || "")
                                    .replace("$SITE_NAME", site.name)
                                    .replace("$SITE_URL", `(${site.url})`)
                                : `$EMOJI ${site.name} (${site.url}) $STATUS`;
                            await notifme_1.sendNotification(upmsg
                                .replace("$EMOJI", `${config.commitPrefixStatusUp || "🟩"}`)
                                .replace("$STATUS", `${issues.data[0].title.includes("degraded")
                                ? "performance has improved"
                                : "is back up"}`));
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                    else {
                        console.log("Could not find a relevant issue", issues.data);
                    }
                }
                else {
                    console.log("Status is the same", currentStatus, status);
                }
            }
            else {
                console.log("Skipping commit, ", "status is", status);
            }
        }
        catch (error) {
            console.log("ERROR", error);
        }
    }
    git_1.push();
    if (hasDelta)
        summary_1.generateSummary();
};
exports.update = update;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//# sourceMappingURL=update.js.map