import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";
import { ZulipConfig } from "../../../interfaces";

/**
 * Check if a zulip message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendZulipMsg() {
  if (
    getSecret("NOTIFICATION_ZULIP_MESSAGE_URL") &&
    getSecret("NOTIFICATION_ZULIP_API_EMAIL") &&
    getSecret("NOTIFICATION_ZULIP_API_KEY")
  ) {
    return true;
  }
  return false;
}

export async function sendZulipMsg(defaultMessage: string, config?: ZulipConfig) {
  const { url, apiUsername, apiKey, message } = config ?? {};

  core.info("Sending zulip message");

  const urlToSend = url || getSecret("NOTIFICATION_ZULIP_MESSAGE_URL");
  const apiUsernameToSend = apiUsername || getSecret("NOTIFICATION_ZULIP_API_EMAIL");
  const apiKeyToSend = apiKey || getSecret("NOTIFICATION_ZULIP_API_KEY");
  const messageToSend = message || defaultMessage;

  core.debug(`URL: ${urlToSend}`);
  core.debug(`Message: ${messageToSend}`);

  try {
    await axios.request({
      method: "post",
      url: urlToSend,
      auth: {
        username: apiUsernameToSend,
        password: apiKeyToSend,
      },
      params: {
        content: messageToSend,
      },
    });
    core.info("Success Zulip");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Zulip");
}
