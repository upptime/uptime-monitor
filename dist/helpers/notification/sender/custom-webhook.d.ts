import { CustomWebhookConfig } from "../../../interfaces";
/**
 * Check if a custom webhook message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendCustomWebhookMsg(): boolean;
export declare function sendCustomWebhookMsg(defaultMessage: string, config?: CustomWebhookConfig): Promise<void>;
