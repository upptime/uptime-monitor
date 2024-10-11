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
exports.sendMastodonMsg = exports.checkMaybeSendMastodonMsg = void 0;
const secrets_1 = require("../../secrets");
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Check if a mastodon message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendMastodonMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_MASTODON") &&
        (0, secrets_1.getSecret)("NOTIFICATION_MASTODON_INSTANCE_URL") &&
        (0, secrets_1.getSecret)("NOTIFICATION_MASTODON_API_KEY")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendMastodonMsg = checkMaybeSendMastodonMsg;
/**
 * Send a mastodon message
 *
 * @param message
 * @returns Promise<void>
 */
async function sendMastodonMsg(defaultMessage, config) {
    const { message, url, apiKey, tootVisibility } = config ?? {};
    core.info("Sending mastodon message");
    const instanceUrl = new URL(url || (0, secrets_1.getSecret)("NOTIFICATION_MASTODON_INSTANCE_URL"));
    const messageToSend = message || defaultMessage;
    const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;
    const apiKeyToSend = apiKey || (0, secrets_1.getSecret)("NOTIFICATION_MASTODON_API_KEY");
    core.debug(`URL: ${baseUrl}`);
    core.debug(`Message: ${messageToSend}`);
    core.debug(`Visibility: ${tootVisibility}`);
    let visibility = "public";
    if (tootVisibility || (0, secrets_1.getSecret)("NOTIFICATION_MASTODON_TOOT_VISIBILITY")) {
        try {
            visibility =
                tootVisibility ||
                    (0, secrets_1.getSecret)("NOTIFICATION_MASTODON_TOOT_VISIBILITY");
        }
        catch (e) {
            core.error('Unsupported Mastodon toot visibility mode');
        }
    }
    await axios_1.default.post(`${baseUrl}/v1/statuses`, {
        visibility: visibility,
        status: messageToSend,
    }, {
        headers: {
            Authorization: `Bearer ${apiKeyToSend}`,
        },
    });
}
exports.sendMastodonMsg = sendMastodonMsg;
//# sourceMappingURL=mastodon.js.map