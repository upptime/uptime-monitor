import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";

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

export async function sendDiscordMsg(message: string, url?: string) {
  core.info("Sending discord message");
  core.debug(`URL: ${url}`);
  core.debug(`Message: ${message}`);

  const urlToSend = url || getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL");
  try {
    await axios.post(urlToSend, {
      content: message,
    });
    core.info("Success Discord");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Discord");
}
