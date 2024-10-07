import NotifMeSdk from "notifme-sdk";
import { getSecret } from "../../secrets";

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
