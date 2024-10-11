import { LarkConfig } from "../../../interfaces";
/**
 * Check if a lark message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendLarkMsg(): boolean;
/**
 * Send a lark message
 *
 * @param message
 * @returns Promise<void>
 */
export declare function sendLarkMsg(defaultMessage: string, config?: LarkConfig): Promise<void>;
