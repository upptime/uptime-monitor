"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDiscordMsg = exports.checkMaybeSendDiscordMsg = void 0;
const secrets_1 = require("../../secrets");
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Check if a discord message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendDiscordMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_DISCORD_WEBHOOK_URL")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendDiscordMsg = checkMaybeSendDiscordMsg;
async function sendDiscordMsg(defaultMessage, config) {
    const { url, message } = config ?? {};
    core.info("Sending discord message");
    core.debug(`URL: ${url}`);
    core.debug(`Message: ${message}`);
    const urlToSend = url || (0, secrets_1.getSecret)("NOTIFICATION_DISCORD_WEBHOOK_URL");
    const messageToSend = message || defaultMessage;
    try {
        await axios_1.default.post(urlToSend, {
            content: messageToSend,
        });
        core.info("Success Discord");
    }
    catch (error) {
        core.error(error);
    }
    core.info("Finished sending Discord");
}
exports.sendDiscordMsg = sendDiscordMsg;
//# sourceMappingURL=discord.js.map