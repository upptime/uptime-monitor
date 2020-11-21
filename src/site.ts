import { cd, cp, exec, mkdir } from "shelljs";
import { shouldContinue } from "./init-check";

export const generateSite = async () => {
  if (!(await shouldContinue())) return;
  const siteDir = "site";
  mkdir(siteDir);
  cd(siteDir);
  exec("npm init -y");
  exec("npm i @upptime/status-page");
  cp("-r", "node_modules/@upptime/status-page/*", ".");
  exec("npm i");
  exec("npm run export");
  mkdir("-p", "status-page/__sapper__/export");
  cp("-r", "__sapper__/export/*", "status-page/__sapper__/export");
  cd("../..");
};
