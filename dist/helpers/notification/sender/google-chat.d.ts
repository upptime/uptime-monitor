import { GoogleChatConfig } from "../../../interfaces";
/**
 * Check if a google chat message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendGoogleChatMsg(): boolean;
export declare function sendGoogleChatMsg(defaultMessage: string, config?: GoogleChatConfig): Promise<void>;
