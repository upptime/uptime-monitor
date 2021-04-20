"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const notifme_sdk_1 = __importDefault(require("notifme-sdk"));
const axios_1 = __importDefault(require("axios"));
const environment_1 = require("./environment");
const secrets_1 = require("./secrets");
const channels = {};
if (secrets_1.getSecret("NOTIFICATION_EMAIL_SENDGRID") ||
    secrets_1.getSecret("NOTIFICATION_EMAIL_SES") ||
    secrets_1.getSecret("NOTIFICATION_EMAIL_SPARKPOST") ||
    secrets_1.getSecret("NOTIFICATION_EMAIL_MAILGUN") ||
    secrets_1.getSecret("NOTIFICATION_EMAIL_SMTP")) {
    channels.email = {
        providers: [],
        multiProviderStrategy: secrets_1.getSecret("NOTIFICATION_EMAIL_STRATEGY") ||
            "roundrobin",
    };
    if (secrets_1.getSecret("NOTIFICATION_EMAIL_SENDGRID")) {
        channels.email.providers.push({
            type: "sendgrid",
            apiKey: secrets_1.getSecret("NOTIFICATION_EMAIL_SENDGRID_API_KEY"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_EMAIL_SES")) {
        channels.email.providers.push({
            type: "ses",
            region: secrets_1.getSecret("NOTIFICATION_EMAIL_SES_REGION"),
            accessKeyId: secrets_1.getSecret("NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID"),
            secretAccessKey: secrets_1.getSecret("NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY"),
            sessionToken: secrets_1.getSecret("NOTIFICATION_EMAIL_SES_SESSION_TOKEN"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_EMAIL_SPARKPOST")) {
        channels.email.providers.push({
            type: "sparkpost",
            apiKey: secrets_1.getSecret("NOTIFICATION_EMAIL_SPARKPOST_API_KEY"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_EMAIL_MAILGUN")) {
        channels.email.providers.push({
            type: "mailgun",
            apiKey: secrets_1.getSecret("NOTIFICATION_EMAIL_MAILGUN_API_KEY"),
            domainName: secrets_1.getSecret("NOTIFICATION_EMAIL_MAILGUN_DOMAIN_NAME"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_EMAIL_SMTP")) {
        channels.email.providers.push({
            type: "smtp",
            port: (secrets_1.getSecret("NOTIFICATION_EMAIL_SMTP_PORT")
                ? parseInt(secrets_1.getSecret("NOTIFICATION_EMAIL_SMTP_PORT") || "", 10)
                : 587),
            host: secrets_1.getSecret("NOTIFICATION_EMAIL_SMTP_HOST"),
            auth: {
                user: secrets_1.getSecret("NOTIFICATION_EMAIL_SMTP_USERNAME"),
                pass: secrets_1.getSecret("NOTIFICATION_EMAIL_SMTP_PASSWORD"),
            },
        });
    }
}
if (secrets_1.getSecret("NOTIFICATION_SMS_46ELKS") ||
    secrets_1.getSecret("NOTIFICATION_SMS_CALLR") ||
    secrets_1.getSecret("NOTIFICATION_SMS_CLICKATELL") ||
    secrets_1.getSecret("NOTIFICATION_SMS_INFOBIP") ||
    secrets_1.getSecret("NOTIFICATION_SMS_NEXMO") ||
    secrets_1.getSecret("NOTIFICATION_SMS_OVH") ||
    secrets_1.getSecret("NOTIFICATION_SMS_PLIVO") ||
    secrets_1.getSecret("NOTIFICATION_SMS_TWILIO")) {
    channels.sms = {
        providers: [],
        multiProviderStrategy: secrets_1.getSecret("NOTIFICATION_SMS_STRATEGY") ||
            "roundrobin",
    };
    if (secrets_1.getSecret("NOTIFICATION_SMS_46ELKS")) {
        channels.sms.providers.push({
            type: "46elks",
            apiUsername: secrets_1.getSecret("NOTIFICATION_SMS_46ELKS_API_USERNAME"),
            apiPassword: secrets_1.getSecret("NOTIFICATION_SMS_46ELKS_API_PASSWORD"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_SMS_CALLR")) {
        channels.sms.providers.push({
            type: "callr",
            login: secrets_1.getSecret("NOTIFICATION_SMS_CALLR_LOGIN"),
            password: secrets_1.getSecret("NOTIFICATION_SMS_CALLR_PASSWORD"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_SMS_CLICKATELL")) {
        channels.sms.providers.push({
            type: "clickatell",
            apiKey: secrets_1.getSecret("NOTIFICATION_SMS_CLICKATELL_API_KEY"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_SMS_INFOBIP")) {
        channels.sms.providers.push({
            type: "infobip",
            username: secrets_1.getSecret("NOTIFICATION_SMS_INFOBIP_USERNAME"),
            password: secrets_1.getSecret("NOTIFICATION_SMS_INFOBIP_PASSWORD"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_SMS_NEXMO")) {
        channels.sms.providers.push({
            type: "nexmo",
            apiKey: secrets_1.getSecret("NOTIFICATION_SMS_NEXMO_API_KEY"),
            apiSecret: secrets_1.getSecret("NOTIFICATION_SMS_NEXMO_API_SECRET"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_SMS_OVH")) {
        channels.sms.providers.push({
            type: "ovh",
            appKey: secrets_1.getSecret("NOTIFICATION_SMS_OVH_APP_KEY"),
            appSecret: secrets_1.getSecret("NOTIFICATION_SMS_OVH_APP_SECRET"),
            consumerKey: secrets_1.getSecret("NOTIFICATION_SMS_OVH_CONSUMER_KEY"),
            account: secrets_1.getSecret("NOTIFICATION_SMS_OVH_ACCOUNT"),
            host: secrets_1.getSecret("NOTIFICATION_SMS_OVH_HOST"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_SMS_PLIVO")) {
        channels.sms.providers.push({
            type: "plivo",
            authId: secrets_1.getSecret("NOTIFICATION_SMS_PLIVO_AUTH_ID"),
            authToken: secrets_1.getSecret("NOTIFICATION_SMS_PLIVO_AUTH_TOKEN"),
        });
    }
    if (secrets_1.getSecret("NOTIFICATION_SMS_TWILIO")) {
        channels.sms.providers.push({
            type: "twilio",
            accountSid: secrets_1.getSecret("NOTIFICATION_SMS_TWILIO_ACCOUNT_SID"),
            authToken: secrets_1.getSecret("NOTIFICATION_SMS_TWILIO_AUTH_TOKEN"),
        });
    }
}
if (secrets_1.getSecret("NOTIFICATION_SLACK")) {
    channels.slack = {
        providers: [],
        multiProviderStrategy: secrets_1.getSecret("NOTIFICATION_SLACK_STRATEGY") ||
            "roundrobin",
    };
    if (secrets_1.getSecret("NOTIFICATION_SLACK_WEBHOOK")) {
        channels.slack.providers.push({
            type: "webhook",
            webhookUrl: secrets_1.getSecret("NOTIFICATION_SLACK_WEBHOOK_URL"),
        });
    }
}
const notifier = new notifme_sdk_1.default({
    channels,
});
const sendNotification = async (message) => {
    console.log("Sending notification", message);
    message = environment_1.replaceEnvironmentVariables(message);
    if (channels.email) {
        console.log("Sending email");
        try {
            await notifier.send({
                email: {
                    from: (secrets_1.getSecret("NOTIFICATION_EMAIL_FROM") || secrets_1.getSecret("NOTIFICATION_EMAIL")),
                    to: (secrets_1.getSecret("NOTIFICATION_EMAIL_TO") || secrets_1.getSecret("NOTIFICATION_EMAIL")),
                    subject: message,
                    html: message,
                },
            });
            console.log("Success email");
        }
        catch (error) {
            console.log("Got an error", error);
        }
        console.log("Finished sending email");
    }
    if (channels.sms) {
        console.log("Sending SMS");
        try {
            await notifier.send({
                sms: {
                    from: secrets_1.getSecret("NOTIFICATION_SMS_FROM"),
                    to: secrets_1.getSecret("NOTIFICATION_SMS_TO"),
                    text: message,
                },
            });
            console.log("Success SMS");
        }
        catch (error) {
            console.log("Got an error", error);
        }
        console.log("Finished sending SMS");
    }
    if (channels.slack) {
        console.log("Sending Slack");
        try {
            await notifier.send({
                slack: {
                    text: message,
                },
            });
            console.log("Success Slack");
        }
        catch (error) {
            console.log("Got an error", error);
        }
        console.log("Finished sending Slack");
    }
    if (secrets_1.getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL")) {
        console.log("Sending Discord");
        try {
            await axios_1.default.post(secrets_1.getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL"), {
                content: message,
            });
            console.log("Success Discord");
        }
        catch (error) {
            console.log("Got an error", error);
        }
        console.log("Finished sending Discord");
    }
    if (secrets_1.getSecret("NOTIFICATION_TELEGRAM") && secrets_1.getSecret("NOTIFICATION_TELEGRAM_BOT_KEY")) {
        console.log("Sending Telegram");
        try {
            await axios_1.default.post(`https://api.telegram.org/bot${secrets_1.getSecret("NOTIFICATION_TELEGRAM_BOT_KEY")}/sendMessage`, {
                parse_mode: "Markdown",
                disable_web_page_preview: true,
                chat_id: secrets_1.getSecret("NOTIFICATION_TELEGRAM_CHAT_ID"),
                text: message,
            });
            console.log("Success Telegram");
        }
        catch (error) {
            console.log("Got an error", error);
        }
        console.log("Finished sending Telegram");
    }
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=notifme.js.map