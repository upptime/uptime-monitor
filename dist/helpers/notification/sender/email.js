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
exports.sendEmail = exports.setupNotifierEmailChannel = exports.checkMaybeSendMail = void 0;
const secrets_1 = require("../../secrets");
const core = __importStar(require("@actions/core"));
/**
 * Check if a mail should be sent
 *
 * @returns boolean
 */
function checkMaybeSendMail() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SENDGRID") ||
        (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SES") ||
        (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SPARKPOST") ||
        (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_MAILGUN") ||
        (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SMTP")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendMail = checkMaybeSendMail;
/**
 * Setup the email channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
function setupNotifierEmailChannel(channels) {
    channels.email = {
        providers: [],
        multiProviderStrategy: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_STRATEGY") ||
            "roundrobin",
    };
    if ((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SENDGRID")) {
        channels.email.providers.push({
            type: "sendgrid",
            apiKey: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SENDGRID_API_KEY"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SES")) {
        channels.email.providers.push({
            type: "ses",
            region: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SES_REGION"),
            accessKeyId: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID"),
            secretAccessKey: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY"),
            sessionToken: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SES_SESSION_TOKEN"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SPARKPOST")) {
        channels.email.providers.push({
            type: "sparkpost",
            apiKey: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SPARKPOST_API_KEY"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_MAILGUN")) {
        channels.email.providers.push({
            type: "mailgun",
            apiKey: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_MAILGUN_API_KEY"),
            domainName: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_MAILGUN_DOMAIN_NAME"),
        });
    }
    if ((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SMTP")) {
        channels.email.providers.push({
            type: "smtp",
            port: ((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SMTP_PORT")
                ? parseInt((0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SMTP_PORT") || "", 10)
                : 587),
            host: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SMTP_HOST"),
            auth: {
                user: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SMTP_USERNAME"),
                pass: (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_SMTP_PASSWORD"),
            },
        });
    }
}
exports.setupNotifierEmailChannel = setupNotifierEmailChannel;
/**
 * Send Email via NotifMeSdk
 *
 * @param notifier
 * @param message
 * @returns Promise<void>
 */
async function sendEmail(notifier, defaultMessage, config) {
    const { to, from, subject, message } = config ?? {};
    core.info("Sending email");
    const toSend = to || (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_FROM") || (0, secrets_1.getSecret)("NOTIFICATION_EMAIL");
    const fromSend = from || (0, secrets_1.getSecret)("NOTIFICATION_EMAIL_TO") || (0, secrets_1.getSecret)("NOTIFICATION_EMAIL");
    const subjectSend = subject || defaultMessage;
    const messageSend = message || defaultMessage;
    core.debug(`To: ${to}`);
    core.debug(`From: ${from}`);
    core.debug(`Subject: ${subject}`);
    core.debug(`Message: ${message}`);
    try {
        await notifier.send({
            email: {
                from: fromSend,
                to: toSend,
                subject: subjectSend,
                html: messageSend,
            },
        });
        core.info("Success email");
    }
    catch (error) {
        core.error(error);
    }
    core.info("Finished sending email");
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map