import { getSecret } from "../../secrets";
import axios from "axios";

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
export async function sendMSTeamsMsg(message: string) {
  try {
    await axios.post(`${getSecret("NOTIFICATION_TEAMS_WEBHOOK_URL")}`, {
      "@context": "https://schema.org/extensions",
      "@type": "MessageCard",
      themeColor: "0072C6",
      text: message,
      summary: message,
    });
    console.log("Success Microsoft Teams");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending Microsoft Teams");
}
