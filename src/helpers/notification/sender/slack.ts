import NotifMeSdk from "notifme-sdk";
import { getSecret } from "../../secrets";

/**
 * Check if a slack message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendSlackMsg() {
  if (getSecret("NOTIFICATION_SLACK")) {
    return true;
  }
  return false;
}

export async function sendSlackMsg(notifier: NotifMeSdk, message: string) {
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
