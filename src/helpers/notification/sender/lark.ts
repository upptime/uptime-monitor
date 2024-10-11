import { LarkConfig } from "../../../interfaces";
import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";

/**
 * Check if a lark message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendLarkMsg() {
  if (getSecret("NOTIFICATION_LARK")) {
    return true;
  }
  return false;
}

/**
 * Send a lark message
 *
 * @param message
 * @returns Promise<void>
 */
export async function sendLarkMsg(defaultMessage: string, config?: LarkConfig) {
  const { message, url } = config ?? {};

  core.info("Sending lark message");

  const urlToSend = url || getSecret("NOTIFICATION_LARK_BOT_WEBHOOK");
  const messageToSend = message || defaultMessage;

  core.debug(`URL: ${urlToSend}`);
  core.debug(`Message: ${messageToSend}`);

  try {
    await axios.post(urlToSend, {
      msg_type: "interactive",
      card: {
        config: {
          wide_screen_mode: true,
        },
        elements: [
          {
            tag: "markdown",
            content: messageToSend.replace(/_/g, "\\_"),
          },
        ],
      },
    });
    console.log("Success Lark");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending Lark");
}
