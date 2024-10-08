import { MisskeyNoteVisibility } from "../../../interfaces";
import { getSecret } from "../../secrets";
import axios from "axios";

/**
 * Check if a misskey message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendMisskeyMsg() {
  if (
    getSecret("NOTIFICATION_MISSKEY") &&
    getSecret("NOTIFICATION_MISSKEY_INSTANCE_URL") &&
    getSecret("NOTIFICATION_MISSKEY_API_KEY")
  ) {
    return true;
  }
  return false;
}

/**
 * Send a misskey message
 *
 * @param message
 * @returns Promise<void>
 */
export async function sendMisskeyMsg(message: string) {
  const instanceUrl = new URL(getSecret("NOTIFICATION_MISSKEY_INSTANCE_URL") as string);
  const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;
  if (getSecret("NOTIFICATION_MISSKEY_CHAT") && getSecret("NOTIFICATION_MISSKEY_CHAT_USER_ID")) {
    await axios.post(`${baseUrl}/messaging/messages/create`, {
      i: getSecret("NOTIFICATION_MISSKEY_API_KEY") as string,
      userId: getSecret("NOTIFICATION_MISSKEY_CHAT_USER_ID"),
      text: message,
    });
  }
  if (getSecret("NOTIFICATION_MISSKEY_NOTE")) {
    let visibility: MisskeyNoteVisibility = "public";
    let visibleUserIds: string[] | undefined;
    if (getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBILITY")) {
      try {
        visibility = getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBILITY") as MisskeyNoteVisibility;
      } catch (e) {
        console.log(
          `Unsupported Misskey note visibility mode: ${getSecret(
            "NOTIFICATION_MISSKEY_NOTE_VISIBILITY"
          )}`
        );
      }
    }
    if (visibility == "specified") {
      visibleUserIds = (getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBLE_USER_IDS") || "").split(",");
    }
    await axios.post(`${baseUrl}/notes/create`, {
      i: getSecret("NOTIFICATION_MISSKEY_API_KEY") as string,
      visibility: visibility,
      visibleUserIds: visibleUserIds,
      text: message,
    });
  }
  console.log("Success Misskey");
}
