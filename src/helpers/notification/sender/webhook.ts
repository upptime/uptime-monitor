import { getSecret } from "../../secrets";
import axios from "axios";

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

export async function sendCustomWebhookMsg(message: string) {
  try {
    await axios.post(
      `${getSecret("NOTIFICATION_CUSTOM_WEBHOOK_URL")}`,
      {
        data: {
          message: JSON.stringify(message),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Success Webhook");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending Webhook");
}
