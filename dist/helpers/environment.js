"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceEnvironmentVariables = void 0;
const constants_1 = require("./constants");
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
    return substituteRandomNumbers(str);
};
exports.replaceEnvironmentVariables = replaceEnvironmentVariables;
const substituteRandomNumbers = (str) => {
    if (str.includes(constants_1.DYNAMIC_RANDOM_NUMBER)) {
        const min = parseInt(process.env.RANDOM_MIN || constants_1.RANDOM_MIN_DEFAULT);
        const max = parseInt(process.env.RANDOM_MAX || constants_1.RANDOM_MAX_DEFAULT);
        str = str.replaceAll(constants_1.DYNAMIC_RANDOM_NUMBER, () => getRandomNumber(min, max).toString());
    }
    return str;
};
/** Return a random integer N such that min <= N <= max */
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
//# sourceMappingURL=environment.js.map