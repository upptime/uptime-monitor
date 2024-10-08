import { MastodonVisibility } from "../../../interfaces";
import { getSecret } from "../../secrets";
import axios from "axios";

/**
 * Check if a mastodon message should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendMastodonMsg() {
  if (
    getSecret("NOTIFICATION_MASTODON") &&
    getSecret("NOTIFICATION_MASTODON_INSTANCE_URL") &&
    getSecret("NOTIFICATION_MASTODON_API_KEY")
  ) {
    return true;
  }
  return false;
}

/**
 * Send a mastodon message
 *
 * @param message
 * @returns Promise<void>
 */
export async function sendMastodonMsg(message: string) {
  const instanceUrl = new URL(getSecret("NOTIFICATION_MASTODON_INSTANCE_URL") as string);
  const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;

  let visibility: MastodonVisibility = "public";
  if (getSecret("NOTIFICATION_MASTODON_TOOT_VISIBILITY")) {
    try {
      visibility = getSecret("NOTIFICATION_MASTODON_TOOT_VISIBILITY") as MastodonVisibility;
    } catch (e) {
      console.log(
        `Unsupported Mastodon toot visibility mode: ${getSecret(
          "NOTIFICATION_MASTODON_TOOT_VISIBILITY"
        )}`
      );
    }
  }
  await axios.post(
    `${baseUrl}/v1/statuses`,
    {
      visibility: visibility,
      status: message,
    },
    {
      headers: {
        Authorization: `Bearer ${getSecret("NOTIFICATION_MASTODON_API_KEY")}`,
      },
    }
  );
}
