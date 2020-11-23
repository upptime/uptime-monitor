import { readFile } from "fs-extra";
import { join } from "path";
import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
config();

const createAutomatedIssue = async () => {
  const octokit = new Octokit({
    auth: process.env.AUTOMATION_TOKEN,
  });
  const body = await readFile(join(".", "src", "issue-template.md"), "utf8");
  const owner = "AnandChowdhary";
  const repo = "status";
  try {
    await octokit.issues.create({
      owner,
      repo,
      title: "⚠️ Add `workflow` scope to your personal access token",
      body: body.replace("{{TEAM}}", owner),
      labels: ["bug", "upptime-automated"],
    });
    console.log("Created an issue in", owner, repo);
  } catch (error) {
    console.log("Got an error in creating this issue", error);
  }
};
createAutomatedIssue();
