"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempFixes = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
exports.tempFixes = async () => {
    console.log("[warn] Applying temporary fixes");
    console.log("[warn] Changing Node.js version in CI");
    const workflows = await fs_extra_1.readdir(path_1.join(".", ".github", "workflows"));
    for await (const file of workflows) {
        if (file.endsWith(".yml")) {
            const contents = await fs_extra_1.readFile(path_1.join(".", ".github", "workflows", file), "utf8");
            await fs_extra_1.writeFile(path_1.join(".", ".github", "workflows", file), contents.replace("actions/setup-node@v2.1.2", "actions/setup-node@v1.4.4"));
        }
    }
};
