import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { commit } from "./git";

const git = (args: string[], cwd: string) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const createRepo = () => {
  const cwd = mkdtempSync(join(tmpdir(), "upptime-git-test-"));
  git(["init"], cwd);
  execFileSync(
    "git",
    [
      "-c",
      "user.email=initial@example.com",
      "-c",
      "user.name=Initial User",
      "commit",
      "--allow-empty",
      "-m",
      "Initial commit",
    ],
    { cwd }
  );
  return cwd;
};

describe("git helper", () => {
  const originalCwd = process.cwd();

  afterEach(() => {
    process.chdir(originalCwd);
    delete process.env.UPPTIME_GIT_PWNED;
    delete process.env.UPPTIME_TOKEN_VALUE;
  });

  it("treats commit author name as data, not shell syntax", () => {
    const cwd = createRepo();
    process.chdir(cwd);
    writeFileSync(join(cwd, "status.yml"), "status: up\n");

    commit("Safe update", `Bot"; touch ${join(cwd, "pwned")}; #`, "bot@example.com");

    expect(existsSync(join(cwd, "pwned"))).toBe(false);
    expect(git(["log", "-1", "--format=%an"], cwd)).toBe(`Bot"; touch ${join(cwd, "pwned")}; #`);
  });

  it("does not let the shell expand variables in commit messages", () => {
    const cwd = createRepo();
    process.chdir(cwd);
    process.env.UPPTIME_TOKEN_VALUE = "expanded-value-123";
    writeFileSync(join(cwd, "status.yml"), "status: down\n");

    commit("Endpoint $UPPTIME_TOKEN_VALUE is down");

    expect(git(["log", "-1", "--format=%B"], cwd)).toBe("Endpoint $UPPTIME_TOKEN_VALUE is down");
    expect(readFileSync(join(cwd, ".git", "COMMIT_EDITMSG"), "utf8")).not.toContain("expanded-value-123");
  });
});
