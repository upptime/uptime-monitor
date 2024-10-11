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
exports.sendMSTeamsMsg = exports.checkMaybeSendMSTeamsMsg = void 0;
const secrets_1 = require("../../secrets");
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Check if a ms teams message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendMSTeamsMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_TEAMS")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendMSTeamsMsg = checkMaybeSendMSTeamsMsg;
/**
 * Send a ms teams message
 *
 * @param message
 * @returns Promise<void>
 */
async function sendMSTeamsMsg(defaultMessage, config) {
    const { message, url, themeColor, summary } = config ?? {};
    core.info("Sending ms teams message");
    const urlToSend = url || (0, secrets_1.getSecret)("NOTIFICATION_TEAMS_WEBHOOK_URL");
    const messageToSend = message || defaultMessage;
    const themeColorToSend = themeColor || "0072C6";
    const summaryToSend = summary || defaultMessage;
    core.debug(`URL: ${urlToSend}`);
    core.debug(`Message: ${messageToSend}`);
    core.debug(`Theme Color: ${themeColorToSend}`);
    core.debug(`Summary: ${summaryToSend}`);
    try {
        await axios_1.default.post(urlToSend, {
            "@context": "https://schema.org/extensions",
            "@type": "MessageCard",
            themeColor: themeColorToSend,
            text: messageToSend,
            summary: summaryToSend,
        });
        core.info("Success Microsoft Teams");
    }
    catch (error) {
        core.error(error);
    }
    core.info("Finished sending Microsoft Teams");
}
exports.sendMSTeamsMsg = sendMSTeamsMsg;
//# sourceMappingURL=ms-teams.js.map