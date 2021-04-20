"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTemplate = void 0;
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const config_1 = require("./helpers/config");
const git_1 = require("./helpers/git");
const secrets_1 = require("./helpers/secrets");
const workflows_1 = require("./helpers/workflows");
const updateTemplate = async () => {
    const [owner, repo] = secrets_1.getOwnerRepo();
    const config = await config_1.getConfig();
    // Remove our workflows (not all workflows)
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "graphs.yml"));
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "response-time.yml"));
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "setup.yml"));
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "site.yml"));
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "summary.yml"));
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "update-template.yml"));
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "updates.yml"));
    await fs_extra_1.remove(path_1.join(".", ".github", "workflows", "uptime.yml"));
    console.log("Removed legacy .github/workflows");
    // Clone and create workflows from this repo
    await fs_extra_1.ensureDir(path_1.join(".", ".github", "workflows"));
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "graphs.yml"), await workflows_1.graphsCiWorkflow());
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "response-time.yml"), await workflows_1.responseTimeCiWorkflow());
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "setup.yml"), await workflows_1.setupCiWorkflow());
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "site.yml"), await workflows_1.siteCiWorkflow());
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "summary.yml"), await workflows_1.summaryCiWorkflow());
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "update-template.yml"), await workflows_1.updateTemplateCiWorkflow());
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "updates.yml"), await workflows_1.updatesCiWorkflow());
    await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", "uptime.yml"), await workflows_1.uptimeCiWorkflow());
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
    const slugs = config.sites.map((site) => site.slug || slugify_1.default(site.name));
    const filesToKeep = ["LICENSE", "summary.json"];
    // Remove old data from ./api
    try {
        const apiData = await fs_extra_1.readdir(path_1.join(".", "api"));
        for await (const file of apiData)
            if (!filesToKeep.includes(file) && !slugs.includes(file))
                await fs_extra_1.remove(path_1.join(".", "api", file));
        console.log("Removed old data from api");
    }
    catch (error) {
        console.log(error);
    }
    // Remove old data from ./graphs
    try {
        const graphsData = await fs_extra_1.readdir(path_1.join(".", "graphs"));
        for await (const file of graphsData)
            if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".png", "")))
                await fs_extra_1.remove(path_1.join(".", "graphs", file));
        console.log("Removed old data from graphs");
    }
    catch (error) {
        console.log(error);
    }
    // Remove old data from ./history
    try {
        const historyData = await fs_extra_1.readdir(path_1.join(".", "history"));
        for await (const file of historyData)
            if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".yml", "")))
                await fs_extra_1.remove(path_1.join(".", "history", file));
        console.log("Removed old data from history");
    }
    catch (error) {
        console.log(error);
    }
    git_1.commit(`:arrow_up: Update @upptime to ${await workflows_1.getUptimeMonitorVersion()}`);
    git_1.push();
    console.log("All done!");
};
exports.updateTemplate = updateTemplate;
//# sourceMappingURL=update-template.js.map