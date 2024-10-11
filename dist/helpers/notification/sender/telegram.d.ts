import { TelegramConfig } from "../../../interfaces";
/**
 * Check if a telegram message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendTelegramMsg(): boolean;
/**
 * Send a telegram message
 *
 * @param message
 * @returns Promise<void>
 */
export declare function sendTelegramMsg(defaultMessage: string, config?: TelegramConfig): Promise<void>;
