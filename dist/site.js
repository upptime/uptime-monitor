"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSite = void 0;
const shelljs_1 = require("shelljs");
exports.generateSite = async () => {
    const siteDir = "site";
    shelljs_1.mkdir(siteDir);
    shelljs_1.cd(siteDir);
    shelljs_1.exec("npm init -y");
    shelljs_1.exec("npm i @upptime/status-page");
    shelljs_1.cp("-r", "node_modules/@upptime/status-page/*", ".");
    shelljs_1.exec("npm i");
    shelljs_1.exec("npm run export");
    shelljs_1.mkdir("status-page");
    shelljs_1.mv("__sapper__/export", "status-page/__sapper__/");
    shelljs_1.cd("../..");
};
