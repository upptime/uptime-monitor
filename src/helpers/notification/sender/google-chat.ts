import { getSecret } from "../../secrets";
import axios from "axios";

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

export async function sendGoogleChatMsg(message: string) {
  try {
    await axios.post(getSecret("NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL") as string, {
      text: message,
    });
    console.log("Success Google Chat");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending Google Chat");
}
