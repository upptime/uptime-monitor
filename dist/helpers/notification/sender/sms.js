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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = exports.setupNotifierSMSChannel = exports.checkMaybeSendSMS = void 0;
const secrets_1 = require("../../secrets");
const core = __importStar(require("@actions/core"));
/**
 * Check if a sms should be sent
 *
 * @returns boolean
 */
function checkMaybeSendSMS() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_46ELKS") ||
        (0, secrets_1.getSecret)("NOTIFICATION_SMS_CALLR") ||
        (0, secrets_1.getSecret)("NOTIFICATION_SMS_CLICKATELL") ||
        (0, secrets_1.getSecret)("NOTIFICATION_SMS_INFOBIP") ||
        (0, secrets_1.getSecret)("NOTIFICATION_SMS_NEXMO") ||
        (0, secrets_1.getSecret)("NOTIFICATION_SMS_OVH") ||
        (0, secrets_1.getSecret)("NOTIFICATION_SMS_PLIVO") ||
        (0, secrets_1.getSecret)("NOTIFICATION_SMS_TWILIO")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendSMS = checkMaybeSendSMS;
/**
 * Setup the SMS channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
function setupNotifierSMSChannel(channels) {
    channels.sms = {
        providers: [],
        multiProviderStrategy: (0, secrets_1.getSecret)("NOTIFICATION_SMS_STRATEGY") ||
            "roundrobin",
    };
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_46ELKS")) {
        channels.sms.providers.push({
            type: "46elks",
            apiUsername: (0, secrets_1.getSecret)("NOTIFICATION_SMS_46ELKS_API_USERNAME"),
            apiPassword: (0, secrets_1.getSecret)("NOTIFICATION_SMS_46ELKS_API_PASSWORD"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_CALLR")) {
        channels.sms.providers.push({
            type: "callr",
            login: (0, secrets_1.getSecret)("NOTIFICATION_SMS_CALLR_LOGIN"),
            password: (0, secrets_1.getSecret)("NOTIFICATION_SMS_CALLR_PASSWORD"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_CLICKATELL")) {
        channels.sms.providers.push({
            type: "clickatell",
            apiKey: (0, secrets_1.getSecret)("NOTIFICATION_SMS_CLICKATELL_API_KEY"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_INFOBIP")) {
        channels.sms.providers.push({
            type: "infobip",
            username: (0, secrets_1.getSecret)("NOTIFICATION_SMS_INFOBIP_USERNAME"),
            password: (0, secrets_1.getSecret)("NOTIFICATION_SMS_INFOBIP_PASSWORD"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_NEXMO")) {
        channels.sms.providers.push({
            type: "nexmo",
            apiKey: (0, secrets_1.getSecret)("NOTIFICATION_SMS_NEXMO_API_KEY"),
            apiSecret: (0, secrets_1.getSecret)("NOTIFICATION_SMS_NEXMO_API_SECRET"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_OVH")) {
        channels.sms.providers.push({
            type: "ovh",
            appKey: (0, secrets_1.getSecret)("NOTIFICATION_SMS_OVH_APP_KEY"),
            appSecret: (0, secrets_1.getSecret)("NOTIFICATION_SMS_OVH_APP_SECRET"),
            consumerKey: (0, secrets_1.getSecret)("NOTIFICATION_SMS_OVH_CONSUMER_KEY"),
            account: (0, secrets_1.getSecret)("NOTIFICATION_SMS_OVH_ACCOUNT"),
            host: (0, secrets_1.getSecret)("NOTIFICATION_SMS_OVH_HOST"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_PLIVO")) {
        channels.sms.providers.push({
            type: "plivo",
            authId: (0, secrets_1.getSecret)("NOTIFICATION_SMS_PLIVO_AUTH_ID"),
            authToken: (0, secrets_1.getSecret)("NOTIFICATION_SMS_PLIVO_AUTH_TOKEN"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_SMS_TWILIO")) {
        channels.sms.providers.push({
            type: "twilio",
            accountSid: (0, secrets_1.getSecret)("NOTIFICATION_SMS_TWILIO_ACCOUNT_SID"),
            authToken: (0, secrets_1.getSecret)("NOTIFICATION_SMS_TWILIO_AUTH_TOKEN"),
        });
    }
}
exports.setupNotifierSMSChannel = setupNotifierSMSChannel;
/**
 * Send a SMS
 *
 * @params notifier NotifMeSdk
 * @params message string
 * @returns Promise<void>
 */
async function sendSMS(notifier, defaultMessage, config) {
    const { to, from, message } = config ?? {};
    core.info("Sending SMS");
    const messageToSend = message || defaultMessage;
    const toSend = to || (0, secrets_1.getSecret)("NOTIFICATION_SMS_TO");
    const fromSend = from || (0, secrets_1.getSecret)("NOTIFICATION_SMS_FROM");
    core.debug(`To: ${toSend}`);
    core.debug(`From: ${fromSend}`);
    core.debug(`Message: ${messageToSend}`);
    try {
        await notifier.send({
            sms: {
                from: fromSend,
                to: toSend,
                text: messageToSend,
            },
        });
        core.info("Success SMS");
    }
    catch (error) {
        core.error(error);
    }
    core.info("Finished sending SMS");
}
exports.sendSMS = sendSMS;
//# sourceMappingURL=sms.js.map