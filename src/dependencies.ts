import { ensureDir, readdir, readFile, writeFile } from "fs-extra";
import { join } from "path";
import { getConfig } from "./helpers/config";
import { commit, push } from "./helpers/git";
import { getOctokit } from "./helpers/github";
import { getOwnerRepo } from "./helpers/secrets";

const getLatestPackageVersion = async (
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  pkgName: string,
  currentVersion?: string
) => {
  const [owner, repo] = pkgName.split("/");

  try {
    const releases = await octokit.repos.listReleases({
      owner,
      repo,
      per_page: 1,
    });
    const latestRelease = releases.data[0]?.tag_name;
    if (latestRelease) return latestRelease;
  } catch (_) {
    // Fall through to tags when GitHub release lookup is temporarily unavailable.
  }

  try {
    const tags = await octokit.repos.listTags({
      owner,
      repo,
      per_page: 1,
    });
    const latestTag = tags.data[0]?.name;
    if (latestTag) return latestTag;
  } catch (_) {
    // Keep the current version rather than crashing the updater on API failures.
  }

  return currentVersion;
};

export const updateDependencies = async () => {
  const [owner, repo] = getOwnerRepo();
  if (`${owner}/${repo}` !== "upptime/upptime") return;

  const config = await getConfig();
  const commitMessages = config.commitMessages || {};
  const octokit = await getOctokit();

  let changes = 0;

  await ensureDir(join(".", ".github", "workflows"));
  const workflows = (await readdir(join(".", ".github", "workflows"))).filter(
    (file) => file.endsWith(".yml") || file.endsWith(".yaml")
  );

  const uses: Record<string, string> = {};
  for await (const workflow of workflows) {
    const contents = await readFile(join(".", ".github", "workflows", workflow), "utf8");
    contents
      .split("\n")
      .filter((line) => line.includes("uses:"))
      .map((line) => line.split("uses:")[1].trim())
      .filter((pkg) => pkg.startsWith("upptime/"))
      .forEach((pkg) => (uses[pkg] = pkg));
  }
  for await (const pkgOldVersion of Object.keys(uses)) {
    const [pkgName, currentVersion] = pkgOldVersion.split("@");
    const latestVersion = await getLatestPackageVersion(octokit, pkgName, currentVersion);
    uses[pkgOldVersion] = latestVersion ? `${pkgName}@${latestVersion}` : pkgName;
  }
  for await (const pkgOldVersion of Object.keys(uses)) {
    const pkgName = pkgOldVersion.split("@")[0];
    for await (const workflow of workflows) {
      let contents = await readFile(join(".", ".github", "workflows", workflow), "utf8");
      contents = contents.replace(pkgOldVersion, uses[pkgOldVersion]);
      await writeFile(join(".", ".github", "workflows", workflow), contents);
    }
    if (pkgOldVersion.split("@")[1] !== uses[pkgOldVersion].split("@")[1]) changes++;
    commit(
      `:arrow_up: Bump ${pkgName} from ${pkgOldVersion.split("@")[1]} to ${
        uses[pkgOldVersion].split("@")[1]
      }\n\nBumps [${pkgName}](https://github.com/${pkgName}) from ${
        pkgOldVersion.split("@")[1]
      } to ${
        uses[pkgOldVersion].split("@")[1]
      }.\n- [Release notes](https://github.com/${pkgName}/releases)\n- [Commits](https://github.com/${pkgName}@${
        pkgOldVersion.split("@")[1]
      }...${
        uses[pkgOldVersion].split("@")[1]
      })${commitMessages.signoff ? "" : "\n\nSigned-off-by: Anand Chowdhary <github@anandchowdhary.com>"}`,
      commitMessages.commitAuthorName,
      commitMessages.commitAuthorEmail,
      commitMessages.signoff
    );
  }
  push();

  if (changes) {
    const contents = await octokit.repos.getContent({ owner, repo, path: "README.md" });
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "README.md",
      content: (contents.data as any).content,
      sha: (contents.data as any).sha,
      message: ":package: Release dependency updates",
    });
  }
};
