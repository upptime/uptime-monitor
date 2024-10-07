import { getSecret } from "../../secrets";
import axios from "axios";

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

export async function sendZulipMsg(message: string) {
  try {
    await axios.request({
      method: "post",
      url: getSecret("NOTIFICATION_ZULIP_MESSAGE_URL") as string,
      auth: {
        username: getSecret("NOTIFICATION_ZULIP_API_EMAIL") as string,
        password: getSecret("NOTIFICATION_ZULIP_API_KEY") as string,
      },
      params: {
        content: message,
      },
    });
    console.log("Success Zulip");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending Zulip");
}
