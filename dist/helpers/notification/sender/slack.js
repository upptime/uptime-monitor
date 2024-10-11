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
exports.sendSlackMsg = exports.setupNotifierSlackChannel = exports.checkMaybeSendSlackMsg = void 0;
const notifme_sdk_1 = __importDefault(require("notifme-sdk"));
const secrets_1 = require("../../secrets");
const core = __importStar(require("@actions/core"));
/**
 * Check if a slack message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendSlackMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_SLACK")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendSlackMsg = checkMaybeSendSlackMsg;
/**
 * Setup the slack channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
function setupNotifierSlackChannel(channels) {
    channels.slack = {
        providers: [],
        multiProviderStrategy: (0, secrets_1.getSecret)("NOTIFICATION_SLACK_STRATEGY") ||
            "roundrobin",
    };
    if ((0, secrets_1.getSecret)("NOTIFICATION_SLACK_WEBHOOK")) {
        channels.slack.providers.push({
            type: "webhook",
            webhookUrl: (0, secrets_1.getSecret)("NOTIFICATION_SLACK_WEBHOOK_URL"),
        });
    }
}
exports.setupNotifierSlackChannel = setupNotifierSlackChannel;
/**
 * Send a slack message via NotifMeSdk
 *
 * @param notifier
 * @param message
 * @returns Promise<void>
 */
async function sendSlackMsg(notifier, defaultMessage, config) {
    const { message, customUrl } = config ?? {};
    // if customUrl is provided, override the default notifier config
    if (customUrl) {
        notifier = new notifme_sdk_1.default({
            channels: {
                slack: {
                    providers: [
                        {
                            type: "webhook",
                            webhookUrl: customUrl,
                        },
                    ],
                },
            },
        });
    }
    core.info("Sending slack message");
    const messageToSend = message || defaultMessage;
    core.debug(`Message: ${messageToSend}`);
    try {
        await notifier.send({
            slack: {
                text: messageToSend,
            },
        });
        core.info("Success Slack");
    }
    catch (error) {
        core.error(error);
    }
    core.info("Finished sending Slack");
}
exports.sendSlackMsg = sendSlackMsg;
//# sourceMappingURL=slack.js.map