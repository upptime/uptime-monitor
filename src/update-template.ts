import slugify from "@sindresorhus/slugify";
import { ensureDir, readdir, remove, writeFile } from "fs-extra";
import { join } from "path";
import { getConfig } from "./helpers/config";
import { commit, push } from "./helpers/git";
import { getOwnerRepo } from "./helpers/secrets";
import {
  graphsCiWorkflow,
  responseTimeCiWorkflow,
  setupCiWorkflow,
  siteCiWorkflow,
  summaryCiWorkflow,
  updatesCiWorkflow,
  updateTemplateCiWorkflow,
  uptimeCiWorkflow,
  getUptimeMonitorVersion,
} from "./helpers/workflows";

export const updateTemplate = async () => {
  const [owner, repo] = getOwnerRepo();
  const config = await getConfig();

  // Remove our workflows (not all workflows)
  await remove(join(".", ".github", "workflows", "graphs.yml"));
  await remove(join(".", ".github", "workflows", "response-time.yml"));
  await remove(join(".", ".github", "workflows", "setup.yml"));
  await remove(join(".", ".github", "workflows", "site.yml"));
  await remove(join(".", ".github", "workflows", "summary.yml"));
  await remove(join(".", ".github", "workflows", "update-template.yml"));
  await remove(join(".", ".github", "workflows", "updates.yml"));
  await remove(join(".", ".github", "workflows", "uptime.yml"));
  console.log("Removed legacy .github/workflows");

  // Clone and create workflows from this repo
  await ensureDir(join(".", ".github", "workflows"));
  await writeFile(join(".", ".github", "workflows", "graphs.yml"), await graphsCiWorkflow());
  await writeFile(
    join(".", ".github", "workflows", "response-time.yml"),
    await responseTimeCiWorkflow()
  );
  await writeFile(join(".", ".github", "workflows", "setup.yml"), await setupCiWorkflow());
  await writeFile(join(".", ".github", "workflows", "site.yml"), await siteCiWorkflow());
  await writeFile(join(".", ".github", "workflows", "summary.yml"), await summaryCiWorkflow());
  await writeFile(
    join(".", ".github", "workflows", "update-template.yml"),
    await updateTemplateCiWorkflow()
  );
  await writeFile(join(".", ".github", "workflows", "updates.yml"), await updatesCiWorkflow());
  await writeFile(join(".", ".github", "workflows", "uptime.yml"), await uptimeCiWorkflow());
  console.log("Added new .github/workflows");

  // Delete these specific template files
  const delteFiles = ["README.pt-br.md", ".templaterc.json"];
  for await (const file of delteFiles)
    try {
      if (`${owner}/${repo}` !== "upptime/upptime") await remove(join(".", file));
    } catch (error) {}
  console.log("Removed template files");

  const slugs = config.sites.map((site) => site.slug || slugify(site.name));
  const filesToKeep = ["LICENSE", "summary.json"];

  // Remove old data from ./api
  try {
    const apiData = await readdir(join(".", "api"));
    for await (const file of apiData)
      if (!filesToKeep.includes(file) && !slugs.includes(file))
        await remove(join(".", "api", file));
    console.log("Removed old data from api");
  } catch (error) {
    console.log(error);
  }

  // Remove old data from ./graphs
  try {
    const graphsData = await readdir(join(".", "graphs"));
    for await (const file of graphsData)
      if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".png", "")))
        await remove(join(".", "graphs", file));
    console.log("Removed old data from graphs");
  } catch (error) {
    console.log(error);
  }

  // Remove old data from ./history
  try {
    const historyData = await readdir(join(".", "history"));
    for await (const file of historyData)
      if (!filesToKeep.includes(file) && !slugs.includes(file.replace(".yml", "")))
        await remove(join(".", "history", file));
    console.log("Removed old data from history");
  } catch (error) {
    console.log(error);
  }

  commit(`:arrow_up: Update @upptime to ${await getUptimeMonitorVersion()}`);
  push();
  console.log("All done!");
};
