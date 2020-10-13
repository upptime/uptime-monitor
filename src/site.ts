import { cd, cp, exec, mkdir } from "shelljs";

export const generateSite = async () => {
  const siteDir = "site";
  mkdir(siteDir);
  cd(siteDir);
  exec("npm init -y");
  exec("npm i @upptime/status-page");
  cp("-r", "node_modules/@upptime/status-page", ".");
  cd("status-page");
  exec("npm i");
  exec("npm run export");
  cd("../..");
};
