import NotifMeSdk from "notifme-sdk";
import { getSecret } from "../../secrets";
import { NotificationChannels } from "../types";

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

/**
 * Setup the slack channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
export function setupNotifierSlackChannel(channels: NotificationChannels) {
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

/**
 * Send a slack message via NotifMeSdk
 *
 * @param notifier
 * @param message
 * @returns Promise<void>
 */
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
