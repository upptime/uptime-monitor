import { MSTeamsConfig } from "../../../interfaces";
/**
 * Check if a ms teams message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendMSTeamsMsg(): boolean;
/**
 * Send a ms teams message
 *
 * @param message
 * @returns Promise<void>
 */
export declare function sendMSTeamsMsg(defaultMessage: string, config?: MSTeamsConfig): Promise<void>;
