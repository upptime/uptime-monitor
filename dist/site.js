"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSite = void 0;
const shelljs_1 = require("shelljs");
const config_1 = require("./helpers/config");
const github_1 = require("./helpers/github");
const init_check_1 = require("./helpers/init-check");
const secrets_1 = require("./helpers/secrets");
const generateSite = async () => {
    if (!(await init_check_1.shouldContinue()))
        return;
    const [owner, repo] = secrets_1.getOwnerRepo();
    const config = await config_1.getConfig();
    if (config.skipGeneratingWebsite)
        return;
    const sitePackage = config.customStatusWebsitePackage || "@upptime/status-page";
    const octokit = await github_1.getOctokit();
    const repoDetails = await octokit.repos.get({ owner, repo });
    const siteDir = "site";
    /* Configure shelljs to fail on failure */
    var sh = require('shelljs');
    sh.config.fatal = true;
    shelljs_1.mkdir(siteDir);
    shelljs_1.cd(siteDir);
    /**
     * If this is a private repository, we don't publish a status page
     * by default, but can be overwritten with `publish: true`
     */
    if (repoDetails.data.private && !(config["status-website"] || {}).publish) {
        shelljs_1.mkdir("-p", "status-page/__sapper__/export");
        shelljs_1.exec("echo 404 > status-page/__sapper__/export/index.html");
        shelljs_1.cd("../..");
        return;
    }
    shelljs_1.exec("npm init -y");
    config.repo;
    shelljs_1.exec(`npm i ${sitePackage}`);
    shelljs_1.cp("-r", `node_modules/${sitePackage}/*`, ".");
    shelljs_1.exec("npm i");
    shelljs_1.exec("npm run export");
    shelljs_1.mkdir("-p", "status-page/__sapper__/export");
    shelljs_1.cp("-r", "__sapper__/export/*", "status-page/__sapper__/export");
    shelljs_1.cd("../..");
};
exports.generateSite = generateSite;
//# sourceMappingURL=site.js.map