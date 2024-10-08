import NotifMeSdk from "notifme-sdk";
import { getSecret } from "../../secrets";
import { NotificationChannels } from "../types";

/**
 * Check if a sms should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendSMS() {
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
    return true;
  }
  return false;
}

/**
 * Setup the SMS channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
export function setupNotifierSMSChannel(channels: NotificationChannels) {
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

/**
 * Send a SMS
 *
 * @params notifier NotifMeSdk
 * @params message string
 * @returns Promise<void>
 */
export async function sendSMS(notifier: NotifMeSdk, message: string) {
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
