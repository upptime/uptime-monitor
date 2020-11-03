"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const rest_1 = require("@octokit/rest");
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const fs_extra_1 = require("fs-extra");
const js_yaml_1 = require("js-yaml");
const node_libcurl_1 = require("node-libcurl");
const path_1 = require("path");
const git_1 = require("./git");
const notifications_1 = require("./notifications");
const summary_1 = require("./summary");
exports.update = async (shouldCommit = false) => {
    const config = js_yaml_1.safeLoad(await fs_extra_1.readFile(path_1.join(".", ".upptimerc.yml"), "utf8"));
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
    const octokit = new rest_1.Octokit({
        auth: config.PAT || process.env.GH_PAT || process.env.GITHUB_TOKEN,
        userAgent: config["user-agent"] || process.env.USER_AGENT || "KojBot",
    });
    let hasDelta = false;
    for await (const site of config.sites) {
        const slug = slugify_1.default(site.name);
        console.log("Checking", site.url);
        let currentStatus = "unknown";
        let startTime = new Date().toISOString();
        try {
            currentStatus =
                ((await fs_extra_1.readFile(path_1.join(".", "history", `${slug}.yml`), "utf8"))
                    .split("\n")
                    .find((line) => line.toLocaleLowerCase().includes("- status")) || "")
                    .split(":")[1]
                    .trim() || "unknown";
            startTime =
                ((await fs_extra_1.readFile(path_1.join(".", "history", `${slug}.yml`), "utf8"))
                    .split("\n")
                    .find((line) => line.toLocaleLowerCase().includes("- starttime")) || "")
                    .split("startTime:")[1]
                    .trim() || new Date().toISOString();
        }
        catch (error) { }
        const performTestOnce = async () => {
            const result = await curl(site.url.startsWith("$")
                ? process.env[site.url.substr(1, site.url.length)] || ""
                : site.url, site.method);
            console.log("Result", result);
            const responseTime = (result.totalTime * 1000).toFixed(0);
            const status = result.httpCode >= 400 || result.httpCode < 200 ? "down" : "up";
            return { result, responseTime, status };
        };
        let { result, responseTime, status } = await performTestOnce();
        /**
         * If the site is down, we perform the test 2 more times to make
         * sure that it's not a false alarm
         */
        if (status === "down") {
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
                const content = `- url: ${site.url}
- status: ${status}
- code: ${result.httpCode}
- responseTime: ${responseTime}
- lastUpdated: ${new Date().toISOString()}
- startTime: ${startTime}
- generator: Upptime <https://github.com/upptime/upptime>
`;
                await fs_extra_1.writeFile(path_1.join(".", "history", `${slug}.yml`), content);
                git_1.commit(((config.commitMessages || {}).statusChange ||
                    "$EMOJI $SITE_NAME is $STATUS ($RESPONSE_CODE in $RESPONSE_TIME ms) [skip ci] [upptime]")
                    .replace(/\$EMOJI/g, status === "up" ? "🟩" : "🟥")
                    .replace(/\$SITE_NAME/g, site.name)
                    .replace(/\$SITE_URL/g, site.url)
                    .replace(/\$SITE_METHOD/g, site.method || "GET")
                    .replace(/\$STATUS/g, status)
                    .replace(/\$RESPONSE_CODE/g, result.httpCode.toString())
                    .replace(/\$RESPONSE_TIME/g, responseTime), (config.commitMessages || {}).commitAuthorName, (config.commitMessages || {}).commitAuthorEmail);
                const lastCommitSha = git_1.lastCommit();
                if (currentStatus !== status) {
                    console.log("Status is different", currentStatus, "to", status);
                    hasDelta = true;
                    const issues = await octokit.issues.list({
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
                    // If the site was just recorded as down, open an issue
                    if (status === "down") {
                        if (!issues.data.length) {
                            const newIssue = await octokit.issues.create({
                                owner,
                                repo,
                                title: `🛑 ${site.name} is down`,
                                body: `In [\`${lastCommitSha.substr(0, 7)}\`](https://github.com/${owner}/${repo}/commit/${lastCommitSha}), ${site.name} (${site.url}) was **down**:
- HTTP code: ${result.httpCode}
- Response time: ${responseTime} ms
`,
                                assignees: [...(config.assignees || []), ...(site.assignees || [])],
                                labels: ["status", slug],
                            });
                            await octokit.issues.lock({
                                owner,
                                repo,
                                issue_number: newIssue.data.number,
                            });
                            console.log("Opened and locked a new issue");
                            await notifications_1.sendNotification(config, `🟥 ${site.name} (${site.url}) is **down**: ${newIssue.data.html_url}`);
                        }
                        else {
                            console.log("An issue is already open for this");
                        }
                    }
                    else if (issues.data.length) {
                        // If the site just came back up
                        await octokit.issues.createComment({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                            body: `**Resolved:** ${site.name} is back up in [\`${lastCommitSha.substr(0, 7)}\`](https://github.com/${owner}/${repo}/commit/${lastCommitSha}).`,
                        });
                        console.log("Created comment in issue");
                        await octokit.issues.update({
                            owner,
                            repo,
                            issue_number: issues.data[0].number,
                            state: "closed",
                        });
                        console.log("Closed issue");
                        await notifications_1.sendNotification(config, `🟩 ${site.name} (${site.url}) is back up.`);
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
const curl = (url, method = "GET") => new Promise((resolve) => {
    const curl = new node_libcurl_1.Curl();
    curl.enable(node_libcurl_1.CurlFeature.Raw);
    curl.setOpt("URL", url);
    curl.setOpt("FOLLOWLOCATION", 1);
    curl.setOpt("MAXREDIRS", 3);
    curl.setOpt("USERAGENT", "Koj Bot");
    curl.setOpt("CONNECTTIMEOUT", 10);
    curl.setOpt("TIMEOUT", 30);
    curl.setOpt("HEADER", 1);
    curl.setOpt("VERBOSE", false);
    curl.setOpt("CUSTOMREQUEST", method);
    curl.on("error", () => {
        curl.close();
        return resolve({ httpCode: 0, totalTime: 0 });
    });
    curl.on("end", () => {
        let httpCode = 0;
        let totalTime = 0;
        try {
            httpCode = Number(curl.getInfo("RESPONSE_CODE"));
            totalTime = Number(curl.getInfo("TOTAL_TIME"));
        }
        catch (error) {
            curl.close();
            return resolve({ httpCode, totalTime });
        }
        return resolve({ httpCode, totalTime });
    });
    curl.perform();
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
