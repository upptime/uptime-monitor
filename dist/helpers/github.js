"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOctokit = exports.retryTransientGitHubRequest = void 0;
const rest_1 = require("@octokit/rest");
const config_1 = require("./config");
const secrets_1 = require("./secrets");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getGitHubErrorStatus = (error) => {
    if (typeof error !== "object" || error === null)
        return undefined;
    const status = error.status;
    if (typeof status === "number")
        return status;
    const responseStatus = error.response?.status;
    return typeof responseStatus === "number" ? responseStatus : undefined;
};
const retryTransientGitHubRequest = async (request, options = {}) => {
    const maxAttempts = options.maxAttempts ?? 3;
    const initialDelayMs = options.initialDelayMs ?? 1000;
    const waitForRetry = options.wait ?? wait;
    const log = options.log ?? console.warn;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await request();
        }
        catch (error) {
            const status = getGitHubErrorStatus(error);
            const isTransient = status !== undefined && status >= 500 && status <= 599;
            if (!isTransient || attempt === maxAttempts)
                throw error;
            const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
            log(`GitHub API request failed with HTTP ${status}; retrying in ${delayMs}ms`);
            await waitForRetry(delayMs);
        }
    }
    throw new Error("GitHub API retry attempts exhausted");
};
exports.retryTransientGitHubRequest = retryTransientGitHubRequest;
const getOctokit = async () => {
    const config = await (0, config_1.getConfig)();
    return new rest_1.Octokit({
        auth: config.PAT || (0, secrets_1.getSecret)("GH_PAT") || (0, secrets_1.getSecret)("GITHUB_TOKEN"),
        userAgent: config["user-agent"] || (0, secrets_1.getSecret)("USER_AGENT") || "upptime",
    });
};
exports.getOctokit = getOctokit;
//# sourceMappingURL=github.js.map