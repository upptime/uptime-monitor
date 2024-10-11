import { MisskeyConfig, MisskeyNoteVisibility } from "../../../interfaces";
import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";

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
export async function sendMisskeyMsg(defaultMessage: string, config?: MisskeyConfig) {
  const { method, url, apiKey, misskeyNoteVisibility, userId, userIdsString, message } =
    config ?? {};

  core.info("Sending misskey message");

  const instanceUrl = new URL(url || (getSecret("NOTIFICATION_MISSKEY_INSTANCE_URL") as string));
  const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;
  const apiKeyToSend = apiKey || getSecret("NOTIFICATION_MISSKEY_API_KEY");
  const userIdToSend = userId || getSecret("NOTIFICATION_MISSKEY_CHAT_USER_ID");
  const messageToSend = message || defaultMessage;
  const methodToSend =
    method || getSecret("NOTIFICATION_MISSKEY_CHAT") || getSecret("NOTIFICATION_MISSKEY_NOTE");

  core.debug(`URL: ${baseUrl}`);
  core.debug(`Message: ${messageToSend}`);
  core.debug(`Visibility: ${misskeyNoteVisibility}`);
  core.debug(`Method: ${methodToSend}`);
  core.debug(`User ID: ${userIdToSend}`);
  core.debug(`Visible User IDs: ${userIdsString}`);

  if (methodToSend === "chat" && userIdToSend) {
    await axios.post(`${baseUrl}/messaging/messages/create`, {
      i: getSecret("NOTIFICATION_MISSKEY_API_KEY") as string,
      userId: getSecret("NOTIFICATION_MISSKEY_CHAT_USER_ID"),
      text: messageToSend,
    });
  }
  if (methodToSend === "note") {
    let visibility: MisskeyNoteVisibility = "public";
    let visibleUserIds: string[] | undefined;
    if (getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBILITY")) {
      try {
        visibility =
          misskeyNoteVisibility ||
          (getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBILITY") as MisskeyNoteVisibility);
      } catch (e) {
        core.error("Unsupported Misskey note visibility mode:");
      }
    }
    if (visibility == "specified") {
      visibleUserIds = (
        userIdsString ||
        getSecret("NOTIFICATION_MISSKEY_NOTE_VISIBLE_USER_IDS") ||
        ""
      ).split(",");
    }
    await axios.post(`${baseUrl}/notes/create`, {
      i: apiKeyToSend,
      visibility: visibility,
      visibleUserIds: visibleUserIds,
      text: messageToSend,
    });
  }
  console.log("Success Misskey");
}
