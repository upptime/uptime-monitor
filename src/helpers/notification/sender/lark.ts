import { getSecret } from "../../secrets";
import axios from "axios";

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
export async function sendLarkMsg(message: string) {
  try {
    await axios.post(`${getSecret("NOTIFICATION_LARK_BOT_WEBHOOK")}`, {
      msg_type: "interactive",
      card: {
        config: {
          wide_screen_mode: true,
        },
        elements: [
          {
            tag: "markdown",
            content: message.replace(/_/g, "\\_"),
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
