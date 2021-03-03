"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOctokit = void 0;
const rest_1 = require("@octokit/rest");
const config_1 = require("./config");
const getOctokit = async () => {
    const config = await config_1.getConfig();
    return new rest_1.Octokit({
        auth: config.PAT || process.env.GITHUB_TOKEN,
        userAgent: config["user-agent"] || process.env.USER_AGENT || "KojBot",
    });
};
exports.getOctokit = getOctokit;
//# sourceMappingURL=github.js.map