import NotifMeSdk from "notifme-sdk";
import { getSecret } from "../../secrets";
import { NotificationChannels } from "../types";
import { SlackConfig } from "../../../interfaces";
import * as core from "@actions/core";

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
export async function sendSlackMsg(
  notifier: NotifMeSdk,
  defaultMessage: string,
  config?: SlackConfig
) {
  const { message, customUrl } = config ?? {};

  // if customUrl is provided, override the default notifier config
  if (customUrl) {
    notifier = new NotifMeSdk({
      channels: {
        slack: {
          providers: [
            {
              type: "webhook",
              webhookUrl: customUrl,
            },
          ],
        },
      },
    });
  }

  core.info("Sending slack message");

  const messageToSend = message || defaultMessage;

  core.debug(`Message: ${messageToSend}`);

  try {
    await notifier.send({
      slack: {
        text: messageToSend,
      },
    });
    core.info("Success Slack");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Slack");
}
