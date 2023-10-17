import NotifmeSdk, { EmailProvider, SlackProvider, SmsProvider } from "notifme-sdk";
import axios from "axios";
import type { Channel } from "notifme-sdk";
import { replaceEnvironmentVariables } from "./environment";
import { getSecret } from "./secrets";

const channels: {
  email?: Channel<EmailProvider>;
  sms?: Channel<SmsProvider>;
  slack?: Channel<SlackProvider>;
} = {};

if (
  getSecret("NOTIFICATION_EMAIL_SENDGRID") ||
  getSecret("NOTIFICATION_EMAIL_SES") ||
  getSecret("NOTIFICATION_EMAIL_SPARKPOST") ||
  getSecret("NOTIFICATION_EMAIL_MAILGUN") ||
  getSecret("NOTIFICATION_EMAIL_SMTP")
) {
  channels.email = {
    providers: [],
    multiProviderStrategy:
      (getSecret("NOTIFICATION_EMAIL_STRATEGY") as "fallback" | "roundrobin" | "no-fallback") ||
      "roundrobin",
  };

  if (getSecret("NOTIFICATION_EMAIL_SENDGRID")) {
    channels.email.providers.push({
      type: "sendgrid",
      apiKey: getSecret("NOTIFICATION_EMAIL_SENDGRID_API_KEY") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_SES")) {
    channels.email.providers.push({
      type: "ses",
      region: getSecret("NOTIFICATION_EMAIL_SES_REGION") as string,
      accessKeyId: getSecret("NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID") as string,
      secretAccessKey: getSecret("NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY") as string,
      sessionToken: getSecret("NOTIFICATION_EMAIL_SES_SESSION_TOKEN") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_SPARKPOST")) {
    channels.email.providers.push({
      type: "sparkpost",
      apiKey: getSecret("NOTIFICATION_EMAIL_SPARKPOST_API_KEY") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_MAILGUN")) {
    channels.email.providers.push({
      type: "mailgun",
      apiKey: getSecret("NOTIFICATION_EMAIL_MAILGUN_API_KEY") as string,
      domainName: getSecret("NOTIFICATION_EMAIL_MAILGUN_DOMAIN_NAME") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_SMTP")) {
    channels.email.providers.push({
      type: "smtp",
      port: (getSecret("NOTIFICATION_EMAIL_SMTP_PORT")
        ? parseInt(getSecret("NOTIFICATION_EMAIL_SMTP_PORT") || "", 10)
        : 587) as 587 | 25 | 465,
      host: getSecret("NOTIFICATION_EMAIL_SMTP_HOST") as string,
      auth: {
        user: getSecret("NOTIFICATION_EMAIL_SMTP_USERNAME") as string,
        pass: getSecret("NOTIFICATION_EMAIL_SMTP_PASSWORD") as string,
      },
    });
  }
}

if (
  getSecret("NOTIFICATION_SMS_46ELKS") ||
  getSecret("NOTIFICATION_SMS_CALLR") ||
  getSecret("NOTIFICATION_SMS_CLICKATELL") ||
  getSecret("NOTIFICATION_SMS_INFOBIP") ||
  getSecret("NOTIFICATION_SMS_NEXMO") ||
  getSecret("NOTIFICATION_SMS_OVH") ||
  getSecret("NOTIFICATION_SMS_PLIVO") ||
  getSecret("NOTIFICATION_SMS_TWILIO")
) {
  channels.sms = {
    providers: [],
    multiProviderStrategy:
      (getSecret("NOTIFICATION_SMS_STRATEGY") as "fallback" | "roundrobin" | "no-fallback") ||
      "roundrobin",
  };
  if (getSecret("NOTIFICATION_SMS_46ELKS")) {
    channels.sms.providers.push({
      type: "46elks",
      apiUsername: getSecret("NOTIFICATION_SMS_46ELKS_API_USERNAME") as string,
      apiPassword: getSecret("NOTIFICATION_SMS_46ELKS_API_PASSWORD") as string,
    });
  }
  if (getSecret("NOTIFICATION_SMS_CALLR")) {
    channels.sms.providers.push({
      type: "callr",
      login: getSecret("NOTIFICATION_SMS_CALLR_LOGIN") as string,
      password: getSecret("NOTIFICATION_SMS_CALLR_PASSWORD") as string,
    });
  }
  if (getSecret("NOTIFICATION_SMS_CLICKATELL")) {
    channels.sms.providers.push({
      type: "clickatell",
      apiKey: getSecret("NOTIFICATION_SMS_CLICKATELL_API_KEY") as string,
    });
  }
  if (getSecret("NOTIFICATION_SMS_INFOBIP")) {
    channels.sms.providers.push({
      type: "infobip",
      username: getSecret("NOTIFICATION_SMS_INFOBIP_USERNAME") as string,
      password: getSecret("NOTIFICATION_SMS_INFOBIP_PASSWORD") as string,
    });
  }
  if (getSecret("NOTIFICATION_SMS_NEXMO")) {
    channels.sms.providers.push({
      type: "nexmo",
      apiKey: getSecret("NOTIFICATION_SMS_NEXMO_API_KEY") as string,
      apiSecret: getSecret("NOTIFICATION_SMS_NEXMO_API_SECRET") as string,
    });
  }
  if (getSecret("NOTIFICATION_SMS_OVH")) {
    channels.sms.providers.push({
      type: "ovh",
      appKey: getSecret("NOTIFICATION_SMS_OVH_APP_KEY") as string,
      appSecret: getSecret("NOTIFICATION_SMS_OVH_APP_SECRET") as string,
      consumerKey: getSecret("NOTIFICATION_SMS_OVH_CONSUMER_KEY") as string,
      account: getSecret("NOTIFICATION_SMS_OVH_ACCOUNT") as string,
      host: getSecret("NOTIFICATION_SMS_OVH_HOST") as string,
    });
  }
  if (getSecret("NOTIFICATION_SMS_PLIVO")) {
    channels.sms.providers.push({
      type: "plivo",
      authId: getSecret("NOTIFICATION_SMS_PLIVO_AUTH_ID") as string,
      authToken: getSecret("NOTIFICATION_SMS_PLIVO_AUTH_TOKEN") as string,
    });
  }
  if (getSecret("NOTIFICATION_SMS_TWILIO")) {
    channels.sms.providers.push({
      type: "twilio",
      accountSid: getSecret("NOTIFICATION_SMS_TWILIO_ACCOUNT_SID") as string,
      authToken: getSecret("NOTIFICATION_SMS_TWILIO_AUTH_TOKEN") as string,
    });
  }
}

if (getSecret("NOTIFICATION_SLACK")) {
  channels.slack = {
    providers: [],
    multiProviderStrategy:
      (getSecret("NOTIFICATION_SLACK_STRATEGY") as "fallback" | "roundrobin" | "no-fallback") ||
      "roundrobin",
  };

  if (getSecret("NOTIFICATION_SLACK_WEBHOOK")) {
    channels.slack.providers.push({
      type: "webhook",
      webhookUrl: getSecret("NOTIFICATION_SLACK_WEBHOOK_URL") as string,
    });
  }
}

const notifier = new NotifmeSdk({
  channels,
});

export const sendNotification = async (message: string) => {
  console.log("Sending notification", message);
  message = replaceEnvironmentVariables(message);

  if (channels.email) {
    console.log("Sending email");
    try {
      await notifier.send({
        email: {
          from: (getSecret("NOTIFICATION_EMAIL_FROM") || getSecret("NOTIFICATION_EMAIL")) as string,
          to: (getSecret("NOTIFICATION_EMAIL_TO") || getSecret("NOTIFICATION_EMAIL")) as string,
          subject: message,
          html: message,
        },
      });
      console.log("Success email");
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending email");
  }
  if (channels.sms) {
    console.log("Sending SMS");
    try {
      await notifier.send({
        sms: {
          from: getSecret("NOTIFICATION_SMS_FROM") as string,
          to: getSecret("NOTIFICATION_SMS_TO") as string,
          text: message,
        },
      });
      console.log("Success SMS");
    } catch (error) {
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
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending Slack");
  }
  if (getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL")) {
    console.log("Sending Discord");
    try {
      await axios.post(getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL") as string, {
        content: message,
      });
      console.log("Success Discord");
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending Discord");
  }
  if (getSecret("NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL")) {
    console.log("Sending Google Chat");
    try {
      await axios.post(getSecret("NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL") as string, {
        text: message,
      });
      console.log("Success Google Chat");
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending Google Chat");
  }
  if (
    getSecret("NOTIFICATION_ZULIP_MESSAGE_URL") &&
    getSecret("NOTIFICATION_ZULIP_API_EMAIL") &&
    getSecret("NOTIFICATION_ZULIP_API_KEY")
  ) {
    console.log("Sending Zulip");
    try {
      await axios.request({
        method: "post",
        url: getSecret("NOTIFICATION_ZULIP_MESSAGE_URL") as string,
        auth: {
          username: getSecret("NOTIFICATION_ZULIP_API_EMAIL") as string,
          password: getSecret("NOTIFICATION_ZULIP_API_KEY") as string,
        },
        params: {
          content: message,
        },
      });
      console.log("Success Zulip");
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending Zulip");
  }
  if (getSecret("NOTIFICATION_MASTODON") && getSecret("NOTIFICATION_MASTODON_INSTANCE_URL") && getSecret("NOTIFICATION_MASTODON_API_KEY")) {
    console.log("Sending Mastodon");
    const instanceUrl = new URL(getSecret("NOTIFICATION_MASTODON_INSTANCE_URL") as string);
    const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;
    type MastodonVisibility = "public" | "unlisted" | "private" | "direct";
    let visibility: MastodonVisibility = "public";
    if (getSecret("NOTIFICATION_MASTODON_TOOT_VISIBILITY")) {
      try {
        visibility = getSecret("NOTIFICATION_MASTODON_TOOT_VISIBILITY") as MastodonVisibility;
      } catch (e) {
        console.log(`Unsupported Mastodon toot visibility mode: ${getSecret("NOTIFICATION_MASTODON_TOOT_VISIBILITY")}`);
      }
    }
    await axios.post(
      `${baseUrl}/v1/statuses`,
      {
        visibility: visibility,
        status: message,
      },
      { 
        headers: {
          "Authorization": `Bearer ${getSecret("NOTIFICATION_MASTODON_API_KEY")}`
        }
      }
    );
  }
  if (getSecret("NOTIFICATION_MISSKEY") && getSecret("NOTIFICATION_MISSKEY_INSTANCE_URL") && getSecret("NOTIFICATION_MISSKEY_API_KEY")) {
    console.log("Sending Misskey");
    const instanceUrl = new URL(getSecret("NOTIFICATION_MISSKEY_INSTANCE_URL") as string);
    const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;
    if (getSecret("NOTIFICATION_MISSKEY_CHAT") && getSecret("NOTIFICATION_MISSKEY_CHAT_USER_ID")) {
      await axios.post(
        `${baseUrl}/messaging/messages/create`,
        {
          i: getSecret("NOTIFICATION_MISSKEY_API_KEY") as string,
          userId: getSecret("NOTIFICATION_MISSKEY_CHAT_USER_ID"),
          text: message,
        }
      );
    }
    if (getSecret("NOTIFICATION_MISSKEY_NOTE")) {
      type MisskeyNoteVisibility = "public" | "home" | "followers" | "specified";
      let visibility: MisskeyNoteVisibility = "public";
      let visibleUserIds: string[] | undefined;
      if (getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBILITY")) {
        try {
          visibility = getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBILITY") as MisskeyNoteVisibility;
        } catch (e) {
          console.log(`Unsupported Misskey note visibility mode: ${getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBILITY")}`);
        }
      }
      if (visibility == "specified") {
        visibleUserIds = (getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBLE_USER_IDS") || "").split(",")
      }
      await axios.post(
        `${baseUrl}/notes/create`,
        {
          i: getSecret("NOTIFICATION_MISSKEY_API_KEY") as string,
          visibility: visibility,
          visibleUserIds: visibleUserIds,
          text: message,
        }
      );
    }
    console.log("Success Misskey");
  }
  if (getSecret("NOTIFICATION_TELEGRAM") && getSecret("NOTIFICATION_TELEGRAM_BOT_KEY")) {
    console.log("Sending Telegram");
    try {
      await axios.post(
        `https://api.telegram.org/bot${getSecret("NOTIFICATION_TELEGRAM_BOT_KEY")}/sendMessage`,
        {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          chat_id: getSecret("NOTIFICATION_TELEGRAM_CHAT_ID"),
          text: message.replace(/_/g, '\\_'),
        }
      );
      console.log("Success Telegram");
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending Telegram");
  }
  if (getSecret("NOTIFICATION_LARK")) {
    console.log("Sending Lark");
    try {
      await axios.post(
        `${getSecret("NOTIFICATION_LARK_BOT_WEBHOOK")}`,
        {
          "msg_type": "interactive",
          "card": {
            "config": {
              "wide_screen_mode": true
            },
            "elements": [
              {
                "tag": "markdown",
                "content": message.replace(/_/g, '\\_'),
              }
            ]
          }
        }
      );
      console.log("Success Lark");
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending Lark");
  }
  if (getSecret("NOTIFICATION_TEAMS")) {
    console.log("Sending Microsoft Teams");
    try {
      await axios.post(`${getSecret("NOTIFICATION_TEAMS_WEBHOOK_URL")}`, {
        "@context": "https://schema.org/extensions",
        "@type": "MessageCard",
        themeColor: "0072C6",
        text: message,
        summary: message
      });
      console.log("Success Microsoft Teams");
    } catch (error) {
      console.log("Got an error", error);
    }
    console.log("Finished sending Microsoft Teams");
  }
};
