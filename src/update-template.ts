import slugify from "@sindresorhus/slugify";
import { execSync } from "child_process";
import { copy, readdir, remove } from "fs-extra";
import { join } from "path";
import { getConfig } from "./helpers/config";
import { commit, push } from "./helpers/git";

export const updateTemplate = async () => {
  // Remove the .github/workflows directory completely
  await remove(join(".", ".github", "workflows"));
  console.log("Removed legacy .github/workflows");

  // Clone and copy workflows from template
  execSync("git clone https://github.com/upptime/upptime __upptime");
  await copy(join(".", "__upptime", ".github", "workflows"), join(".", ".github", "workflows"));
  await remove(join(".", "__upptime"));
  console.log("Added new .github/workflows");

  // Delete these specific template files
  const delteFiles = ["README.pt-br.md", ".templaterc.json"];
  for await (const file of delteFiles)
    try {
      await remove(join(".", file));
    } catch (error) {}
  console.log("Removed template files");

  const config = await getConfig();
  const slugs = config.sites.map((site) => site.slug || slugify(site.name));
  const filesToKeep = ["LICENSE"];

  // Remove old data from ./api
  const apiData = await readdir(join(".", "api"));
  for await (const file of apiData)
    if (!filesToKeep.includes(file) && !slugs.includes(file)) await remove(join(".", "api", file));
  console.log("Removed old data from api");

  // Remove old data from ./graphs
  const graphsData = await readdir(join(".", "graphs"));
  for await (const file of graphsData)
    if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".png", "")))
      await remove(join(".", "graphs", file));
  console.log("Removed old data from graphs");

  // Remove old data from ./history
  const historyData = await readdir(join(".", "history"));
  for await (const file of historyData)
    if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".yml", "")))
      await remove(join(".", "history", file));
  console.log("Removed old data from history");

  commit(":arrow_up: Update @upptime to latest");
  push();
  console.log("All done!");
};
