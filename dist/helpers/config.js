"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const fs_extra_1 = require("fs-extra");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
let __config = undefined;
const getConfig = async () => {
    if (__config)
        return __config;
    const config = (0, js_yaml_1.load)(await (0, fs_extra_1.readFile)((0, path_1.join)(".", ".upptimerc.yml"), "utf8"));
    __config = config;
    return config;
};
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map