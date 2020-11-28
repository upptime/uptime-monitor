"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTemplate = void 0;
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const config_1 = require("./helpers/config");
const git_1 = require("./helpers/git");
const github_1 = require("./helpers/github");
const updateTemplate = async () => {
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
    const octokit = await github_1.getOctokit();
    // Remove the .github/workflows directory completely
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows"));
    console.log("Removed legacy .github/workflows");
    // Get most recent release
    const releases = await octokit.repos.listReleases({
        owner: "upptime",
        repo: "uptime-monitor",
        per_page: 1,
    });
    const latestRelease = releases.data[0].tag_name;
    console.log("Got @upptime/uptime-monitor release", latestRelease);
    // Clone and copy workflows from this repo
    child_process_1.execSync("git clone https://github.com/upptime/uptime-monitor __upptime");
    await fs_extra_1.copy(path_1.join(".", "__upptime", "src", "workflows"), path_1.join(".", ".github", "workflows"));
    await fs_extra_1.remove(path_1.join(".", "__upptime"));
    const workflowFiles = await fs_extra_1.readdir(path_1.join(".", ".github", "workflows"));
    for await (const file of workflowFiles) {
        const contents = await fs_extra_1.readFile(path_1.join(".", ".github", "workflows", file), "utf8");
        await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", file), contents
            .replace(new RegExp("UPTIME_MONITOR_VERSION", "g"), latestRelease)
            .replace(new RegExp("CURRENT_DATE", "g"), new Date().toISOString()));
    }
    console.log("Added new .github/workflows");
    // Delete these specific template files
    const delteFiles = ["README.pt-br.md", ".templaterc.json"];
    for await (const file of delteFiles)
        try {
            if (`${owner}/${repo}` !== "upptime/upptime")
                await fs_extra_1.remove(path_1.join(".", file));
        }
        catch (error) { }
    console.log("Removed template files");
    const config = await config_1.getConfig();
    const slugs = config.sites.map((site) => site.slug || slugify_1.default(site.name));
    const filesToKeep = ["LICENSE"];
    // Remove old data from ./api
    const apiData = await fs_extra_1.readdir(path_1.join(".", "api"));
    for await (const file of apiData)
        if (!filesToKeep.includes(file) && !slugs.includes(file))
            await fs_extra_1.remove(path_1.join(".", "api", file));
    console.log("Removed old data from api");
    // Remove old data from ./graphs
    const graphsData = await fs_extra_1.readdir(path_1.join(".", "graphs"));
    for await (const file of graphsData)
        if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".png", "")))
            await fs_extra_1.remove(path_1.join(".", "graphs", file));
    console.log("Removed old data from graphs");
    // Remove old data from ./history
    const historyData = await fs_extra_1.readdir(path_1.join(".", "history"));
    for await (const file of historyData)
        if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".yml", "")))
            await fs_extra_1.remove(path_1.join(".", "history", file));
    console.log("Removed old data from history");
    git_1.commit(":arrow_up: Update @upptime to latest");
    git_1.push();
    console.log("All done!");
};
exports.updateTemplate = updateTemplate;
//# sourceMappingURL=update-template.js.map