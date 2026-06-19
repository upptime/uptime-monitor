"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDependencies = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const config_1 = require("./helpers/config");
const git_1 = require("./helpers/git");
const github_1 = require("./helpers/github");
const secrets_1 = require("./helpers/secrets");
const getLatestPackageVersion = async (octokit, pkgName, currentVersion) => {
    const [owner, repo] = pkgName.split("/");
    try {
        const releases = await octokit.repos.listReleases({
            owner,
            repo,
            per_page: 1,
        });
        const latestRelease = releases.data[0]?.tag_name;
        if (latestRelease)
            return latestRelease;
    }
    catch (_) {
        // Fall through to tags when GitHub release lookup is temporarily unavailable.
    }
    try {
        const tags = await octokit.repos.listTags({
            owner,
            repo,
            per_page: 1,
        });
        const latestTag = tags.data[0]?.name;
        if (latestTag)
            return latestTag;
    }
    catch (_) {
        // Keep the current version rather than crashing the updater on API failures.
    }
    return currentVersion;
};
const updateDependencies = async () => {
    const [owner, repo] = (0, secrets_1.getOwnerRepo)();
    if (`${owner}/${repo}` !== "upptime/upptime")
        return;
    const config = await (0, config_1.getConfig)();
    const commitMessages = config.commitMessages || {};
    const octokit = await (0, github_1.getOctokit)();
    let changes = 0;
    await (0, fs_extra_1.ensureDir)((0, path_1.join)(".", ".github", "workflows"));
    const workflows = (await (0, fs_extra_1.readdir)((0, path_1.join)(".", ".github", "workflows"))).filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
    const uses = {};
    for await (const workflow of workflows) {
        const contents = await (0, fs_extra_1.readFile)((0, path_1.join)(".", ".github", "workflows", workflow), "utf8");
        contents
            .split("\n")
            .filter((line) => line.includes("uses:"))
            .map((line) => line.split("uses:")[1].trim())
            .filter((pkg) => pkg.startsWith("upptime/"))
            .forEach((pkg) => (uses[pkg] = pkg));
    }
    for await (const pkgOldVersion of Object.keys(uses)) {
        const [pkgName, currentVersion] = pkgOldVersion.split("@");
        const latestVersion = await getLatestPackageVersion(octokit, pkgName, currentVersion);
        uses[pkgOldVersion] = latestVersion ? `${pkgName}@${latestVersion}` : pkgName;
    }
    for await (const pkgOldVersion of Object.keys(uses)) {
        const pkgName = pkgOldVersion.split("@")[0];
        for await (const workflow of workflows) {
            let contents = await (0, fs_extra_1.readFile)((0, path_1.join)(".", ".github", "workflows", workflow), "utf8");
            contents = contents.replace(pkgOldVersion, uses[pkgOldVersion]);
            await (0, fs_extra_1.writeFile)((0, path_1.join)(".", ".github", "workflows", workflow), contents);
        }
        if (pkgOldVersion.split("@")[1] !== uses[pkgOldVersion].split("@")[1])
            changes++;
        (0, git_1.commit)(`:arrow_up: Bump ${pkgName} from ${pkgOldVersion.split("@")[1]} to ${uses[pkgOldVersion].split("@")[1]}\n\nBumps [${pkgName}](https://github.com/${pkgName}) from ${pkgOldVersion.split("@")[1]} to ${uses[pkgOldVersion].split("@")[1]}.\n- [Release notes](https://github.com/${pkgName}/releases)\n- [Commits](https://github.com/${pkgName}@${pkgOldVersion.split("@")[1]}...${uses[pkgOldVersion].split("@")[1]})${commitMessages.signoff ? "" : "\n\nSigned-off-by: Anand Chowdhary <github@anandchowdhary.com>"}`, commitMessages.commitAuthorName, commitMessages.commitAuthorEmail, commitMessages.signoff);
    }
    (0, git_1.push)();
    if (changes) {
        const contents = await octokit.repos.getContent({ owner, repo, path: "README.md" });
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: "README.md",
            content: contents.data.content,
            sha: contents.data.sha,
            message: ":package: Release dependency updates",
        });
    }
};
exports.updateDependencies = updateDependencies;
//# sourceMappingURL=dependencies.js.map