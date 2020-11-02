"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGraphs = void 0;
const fs_extra_1 = require("fs-extra");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const shelljs_1 = require("shelljs");
const git_1 = require("./git");
exports.generateGraphs = async () => {
    const config = js_yaml_1.safeLoad(await fs_extra_1.readFile(path_1.join(".", ".upptimerc.yml"), "utf8"));
    shelljs_1.exec("npx @upptime/graphs");
    shelljs_1.exec("npx imagemin-cli graphs/* --out-dir=graphs");
    git_1.commit((config.commitMessages || {}).graphsUpdate || ":bento: Update graphs [skip ci] [upptime]", (config.commitMessages || {}).commitAuthorName, (config.commitMessages || {}).commitAuthorEmail);
    git_1.push();
};
