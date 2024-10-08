import { getSecret } from "../../secrets";
import axios from "axios";

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
export async function sendTelegramMsg(message: string) {
  try {
    const chatIds = getSecret("NOTIFICATION_TELEGRAM_CHAT_ID")?.split(",") ?? [];
    for (const chatId of chatIds) {
      await axios.post(
        `https://api.telegram.org/bot${getSecret("NOTIFICATION_TELEGRAM_BOT_KEY")}/sendMessage`,
        {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
          chat_id: chatId.trim(),
          text: message.replace(/_/g, "\\_"),
        }
      );
    }
    console.log("Success Telegram");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending Telegram");
}
