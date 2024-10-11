import { DiscordConfig } from "../../../interfaces";
/**
 * Check if a discord message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendDiscordMsg(): boolean;
export declare function sendDiscordMsg(defaultMessage: string, config?: DiscordConfig): Promise<void>;
