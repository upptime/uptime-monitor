"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastCommit = exports.push = exports.commit = void 0;
const shelljs_1 = require("shelljs");
exports.commit = (message, name = "Upptime Bot", email = "73812536+upptime-bot@users.noreply.github.com") => {
    shelljs_1.exec(`git config --global user.email "${email}"`);
    shelljs_1.exec(`git config --global user.name "${name}"`);
    shelljs_1.exec(`git add .`);
    shelljs_1.exec(`git commit -m "${message.replace(/\"/g, "''")}"`);
};
exports.push = () => {
    shelljs_1.exec("git push");
};
exports.lastCommit = () => {
    return shelljs_1.exec(`git log --format="%H" -n 1`).stdout;
};
