"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastCommit = exports.push = exports.commit = void 0;
const child_process_1 = require("child_process");
const runGit = (args, throwOnError = false) => {
    const result = (0, child_process_1.spawnSync)("git", args, { encoding: "utf8" });
    const stdout = result.stdout || "";
    const stderr = result.stderr || "";
    const output = `${stdout}${stderr}`;
    if (throwOnError && result.status !== 0) {
        throw new Error(output || `git ${args.join(" ")} failed with exit code ${result.status}`);
    }
    return output;
};
const commit = (message, name = "Upptime Bot", email = "73812536+upptime-bot@users.noreply.github.com") => {
    runGit(["config", "--global", "user.email", email]);
    runGit(["config", "--global", "user.name", name]);
    runGit(["add", "."]);
    runGit(["commit", "-m", message]);
};
exports.commit = commit;
const push = () => {
    runGit(["push"], true);
};
exports.push = push;
const lastCommit = () => {
    return runGit(["log", "--format=%H", "-n", "1"]);
};
exports.lastCommit = lastCommit;
//# sourceMappingURL=git.js.map