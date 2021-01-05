import { mkdirp, readFile, remove } from "fs-extra";
import { load } from "js-yaml";
import { join } from "path";
import { exec } from "shelljs";
import { commit, push } from "./helpers/git";
import { shouldContinue } from "./helpers/init-check";
import { UpptimeConfig } from "./interfaces";
import { tempFixes } from "./helpers/temp";

export const generateGraphs = async () => {
  if (!(await shouldContinue())) return;
  await mkdirp("graphs");
  await mkdirp("api");
  const config = load(await readFile(join(".", ".upptimerc.yml"), "utf8")) as UpptimeConfig;
  exec("npx @upptime/graphs");
  exec("npx imagemin-cli graphs/* --out-dir=graphs");
  try {
    await remove(join(".", "graphs", "response-time.png"));
    await remove(join(".", "graphs", "response-time-day.png"));
    await remove(join(".", "graphs", "response-time-week.png"));
    await remove(join(".", "graphs", "response-time-month.png"));
    await remove(join(".", "graphs", "response-time-year.png"));
  } catch (error) {}
  await tempFixes();
  commit(
    (config.commitMessages || {}).graphsUpdate || ":bento: Update graphs [skip ci]",
    (config.commitMessages || {}).commitAuthorName,
    (config.commitMessages || {}).commitAuthorEmail
  );
  push();
};
