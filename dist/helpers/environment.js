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
    str = substituteRandomNumbers(str);
    str = substituteDynamicAlphanumericString(str);
    return str;
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
const substituteDynamicAlphanumericString = (str) => {
    if (str.includes(constants_1.DYNAMIC_ALPHANUMERIC_STRING)) {
        const length = parseInt(process.env.DYNAMIC_STRING_LENGTH || constants_1.DYNAMIC_STRING_LENGTH_DEFAULT);
        str = str.replaceAll(constants_1.DYNAMIC_ALPHANUMERIC_STRING, () => getRandomAlphanumericString(length));
    }
    return str;
};
/** Return a random integer N such that min <= N <= max */
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
/** Return a random alphanumeric string of given length */
const getRandomAlphanumericString = (length) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
};
//# sourceMappingURL=environment.js.map