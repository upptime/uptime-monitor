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
exports.sendGoogleChatMsg = exports.checkMaybeSendGoogleChatMsg = void 0;
const secrets_1 = require("../../secrets");
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Check if a google chat message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendGoogleChatMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendGoogleChatMsg = checkMaybeSendGoogleChatMsg;
async function sendGoogleChatMsg(defaultMessage, config) {
    const { message, url } = config ?? {};
    core.info("Sending google chat message");
    const urlToSend = url || (0, secrets_1.getSecret)("NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL");
    const messageToSend = message || defaultMessage;
    core.debug(`URL: ${urlToSend}`);
    core.debug(`Message: ${messageToSend}`);
    try {
        await axios_1.default.post(urlToSend, {
            text: messageToSend,
        });
        core.info("Success Google Chat");
    }
    catch (error) {
        core.error(error);
    }
    core.info("Finished sending Google Chat");
}
exports.sendGoogleChatMsg = sendGoogleChatMsg;
//# sourceMappingURL=google-chat.js.map