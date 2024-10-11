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
exports.sendTelegramMsg = exports.checkMaybeSendTelegramMsg = void 0;
const secrets_1 = require("../../secrets");
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Check if a telegram message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendTelegramMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_TELEGRAM") && (0, secrets_1.getSecret)("NOTIFICATION_TELEGRAM_BOT_KEY")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendTelegramMsg = checkMaybeSendTelegramMsg;
/**
 * Send a telegram message
 *
 * @param message
 * @returns Promise<void>
 */
async function sendTelegramMsg(defaultMessage, config) {
    const { chatIdsString, message } = config ?? {};
    core.info("Sending telegram message");
    const chatIds = (chatIdsString || (0, secrets_1.getSecret)("NOTIFICATION_TELEGRAM_CHAT_ID")).split(",") ?? [];
    const messageToSend = message || defaultMessage;
    core.debug(`Chat IDs: ${chatIds}`);
    core.debug(`Message: ${messageToSend}`);
    try {
        for (const chatId of chatIds) {
            await axios_1.default.post(`https://api.telegram.org/bot${(0, secrets_1.getSecret)("NOTIFICATION_TELEGRAM_BOT_KEY")}/sendMessage`, {
                parse_mode: "Markdown",
                disable_web_page_preview: true,
                chat_id: chatId.trim(),
                text: messageToSend.replace(/_/g, "\\_"),
            });
        }
        core.info("Success Telegram");
    }
    catch (error) {
        core.error(error);
    }
    core.info("Finished sending Telegram");
}
exports.sendTelegramMsg = sendTelegramMsg;
//# sourceMappingURL=telegram.js.map