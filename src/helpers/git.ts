import { spawnSync } from "child_process";

const runGit = (args: string[], throwOnError = false) => {
  const result = spawnSync("git", args, { encoding: "utf8" });
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const output = `${stdout}${stderr}`;

  if (throwOnError && result.status !== 0) {
    throw new Error(output || `git ${args.join(" ")} failed with exit code ${result.status}`);
  }

  return output;
};

export const commit = (
  message: string,
  name = "Upptime Bot",
  email = "73812536+upptime-bot@users.noreply.github.com",
  signoff = false
) => {
  runGit(["config", "--global", "user.email", email]);
  runGit(["config", "--global", "user.name", name]);
  runGit(["add", "."]);
  runGit(["commit", ...(signoff ? ["--signoff"] : []), "-m", message]);
};

export const push = () => {
  runGit(["push"], true);
};

export const lastCommit = () => {
  return runGit(["log", "--format=%H", "-n", "1"]);
};
