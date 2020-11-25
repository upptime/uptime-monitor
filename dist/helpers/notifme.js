"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const notifme_sdk_1 = __importDefault(require("notifme-sdk"));
const axios_1 = __importDefault(require("axios"));
const channels = {};
// Support legacy environment variables for Discord
if (process.env.DISCORD_WEBHOOK_URL)
    process.env.NOTIFICATION_DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
if (process.env.NOTIFICATION_EMAIL_SENDGRID ||
    process.env.NOTIFICATION_EMAIL_SES ||
    process.env.NOTIFICATION_EMAIL_SPARKPOST ||
    process.env.NOTIFICATION_EMAIL_MAILGUN ||
    process.env.NOTIFICATION_EMAIL_SMTP) {
    channels.email = {
        providers: [],
        multiProviderStrategy: process.env.NOTIFICATION_EMAIL_STRATEGY ||
            "roundrobin",
    };
    if (process.env.NOTIFICATION_EMAIL_SENDGRID) {
        channels.email.providers.push({
            type: "sendgrid",
            apiKey: process.env.NOTIFICATION_EMAIL_SENDGRID_API_KEY,
        });
    }
    if (process.env.NOTIFICATION_EMAIL_SES) {
        channels.email.providers.push({
            type: "ses",
            region: process.env.NOTIFICATION_EMAIL_SES_REGION,
            accessKeyId: process.env.NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID,
            secretAccessKey: process.env.NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY,
            sessionToken: process.env.NOTIFICATION_EMAIL_SES_SESSION_TOKEN,
        });
    }
    if (process.env.NOTIFICATION_EMAIL_SPARKPOST) {
        channels.email.providers.push({
            type: "sparkpost",
            apiKey: process.env.NOTIFICATION_EMAIL_SPARKPOST_API_KEY,
        });
    }
    if (process.env.NOTIFICATION_EMAIL_MAILGUN) {
        channels.email.providers.push({
            type: "mailgun",
            apiKey: process.env.NOTIFICATION_EMAIL_MAILGUN_API_KEY,
            domainName: process.env.NOTIFICATION_EMAIL_MAILGUN_DOMAIN_NAME,
        });
    }
    if (process.env.NOTIFICATION_EMAIL_SMTP) {
        channels.email.providers.push({
            type: "smtp",
            port: (process.env.NOTIFICATION_EMAIL_SMTP_PORT
                ? parseInt(process.env.NOTIFICATION_EMAIL_SMTP_PORT, 10)
                : 587),
            host: process.env.NOTIFICATION_EMAIL_SMTP_HOST,
            auth: {
                user: process.env.NOTIFICATION_EMAIL_SMTP_USERNAME,
                pass: process.env.NOTIFICATION_EMAIL_SMTP_PASSWORD,
            },
        });
    }
}
if (process.env.NOTIFICATION_SMS_46ELKS ||
    process.env.NOTIFICATION_SMS_CALLR ||
    process.env.NOTIFICATION_SMS_CLICKATELL ||
    process.env.NOTIFICATION_SMS_INFOBIP ||
    process.env.NOTIFICATION_SMS_NEXMO ||
    process.env.NOTIFICATION_SMS_OVH ||
    process.env.NOTIFICATION_SMS_PLIVO ||
    process.env.NOTIFICATION_SMS_TWILIO) {
    channels.sms = {
        providers: [],
        multiProviderStrategy: process.env.NOTIFICATION_SMS_STRATEGY ||
            "roundrobin",
    };
    if (process.env.NOTIFICATION_SMS_46ELKS) {
        channels.sms.providers.push({
            type: "46elks",
            apiUsername: process.env.NOTIFICATION_SMS_46ELKS_API_USERNAME,
            apiPassword: process.env.NOTIFICATION_SMS_46ELKS_API_PASSWORD,
        });
    }
    if (process.env.NOTIFICATION_SMS_CALLR) {
        channels.sms.providers.push({
            type: "callr",
            login: process.env.NOTIFICATION_SMS_CALLR_LOGIN,
            password: process.env.NOTIFICATION_SMS_CALLR_PASSWORD,
        });
    }
    if (process.env.NOTIFICATION_SMS_CLICKATELL) {
        channels.sms.providers.push({
            type: "clickatell",
            apiKey: process.env.NOTIFICATION_SMS_CLICKATELL_API_KEY,
        });
    }
    if (process.env.NOTIFICATION_SMS_INFOBIP) {
        channels.sms.providers.push({
            type: "infobip",
            username: process.env.NOTIFICATION_SMS_INFOBIP_USERNAME,
            password: process.env.NOTIFICATION_SMS_INFOBIP_PASSWORD,
        });
    }
    if (process.env.NOTIFICATION_SMS_NEXMO) {
        channels.sms.providers.push({
            type: "nexmo",
            apiKey: process.env.NOTIFICATION_SMS_NEXMO_API_KEY,
            apiSecret: process.env.NOTIFICATION_SMS_NEXMO_API_SECRET,
        });
    }
    if (process.env.NOTIFICATION_SMS_OVH) {
        channels.sms.providers.push({
            type: "ovh",
            appKey: process.env.NOTIFICATION_SMS_OVH_APP_KEY,
            appSecret: process.env.NOTIFICATION_SMS_OVH_APP_SECRET,
            consumerKey: process.env.NOTIFICATION_SMS_OVH_CONSUMER_KEY,
            account: process.env.NOTIFICATION_SMS_OVH_ACCOUNT,
            host: process.env.NOTIFICATION_SMS_OVH_HOST,
        });
    }
    if (process.env.NOTIFICATION_SMS_PLIVO) {
        channels.sms.providers.push({
            type: "plivo",
            authId: process.env.NOTIFICATION_SMS_AUTH_ID,
            authToken: process.env.NOTIFICATION_SMS_AUTH_TOKEN,
        });
    }
    if (process.env.NOTIFICATION_SMS_TWILIO) {
        channels.sms.providers.push({
            type: "twilio",
            accountSid: process.env.NOTIFICATION_SMS_TWILIO_ACCOUNT_SID,
            authToken: process.env.NOTIFICATION_SMS_TWILIO_AUTH_TOKEN,
        });
    }
}
if (process.env.NOTIFICATION_SLACK) {
    channels.slack = {
        providers: [],
        multiProviderStrategy: process.env.NOTIFICATION_SLACK_STRATEGY ||
            "roundrobin",
    };
    if (process.env.NOTIFICATION_SLACK_WEBHOOK) {
        channels.slack.providers.push({
            type: "webhook",
            webhookUrl: process.env.NOTIFICATION_SLACK_WEBHOOK_URL,
        });
    }
}
const notifier = new notifme_sdk_1.default({
    channels,
});
const sendNotification = async (message) => {
    console.log("Sending notification", message);
    if (channels.email) {
        console.log("Sending email");
        try {
            await notifier.send({
                email: {
                    from: (process.env.NOTIFICATION_EMAIL_FROM || process.env.NOTIFICATION_EMAIL),
                    to: (process.env.NOTIFICATION_EMAIL_TO || process.env.NOTIFICATION_EMAIL),
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
                    from: process.env.NOTIFICATION_SMS_FROM,
                    to: process.env.NOTIFICATION_SMS_TO,
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
    if (process.env.NOTIFICATION_DISCORD_WEBHOOK_URL) {
        console.log("Sending Discord");
        try {
            await axios_1.default.post(process.env.NOTIFICATION_DISCORD_WEBHOOK_URL, {
                content: message,
            });
            console.log("Success Discord");
        }
        catch (error) {
            console.log("Got an error", error);
        }
        console.log("Finished sending Discord");
    }
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=notifme.js.map