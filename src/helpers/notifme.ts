import NotifmeSdk, { EmailProvider, SlackProvider, SmsProvider } from "notifme-sdk";

import type { Channel } from "notifme-sdk";
import { CustomNotification } from "../interfaces";
import axios from "axios";
import { replaceEnvironmentVariables } from "./environment";
import {
  checkMaybeSendMail,
  setupNotifierEmailChannel,
  checkMaybeSendSMS,
  setupNotifierSMSChannel,
  checkMaybeSendSlackMsg,
  setupNotifierSlackChannel,
  sendEmail,
  sendSMS,
  sendSlackMsg,
  checkMaybeSendDiscordMsg,
  sendDiscordMsg,
  checkMaybeSendGoogleChatMsg,
  sendGoogleChatMsg,
  checkMaybeSendZulipMsg,
  sendZulipMsg,
  checkMaybeSendMastodonMsg,
  sendMastodonMsg,
  checkMaybeSendMisskeyMsg,
  sendMisskeyMsg,
  checkMaybeSendTelegramMsg,
  sendTelegramMsg,
  sendLarkMsg,
  checkMaybeSendLarkMsg,
  checkMaybeSendMSTeamsMsg,
  sendMSTeamsMsg,
  checkMaybeSendCustomWebhookMsg,
  sendCustomWebhookMsg,
} from "./notification/sender";

// setup notifier channels
const channels: {
  email?: Channel<EmailProvider>;
  sms?: Channel<SmsProvider>;
  slack?: Channel<SlackProvider>;
} = {};

// fill notifier channels if needed
checkMaybeSendMail() && setupNotifierEmailChannel(channels);
checkMaybeSendSMS() && setupNotifierSMSChannel(channels);
checkMaybeSendSlackMsg() && setupNotifierSlackChannel(channels);

const notifier = new NotifmeSdk({
  channels,
});

export const sendCustomNotification = async (config: CustomNotification, message: string) => {
  console.log("Sending custom notification", config, message);
  message = replaceEnvironmentVariables(message);


  // TODO: Chnage notification to match custom webhook with optional config
  const notificationTasks = [
    config.customWebhook && sendCustomWebhookMsg(message, config.customWebhook),
    config.discord && sendDiscordMsg(message),
    config.email && sendEmail(notifier, message),
    config.sms && sendSMS(notifier, message),
    config.slack && sendSlackMsg(notifier, message),
    config.googleChat && sendGoogleChatMsg(message),
    config.zulip && sendZulipMsg(message),
    config.mastodon && sendMastodonMsg(message),
    config.misskey && sendMisskeyMsg(message),
    config.telegram && sendTelegramMsg(message),
    config.lark && sendLarkMsg(message),
    config.msTeams && sendMSTeamsMsg(message),
  ].filter(Boolean);

  await Promise.all(notificationTasks);
};

export const sendNotification = async (message: string) => {
  console.log("Sending notification", message);
  message = replaceEnvironmentVariables(message);

  const notificationTasks = [
    channels.email && sendEmail(notifier, message),
    channels.sms && sendSMS(notifier, message),
    channels.slack && sendSlackMsg(notifier, message),
    checkMaybeSendDiscordMsg() && sendDiscordMsg(message),
    checkMaybeSendGoogleChatMsg() && sendGoogleChatMsg(message),
    checkMaybeSendZulipMsg() && sendZulipMsg(message),
    checkMaybeSendMastodonMsg() && sendMastodonMsg(message),
    checkMaybeSendMisskeyMsg() && sendMisskeyMsg(message),
    checkMaybeSendTelegramMsg() && sendTelegramMsg(message),
    checkMaybeSendLarkMsg() && sendLarkMsg(message),
    checkMaybeSendMSTeamsMsg() && sendMSTeamsMsg(message),
    checkMaybeSendCustomWebhookMsg() && sendCustomWebhookMsg(message),
  ].filter(Boolean);

  await Promise.all(notificationTasks);
};
