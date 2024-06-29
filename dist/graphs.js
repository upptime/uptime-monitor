"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGraphs = void 0;
const fs_extra_1 = require("fs-extra");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const shelljs_1 = require("shelljs");
const git_1 = require("./helpers/git");
const init_check_1 = require("./helpers/init-check");
const temp_1 = require("./helpers/temp");
const generateGraphs = async () => {
    if (!(await (0, init_check_1.shouldContinue)()))
        return;
    await (0, fs_extra_1.mkdirp)("graphs");
    await (0, fs_extra_1.mkdirp)("api");
    const config = (0, js_yaml_1.load)(await (0, fs_extra_1.readFile)((0, path_1.join)(".", ".upptimerc.yml"), "utf8"));
    (0, shelljs_1.exec)("npx @upptime/graphs");
    (0, shelljs_1.exec)("npx imagemin-cli graphs/* --out-dir=graphs");
    try {
        await (0, fs_extra_1.remove)((0, path_1.join)(".", "graphs", "response-time.png"));
        await (0, fs_extra_1.remove)((0, path_1.join)(".", "graphs", "response-time-day.png"));
        await (0, fs_extra_1.remove)((0, path_1.join)(".", "graphs", "response-time-week.png"));
        await (0, fs_extra_1.remove)((0, path_1.join)(".", "graphs", "response-time-month.png"));
        await (0, fs_extra_1.remove)((0, path_1.join)(".", "graphs", "response-time-year.png"));
    }
    catch (error) { }
    await (0, temp_1.tempFixes)();
    (0, git_1.commit)((config.commitMessages || {}).graphsUpdate || ":bento: Update graphs [skip ci]", (config.commitMessages || {}).commitAuthorName, (config.commitMessages || {}).commitAuthorEmail);
    (0, git_1.push)();
};
exports.generateGraphs = generateGraphs;
//# sourceMappingURL=graphs.js.map