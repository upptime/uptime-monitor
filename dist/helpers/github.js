"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOctokit = void 0;
const rest_1 = require("@octokit/rest");
const config_1 = require("./config");
const secrets_1 = require("./secrets");
const getOctokit = async () => {
    const config = await (0, config_1.getConfig)();
    return new rest_1.Octokit({
        auth: config.PAT || (0, secrets_1.getSecret)("GH_PAT") || (0, secrets_1.getSecret)("GITHUB_TOKEN"),
        userAgent: config["user-agent"] || (0, secrets_1.getSecret)("USER_AGENT") || "upptime",
    });
};
exports.getOctokit = getOctokit;
//# sourceMappingURL=github.js.map