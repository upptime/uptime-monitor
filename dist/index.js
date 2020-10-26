"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core_1 = require("@actions/core");
const site_1 = require("./site");
const summary_1 = require("./summary");
const update_1 = require("./update");
const token = core_1.getInput("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;
exports.run = async () => {
    if (!token)
        throw new Error("GitHub token not found");
    core_1.debug("Starting Upptime");
    switch (core_1.getInput("command")) {
        case "summary":
            core_1.debug("Starting summary");
        case "readme":
            core_1.debug("Starting readme");
            return summary_1.generateSummary();
        case "site":
            core_1.debug("Starting site");
            return site_1.generateSite();
        case "response-time":
            core_1.debug("Starting response-time");
            return update_1.update(true);
        default:
            core_1.debug("Starting update");
            return update_1.update();
    }
};
exports.run()
    .then(() => { })
    .catch((error) => {
    console.error("ERROR", error);
    core_1.setFailed(error.message);
});
