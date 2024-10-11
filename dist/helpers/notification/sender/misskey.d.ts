import { MisskeyConfig } from "../../../interfaces";
/**
 * Check if a misskey message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendMisskeyMsg(): boolean;
/**
 * Send a misskey message
 *
 * @param message
 * @returns Promise<void>
 */
export declare function sendMisskeyMsg(defaultMessage: string, config?: MisskeyConfig): Promise<void>;
