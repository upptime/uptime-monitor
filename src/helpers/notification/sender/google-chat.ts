import { GoogleChatConfig } from "../../../interfaces";
import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";

/**
 * Check if a google chat message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendGoogleChatMsg() {
  if (getSecret("NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL")) {
    return true;
  }
  return false;
}

export async function sendGoogleChatMsg(defaultMessage: string, config?: GoogleChatConfig) {
  const { message, url } = config ?? {};

  core.info("Sending google chat message");

  const urlToSend = url || getSecret("NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL");
  const messageToSend = message || defaultMessage;

  core.debug(`URL: ${urlToSend}`);
  core.debug(`Message: ${messageToSend}`);

  try {
    await axios.post(urlToSend, {
      text: messageToSend,
    });
    core.info("Success Google Chat");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Google Chat");
}
