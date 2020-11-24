"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDependencies = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const config_1 = require("./helpers/config");
const git_1 = require("./helpers/git");
const github_1 = require("./helpers/github");
const updateDependencies = async () => {
    let [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
    if (`${owner}/${repo}` !== "upptime/upptime")
        return;
    const config = await config_1.getConfig();
    const octokit = await github_1.getOctokit();
    await fs_extra_1.ensureDir(path_1.join(".", ".github", "workflows"));
    const workflows = (await fs_extra_1.readdir(path_1.join(".", ".github", "workflows"))).filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
    const uses = {};
    for await (const workflow of workflows) {
        const contents = await fs_extra_1.readFile(path_1.join(".", ".github", "workflows", workflow), "utf8");
        contents
            .split("\n")
            .filter((line) => line.includes("uses:"))
            .map((line) => line.split("uses:")[1].trim())
            .filter((pkg) => pkg.startsWith("upptime/"))
            .forEach((pkg) => (uses[pkg] = pkg));
    }
    for await (const pkgOldVersion of Object.keys(uses)) {
        const pkgName = pkgOldVersion.split("@")[0];
        const releases = await octokit.repos.listReleases({
            owner: pkgName.split("/")[0],
            repo: pkgName.split("/")[1],
            per_page: 1,
        });
        uses[pkgOldVersion] = `${pkgName}@${releases.data[0].tag_name}`;
    }
    for await (const pkgOldVersion of Object.keys(uses)) {
        const pkgName = pkgOldVersion.split("@")[0];
        for await (const workflow of workflows) {
            let contents = await fs_extra_1.readFile(path_1.join(".", ".github", "workflows", workflow), "utf8");
            contents.replace(pkgOldVersion, uses[pkgOldVersion]);
            await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", workflow), contents);
        }
        git_1.commit(`:up_arrow: Bump ${pkgName} from ${pkgOldVersion.split("@")[1]} to ${uses[pkgOldVersion].split("@")[0]}\n\nBumps [${pkgName}](https://github.com/${pkgName}) from ${pkgOldVersion.split("@")[1]} to ${uses[pkgOldVersion].split("@")[0]}.\n- [Release notes](https://github.com/${pkgName}/releases)\n- [Commits](semantic-release/semantic-release@${pkgOldVersion.split("@")[1]}...${uses[pkgOldVersion].split("@")[0]})`, (config.commitMessages || {}).commitAuthorName, (config.commitMessages || {}).commitAuthorEmail);
    }
    git_1.push();
};
exports.updateDependencies = updateDependencies;
//# sourceMappingURL=dependencies.js.map