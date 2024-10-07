import { getSecret } from "../../secrets";
import axios from "axios";

/**
 * Check if a discord message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendDiscordMsg() {
  if (getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL")) {
    return true;
  }
  return false;
}

export async function sendDiscordMsg(message: string) {
  try {
    await axios.post(getSecret("NOTIFICATION_DISCORD_WEBHOOK_URL") as string, {
      content: message,
    });
    console.log("Success Discord");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending Discord");
}
