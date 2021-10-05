import { cd, cp, exec, mkdir } from "shelljs";
import { getConfig } from "./helpers/config";
import { getOctokit } from "./helpers/github";
import { shouldContinue } from "./helpers/init-check";
import { getOwnerRepo } from "./helpers/secrets";

export const generateSite = async () => {
  if (!(await shouldContinue())) return;
  const [owner, repo] = getOwnerRepo();
  const config = await getConfig();
  if (config.skipGeneratingWebsite) return;
  const sitePackage = config.customStatusWebsitePackage || "@upptime/status-page";
  const octokit = await getOctokit();
  const repoDetails = await octokit.repos.get({ owner, repo });
  const siteDir = "site";
  
  /* Configure shelljs to fail on failure */
  var sh = require('shelljs');
  sh.config.fatal = true;
  
  mkdir(siteDir);
  cd(siteDir);
  /**
   * If this is a private repository, we don't publish a status page
   * by default, but can be overwritten with `publish: true`
   */
  if (repoDetails.data.private && !(config["status-website"] || {}).publish) {
    mkdir("-p", "status-page/__sapper__/export");
    exec("echo 404 > status-page/__sapper__/export/index.html");
    cd("../..");
    return;
  }
  exec("npm init -y");
  config.repo;
  exec(`npm i ${sitePackage}`);
  cp("-r", `node_modules/${sitePackage}/*`, ".");
  exec("npm i");
  exec("npm run export");
  mkdir("-p", "status-page/__sapper__/export");
  cp("-r", "__sapper__/export/*", "status-page/__sapper__/export");
  cd("../..");
};
