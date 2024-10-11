import { ZulipConfig } from "../../../interfaces";
/**
 * Check if a zulip message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendZulipMsg(): boolean;
export declare function sendZulipMsg(defaultMessage: string, config?: ZulipConfig): Promise<void>;
