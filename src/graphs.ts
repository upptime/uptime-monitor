import { readFile } from "fs-extra";
import { safeLoad } from "js-yaml";
import { join } from "path";
import { exec } from "shelljs";
import { commit, push } from "./git";
import { UpptimeConfig } from "./interfaces";
import { tempFixes } from "./temp";

export const generateGraphs = async () => {
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
