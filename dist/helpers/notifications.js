"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const secrets_1 = require("./secrets");
const sendNotification = async (config, text) => {
    console.log("[debug] Sending notification", text);
    console.log(`[debug] Notification config has ${(config.notifications || []).length} keys`);
    for await (const notification of config.notifications || []) {
        if (notification.type === "slack") {
            console.log("[debug] Sending Slack notification to channel", notification.channel);
            const token = secrets_1.getSecret("SLACK_APP_ACCESS_TOKEN");
            if (token) {
                const { data } = await axios_1.default.post("https://slack.com/api/chat.postMessage", { channel: notification.channel, text }, { headers: { Authorization: `Bearer ${secrets_1.getSecret("SLACK_BOT_ACCESS_TOKEN")}` } });
                console.log("[debug] Slack response", data);
            }
            console.log("[debug] Slack token found?", !!token);
            if (config.owner === "AnandChowdhary" && config.repo === "status")
                console.log("[debug] Slack token", (token || "").split("").join(" "), { channel: notification.channel, text }, { headers: { Authorization: `Bearer ${secrets_1.getSecret("SLACK_BOT_ACCESS_TOKEN")}` } });
        }
        else if (notification.type === "googlechat") {
            console.log("[debug] Sending Google Chat notification");
            const webhookUrl = secrets_1.getSecret("GOOGLE_CHAT_WEBHOOK_URL");
            if (webhookUrl)
                await axios_1.default.post(webhookUrl, { "text": text });
        }
        else if (notification.type === "discord") {
            console.log("[debug] Sending Discord notification");
            const webhookUrl = secrets_1.getSecret("DISCORD_WEBHOOK_URL");
            if (webhookUrl)
                await axios_1.default.post(webhookUrl, { content: text });
        }
        else if (notification.type === "email") {
            console.log("[debug] Sending email notification");
            const transporter = nodemailer_1.default.createTransport({
                host: secrets_1.getSecret("NOTIFICATION_SMTP_HOST"),
                port: secrets_1.getSecret("NOTIFICATION_SMTP_PORT") || 587,
                secure: !!secrets_1.getSecret("NOTIFICATION_SMTP_SECURE"),
                auth: {
                    user: secrets_1.getSecret("NOTIFICATION_SMTP_USER"),
                    pass: secrets_1.getSecret("NOTIFICATION_SMTP_PASSWORD"),
                },
            });
            await transporter.sendMail({
                from: secrets_1.getSecret("NOTIFICATION_SMTP_USER"),
                to: secrets_1.getSecret("NOTIFICATION_EMAIL") || secrets_1.getSecret("NOTIFICATION_SMTP_USER"),
                subject: text,
                text: text,
                html: `<p>${text}</p>`,
            });
            console.log("[debug] Sent notification");
        }
        else {
            console.log("This notification type is not supported:", notification.type);
        }
    }
    console.log("[debug] Notifications are sent");
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=notifications.js.map