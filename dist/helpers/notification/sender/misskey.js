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
exports.sendMisskeyMsg = exports.checkMaybeSendMisskeyMsg = void 0;
const secrets_1 = require("../../secrets");
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Check if a misskey message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendMisskeyMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_MISSKEY") &&
        (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_INSTANCE_URL") &&
        (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_API_KEY")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendMisskeyMsg = checkMaybeSendMisskeyMsg;
/**
 * Send a misskey message
 *
 * @param message
 * @returns Promise<void>
 */
async function sendMisskeyMsg(defaultMessage, config) {
    const { method, url, apiKey, misskeyNoteVisibility, userId, userIdsString, message } = config ?? {};
    core.info("Sending misskey message");
    const instanceUrl = new URL(url || (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_INSTANCE_URL"));
    const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;
    const apiKeyToSend = apiKey || (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_API_KEY");
    const userIdToSend = userId || (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_CHAT_USER_ID");
    const messageToSend = message || defaultMessage;
    const methodToSend = method || (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_CHAT") || (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_NOTE");
    core.debug(`URL: ${baseUrl}`);
    core.debug(`Message: ${messageToSend}`);
    core.debug(`Visibility: ${misskeyNoteVisibility}`);
    core.debug(`Method: ${methodToSend}`);
    core.debug(`User ID: ${userIdToSend}`);
    core.debug(`Visible User IDs: ${userIdsString}`);
    if (methodToSend === "chat" && userIdToSend) {
        await axios_1.default.post(`${baseUrl}/messaging/messages/create`, {
            i: (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_API_KEY"),
            userId: (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_CHAT_USER_ID"),
            text: messageToSend,
        });
    }
    if (methodToSend === "note") {
        let visibility = "public";
        let visibleUserIds;
        if ((0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_NOTE_VISIBILITY")) {
            try {
                visibility =
                    misskeyNoteVisibility ||
                        (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_NOTE_VISIBILITY");
            }
            catch (e) {
                core.error("Unsupported Misskey note visibility mode:");
            }
        }
        if (visibility == "specified") {
            visibleUserIds = (userIdsString ||
                (0, secrets_1.getSecret)("NOTIFICATION_MISSKEY_NOTE_VISIBLE_USER_IDS") ||
                "").split(",");
        }
        await axios_1.default.post(`${baseUrl}/notes/create`, {
            i: apiKeyToSend,
            visibility: visibility,
            visibleUserIds: visibleUserIds,
            text: messageToSend,
        });
    }
    console.log("Success Misskey");
}
exports.sendMisskeyMsg = sendMisskeyMsg;
//# sourceMappingURL=misskey.js.map