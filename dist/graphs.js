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
    if (!(await init_check_1.shouldContinue()))
        return;
    await fs_extra_1.mkdirp("graphs");
    await fs_extra_1.mkdirp("api");
    const config = js_yaml_1.load(await fs_extra_1.readFile(path_1.join(".", ".upptimerc.yml"), "utf8"));
    shelljs_1.exec("npx @upptime/graphs");
    shelljs_1.exec("npx imagemin-cli graphs/* --out-dir=graphs");
    try {
        await fs_extra_1.remove(path_1.join(".", "graphs", "response-time.png"));
        await fs_extra_1.remove(path_1.join(".", "graphs", "response-time-day.png"));
        await fs_extra_1.remove(path_1.join(".", "graphs", "response-time-week.png"));
        await fs_extra_1.remove(path_1.join(".", "graphs", "response-time-month.png"));
        await fs_extra_1.remove(path_1.join(".", "graphs", "response-time-year.png"));
    }
    catch (error) { }
    await temp_1.tempFixes();
    git_1.commit((config.commitMessages || {}).graphsUpdate || ":bento: Update graphs [skip ci]", (config.commitMessages || {}).commitAuthorName, (config.commitMessages || {}).commitAuthorEmail);
    git_1.push();
};
exports.generateGraphs = generateGraphs;
//# sourceMappingURL=graphs.js.map