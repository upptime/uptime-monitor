import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";
import { DiscordConfig } from "../../../interfaces";

/**
 * Check if a discord message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendDiscordMsg() {
  if (getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL")) {
    return true;
  }
  return false;
}

export async function sendDiscordMsg(defaultMessage: string, config?: DiscordConfig) {
  const { url, message } = config ?? {};

  core.info("Sending discord message");
  core.debug(`URL: ${url}`);
  core.debug(`Message: ${message}`);

  const urlToSend = url || getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL");
  const messageToSend = message || defaultMessage;
  try {
    await axios.post(urlToSend, {
      content: messageToSend,
    });
    core.info("Success Discord");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Discord");
}
