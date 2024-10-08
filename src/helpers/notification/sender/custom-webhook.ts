import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";
import { CustomWebhookConfig } from "../../../interfaces";

/**
 * Check if a custom webhook message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendCustomWebhookMsg() {
  if (getSecret("NOTIFICATION_CUSTOM_WEBHOOK")) {
    return true;
  }
  return false;
}

export async function sendCustomWebhookMsg(defaultMessage: string, config?: CustomWebhookConfig) {
  const { url, message } = config ?? {};

  core.info("Sending custom webhook message");
  core.debug(`URL: ${url}`);
  core.debug(`Message: ${message}`);

  const urlToSend = url || getSecret("NOTIFICATION_CUSTOM_WEBHOOK_URL");
  const messageToSend = message || defaultMessage;
  try {
    await axios.post(
      urlToSend,
      {
        data: {
          message: JSON.stringify(messageToSend),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    core.info("Success Custom Webhook");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Custom Webhook");
}
