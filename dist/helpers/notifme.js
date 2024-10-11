"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.sendCustomNotification = void 0;
const notifme_sdk_1 = __importDefault(require("notifme-sdk"));
const environment_1 = require("./environment");
const sender_1 = require("./notification/sender");
// setup notifier channels
const channels = {};
// fill notifier channels if needed
(0, sender_1.checkMaybeSendMail)() && (0, sender_1.setupNotifierEmailChannel)(channels);
(0, sender_1.checkMaybeSendSMS)() && (0, sender_1.setupNotifierSMSChannel)(channels);
(0, sender_1.checkMaybeSendSlackMsg)() && (0, sender_1.setupNotifierSlackChannel)(channels);
const notifier = new notifme_sdk_1.default({
    channels,
});
const sendCustomNotification = async (config, message) => {
    console.log("Sending custom notification", config, message);
    message = (0, environment_1.replaceEnvironmentVariables)(message);
    // TODO: Chnage notification to match custom webhook with optional config
    const notificationTasks = [
        config.email && (0, sender_1.sendEmail)(notifier, message, config.email),
        config.sms && (0, sender_1.sendSMS)(notifier, message, config.sms),
        config.slack && (0, sender_1.sendSlackMsg)(notifier, message, config.slack),
        config.customWebhook && (0, sender_1.sendCustomWebhookMsg)(message, config.customWebhook),
        config.discord && (0, sender_1.sendDiscordMsg)(message, config.discord),
        config.googleChat && (0, sender_1.sendGoogleChatMsg)(message, config.googleChat),
        config.zulip && (0, sender_1.sendZulipMsg)(message, config.zulip),
        config.mastodon && (0, sender_1.sendMastodonMsg)(message, config.mastodon),
        config.misskey && (0, sender_1.sendMisskeyMsg)(message, config.misskey),
        config.telegram && (0, sender_1.sendTelegramMsg)(message, config.telegram),
        config.lark && (0, sender_1.sendLarkMsg)(message, config.lark),
        config.msTeams && (0, sender_1.sendMSTeamsMsg)(message, config.msTeams),
    ].filter(Boolean);
    await Promise.all(notificationTasks);
};
exports.sendCustomNotification = sendCustomNotification;
const sendNotification = async (message) => {
    console.log("Sending notification", message);
    message = (0, environment_1.replaceEnvironmentVariables)(message);
    const notificationTasks = [
        channels.email && (0, sender_1.sendEmail)(notifier, message),
        channels.sms && (0, sender_1.sendSMS)(notifier, message),
        channels.slack && (0, sender_1.sendSlackMsg)(notifier, message),
        (0, sender_1.checkMaybeSendDiscordMsg)() && (0, sender_1.sendDiscordMsg)(message),
        (0, sender_1.checkMaybeSendGoogleChatMsg)() && (0, sender_1.sendGoogleChatMsg)(message),
        (0, sender_1.checkMaybeSendZulipMsg)() && (0, sender_1.sendZulipMsg)(message),
        (0, sender_1.checkMaybeSendMastodonMsg)() && (0, sender_1.sendMastodonMsg)(message),
        (0, sender_1.checkMaybeSendMisskeyMsg)() && (0, sender_1.sendMisskeyMsg)(message),
        (0, sender_1.checkMaybeSendTelegramMsg)() && (0, sender_1.sendTelegramMsg)(message),
        (0, sender_1.checkMaybeSendLarkMsg)() && (0, sender_1.sendLarkMsg)(message),
        (0, sender_1.checkMaybeSendMSTeamsMsg)() && (0, sender_1.sendMSTeamsMsg)(message),
        (0, sender_1.checkMaybeSendCustomWebhookMsg)() && (0, sender_1.sendCustomWebhookMsg)(message),
    ].filter(Boolean);
    await Promise.all(notificationTasks);
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=notifme.js.map