import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";
import { MSTeamsConfig } from "../../../interfaces";

/**
 * Check if a ms teams message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendMSTeamsMsg() {
  if (getSecret("NOTIFICATION_TEAMS")) {
    return true;
  }
  return false;
}

/**
 * Send a ms teams message
 *
 * @param message
 * @returns Promise<void>
 */
export async function sendMSTeamsMsg(defaultMessage: string, config?: MSTeamsConfig) {
  const { message, url, themeColor, summary } = config ?? {};

  core.info("Sending ms teams message");

  const urlToSend = url || getSecret("NOTIFICATION_TEAMS_WEBHOOK_URL");
  const messageToSend = message || defaultMessage;
  const themeColorToSend = themeColor || "0072C6";
  const summaryToSend = summary || defaultMessage;

  core.debug(`URL: ${urlToSend}`);
  core.debug(`Message: ${messageToSend}`);
  core.debug(`Theme Color: ${themeColorToSend}`);
  core.debug(`Summary: ${summaryToSend}`);

  try {
    await axios.post(urlToSend, {
      "@context": "https://schema.org/extensions",
      "@type": "MessageCard",
      themeColor: themeColorToSend,
      text: messageToSend,
      summary: summaryToSend,
    });
    core.info("Success Microsoft Teams");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Microsoft Teams");
}
