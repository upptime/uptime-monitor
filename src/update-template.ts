import slugify from "@sindresorhus/slugify";
import { execSync } from "child_process";
import { copy, readdir, readFile, remove, writeFile } from "fs-extra";
import { join } from "path";
import { getConfig } from "./helpers/config";
import {
  GRAPHS_CI_SCHEDULE,
  RESPONSE_TIME_CI_SCHEDULE,
  STATIC_SITE_CI_SCHEDULE,
  SUMMARY_CI_SCHEDULE,
  UPDATE_TEMPLATE_CI_SCHEDULE,
  UPDATES_CI_SCHEDULE,
  UPTIME_CI_SCHEDULE,
} from "./helpers/constants";
import { commit, push } from "./helpers/git";
import { getOctokit } from "./helpers/github";

export const updateTemplate = async () => {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  const octokit = await getOctokit();
  const config = await getConfig();

  // Remove the .github/workflows directory completely
  await remove(join(".", ".github", "workflows"));
  console.log("Removed legacy .github/workflows");

  // Get most recent release
  const releases = await octokit.repos.listReleases({
    owner: "upptime",
    repo: "uptime-monitor",
    per_page: 1,
  });
  const latestRelease = releases.data[0].tag_name;
  console.log("Got @upptime/uptime-monitor release", latestRelease);

  // Clone and copy workflows from this repo
  execSync("git clone https://github.com/upptime/uptime-monitor __upptime");
  await copy(join(".", "__upptime", "src", "workflows"), join(".", ".github", "workflows"));
  await remove(join(".", "__upptime"));
  const workflowFiles = await readdir(join(".", ".github", "workflows"));
  const workflowSchedule = config.workflowSchedule || {};
  for await (const file of workflowFiles) {
    const contents = await readFile(join(".", ".github", "workflows", file), "utf8");
    await writeFile(
      join(".", ".github", "workflows", file),
      contents
        .replace(new RegExp("UPTIME_MONITOR_VERSION", "g"), latestRelease)
        .replace(new RegExp("CURRENT_DATE", "g"), new Date().toISOString())
        .replace(
          new RegExp("GRAPHS_CI_SCHEDULE", "g"),
          workflowSchedule.graphs || GRAPHS_CI_SCHEDULE
        )
        .replace(
          new RegExp("RESPONSE_TIME_CI_SCHEDULE", "g"),
          workflowSchedule.responseTime || RESPONSE_TIME_CI_SCHEDULE
        )
        .replace(
          new RegExp("STATIC_SITE_CI_SCHEDULE", "g"),
          workflowSchedule.staticSite || STATIC_SITE_CI_SCHEDULE
        )
        .replace(
          new RegExp("SUMMARY_CI_SCHEDULE", "g"),
          workflowSchedule.summary || SUMMARY_CI_SCHEDULE
        )
        .replace(
          new RegExp("UPDATE_TEMPLATE_CI_SCHEDULE", "g"),
          workflowSchedule.updateTemplate || UPDATE_TEMPLATE_CI_SCHEDULE
        )
        .replace(
          new RegExp("UPDATES_CI_SCHEDULE", "g"),
          workflowSchedule.updates || UPDATES_CI_SCHEDULE
        )
        .replace(
          new RegExp("UPTIME_CI_SCHEDULE", "g"),
          workflowSchedule.uptime || UPTIME_CI_SCHEDULE
        )
    );
  }
  console.log("Added new .github/workflows");

  // Delete these specific template files
  const delteFiles = ["README.pt-br.md", ".templaterc.json"];
  for await (const file of delteFiles)
    try {
      if (`${owner}/${repo}` !== "upptime/upptime") await remove(join(".", file));
    } catch (error) {}
  console.log("Removed template files");

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
