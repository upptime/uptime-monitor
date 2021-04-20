"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceEnvironmentVariables = void 0;
const replaceEnvironmentVariables = (str) => {
    Object.keys(process.env).forEach((key) => {
        str = str.replace(`$${key}`, process.env[key] || `$${key}`);
    });
    const SECRETS_CONTEXT = process.env.SECRETS_CONTEXT || "{}";
    const allSecrets = JSON.parse(SECRETS_CONTEXT);
    const secrets = { ...JSON.parse(JSON.stringify(process.env)), allSecrets };
    Object.keys(secrets).forEach((key) => {
        str = str.replace(`$${key}`, secrets[key] || `$${key}`);
    });
    return str;
};
exports.replaceEnvironmentVariables = replaceEnvironmentVariables;
//# sourceMappingURL=environment.js.map