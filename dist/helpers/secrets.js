"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerRepo = exports.getSecret = void 0;
/** Get a secret from the context or an environment variable */
const getSecret = (key) => {
    const SECRETS_CONTEXT = process.env.SECRETS_CONTEXT || "{}";
    const allSecrets = JSON.parse(SECRETS_CONTEXT);
    if (allSecrets[key])
        return allSecrets[key];
    return process.env[key];
};
exports.getSecret = getSecret;
/** Get the GitHub repo */
const getOwnerRepo = () => {
    const result = (exports.getSecret("GITHUB_REPOSITORY") || "").split("/");
    if (result.length !== 2)
        throw new Error("Unable to find GitHub repo");
    return result;
};
exports.getOwnerRepo = getOwnerRepo;
//# sourceMappingURL=secrets.js.map