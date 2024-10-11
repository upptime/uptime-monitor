import { TelegramConfig } from "../../../interfaces";
import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";

/**
 * Check if a telegram message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendTelegramMsg() {
  if (getSecret("NOTIFICATION_TELEGRAM") && getSecret("NOTIFICATION_TELEGRAM_BOT_KEY")) {
    return true;
  }
  return false;
}

/**
 * Send a telegram message
 *
 * @param message
 * @returns Promise<void>
 */
export async function sendTelegramMsg(defaultMessage: string, config?: TelegramConfig) {
  const { chatIdsString, message } = config ?? {};

  core.info("Sending telegram message");

  const chatIds = (chatIdsString || getSecret("NOTIFICATION_TELEGRAM_CHAT_ID")).split(",") ?? [];
  const messageToSend = message || defaultMessage;

  core.debug(`Chat IDs: ${chatIds}`);
  core.debug(`Message: ${messageToSend}`);

  try {
    for (const chatId of chatIds) {
      await axios.post(
        `https://api.telegram.org/bot${getSecret("NOTIFICATION_TELEGRAM_BOT_KEY")}/sendMessage`,
        {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          chat_id: chatId.trim(),
          text: messageToSend.replace(/_/g, "\\_"),
        }
      );
    }
    core.info("Success Telegram");
  } catch (error: any) {
    core.error(error);
  }
  core.info("Finished sending Telegram");
}
