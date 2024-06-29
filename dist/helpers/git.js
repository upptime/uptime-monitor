"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastCommit = exports.push = exports.commit = void 0;
const shelljs_1 = require("shelljs");
const commit = (message, name = "Upptime Bot", email = "73812536+upptime-bot@users.noreply.github.com") => {
    (0, shelljs_1.exec)(`git config --global user.email "${email}"`);
    (0, shelljs_1.exec)(`git config --global user.name "${name}"`);
    (0, shelljs_1.exec)(`git add .`);
    (0, shelljs_1.exec)(`git commit -m "${message.replace(/\"/g, "''")}"`);
};
exports.commit = commit;
const push = () => {
    const result = (0, shelljs_1.exec)("git push");
    if (result.includes("error:"))
        throw new Error(result);
};
exports.push = push;
const lastCommit = () => {
    return (0, shelljs_1.exec)(`git log --format="%H" -n 1`).stdout;
};
exports.lastCommit = lastCommit;
//# sourceMappingURL=git.js.map