import { MastodonConfig } from "../../../interfaces";
/**
 * Check if a mastodon message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendMastodonMsg(): boolean;
/**
 * Send a mastodon message
 *
 * @param message
 * @returns Promise<void>
 */
export declare function sendMastodonMsg(defaultMessage: string, config?: MastodonConfig): Promise<void>;
