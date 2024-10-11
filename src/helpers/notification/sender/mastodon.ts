import { MastodonConfig, MastodonVisibility } from "../../../interfaces";
import { getSecret } from "../../secrets";
import axios from "axios";
import * as core from "@actions/core";

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
export async function sendMastodonMsg(defaultMessage: string, config?: MastodonConfig) {
  const { message, url, apiKey, tootVisibility } = config ?? {};

  core.info("Sending mastodon message");

  const instanceUrl = new URL(url || (getSecret("NOTIFICATION_MASTODON_INSTANCE_URL") as string));
  const messageToSend = message || defaultMessage;
  const baseUrl = `${instanceUrl.protocol}://${instanceUrl.hostname}/api`;
  const apiKeyToSend = apiKey || getSecret("NOTIFICATION_MASTODON_API_KEY");

  core.debug(`URL: ${baseUrl}`);
  core.debug(`Message: ${messageToSend}`);
  core.debug(`Visibility: ${tootVisibility}`);

  let visibility: MastodonVisibility = "public";
  if (tootVisibility || getSecret("NOTIFICATION_MASTODON_TOOT_VISIBILITY")) {
    try {
      visibility =
        tootVisibility ||
        (getSecret("NOTIFICATION_MASTODON_TOOT_VISIBILITY") as MastodonVisibility);
    } catch (e) {
      core.error('Unsupported Mastodon toot visibility mode');
    }
  }
  await axios.post(
    `${baseUrl}/v1/statuses`,
    {
      visibility: visibility,
      status: messageToSend,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKeyToSend}`,
      },
    }
  );
}
