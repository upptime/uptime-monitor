"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const git_1 = require("./git");
const git = (args, cwd) => (0, child_process_1.execFileSync)("git", args, { cwd, encoding: "utf8" }).trim();
const createRepo = () => {
    const cwd = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), "upptime-git-test-"));
    git(["init"], cwd);
    (0, child_process_1.execFileSync)("git", [
        "-c",
        "user.email=initial@example.com",
        "-c",
        "user.name=Initial User",
        "commit",
        "--allow-empty",
        "-m",
        "Initial commit",
    ], { cwd });
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
        (0, fs_1.writeFileSync)((0, path_1.join)(cwd, "status.yml"), "status: up\n");
        (0, git_1.commit)("Safe update", `Bot"; touch ${(0, path_1.join)(cwd, "pwned")}; #`, "bot@example.com");
        expect((0, fs_1.existsSync)((0, path_1.join)(cwd, "pwned"))).toBe(false);
        expect(git(["log", "-1", "--format=%an"], cwd)).toBe(`Bot"; touch ${(0, path_1.join)(cwd, "pwned")}; #`);
    });
    it("does not let the shell expand variables in commit messages", () => {
        const cwd = createRepo();
        process.chdir(cwd);
        process.env.UPPTIME_TOKEN_VALUE = "expanded-value-123";
        (0, fs_1.writeFileSync)((0, path_1.join)(cwd, "status.yml"), "status: down\n");
        (0, git_1.commit)("Endpoint $UPPTIME_TOKEN_VALUE is down");
        expect(git(["log", "-1", "--format=%B"], cwd)).toBe("Endpoint $UPPTIME_TOKEN_VALUE is down");
        expect((0, fs_1.readFileSync)((0, path_1.join)(cwd, ".git", "COMMIT_EDITMSG"), "utf8")).not.toContain("expanded-value-123");
    });
    it("can add a DCO sign-off trailer using the configured git identity", () => {
        const cwd = createRepo();
        process.chdir(cwd);
        (0, fs_1.writeFileSync)((0, path_1.join)(cwd, "status.yml"), "status: signed\n");
        (0, git_1.commit)("Signed status update", "Upptime Bot", "bot@example.com", true);
        expect(git(["log", "-1", "--format=%B"], cwd)).toBe("Signed status update\n\nSigned-off-by: Upptime Bot <bot@example.com>");
    });
});
//# sourceMappingURL=git.spec.js.map