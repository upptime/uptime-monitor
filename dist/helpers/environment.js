"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceEnvironmentVariables = void 0;
const replaceEnvironmentVariables = (str) => {
    Object.keys(process.env).forEach((key) => {
        str = str.replace(`$${key}`, process.env[key] || `$${key}`);
    });
    return str;
};
exports.replaceEnvironmentVariables = replaceEnvironmentVariables;
//# sourceMappingURL=environment.js.map