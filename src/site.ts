import { cd, cp, exec, mkdir, mv } from "shelljs";

export const generateSite = async () => {
  const siteDir = "site";
  mkdir(siteDir);
  cd(siteDir);
  exec("npm init -y");
  exec("npm i @upptime/status-page");
  cp("-r", "node_modules/@upptime/status-page/*", ".");
  exec("npm i");
  exec("npm run export");
  mkdir("status-page");
  mv("__sapper__/export", "status-page/__sapper__/");
  cd("../..");
};
