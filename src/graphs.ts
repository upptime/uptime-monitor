import { mkdirp, readFile } from "fs-extra";
import { safeLoad } from "js-yaml";
import { join } from "path";
import { exec } from "shelljs";
import { commit, push } from "./git";
import { shouldContinue } from "./init-check";
import { UpptimeConfig } from "./interfaces";
import { tempFixes } from "./temp";

export const generateGraphs = async () => {
  if (!(await shouldContinue())) return;
  await mkdirp("graphs");
  await mkdirp("api");
  const config = safeLoad(await readFile(join(".", ".upptimerc.yml"), "utf8")) as UpptimeConfig;
  exec("npx @upptime/graphs");
  exec("npx imagemin-cli graphs/* --out-dir=graphs");
  await tempFixes();
  commit(
    (config.commitMessages || {}).graphsUpdate || ":bento: Update graphs [skip ci]",
    (config.commitMessages || {}).commitAuthorName,
    (config.commitMessages || {}).commitAuthorEmail
  );
  push();
};
