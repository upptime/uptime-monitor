import NotifMeSdk from "notifme-sdk";
import { NotificationChannels } from "../types";
import { SMSConfig } from "../../../interfaces";
/**
 * Check if a sms should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendSMS(): boolean;
/**
 * Setup the SMS channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
export declare function setupNotifierSMSChannel(channels: NotificationChannels): void;
/**
 * Send a SMS
 *
 * @params notifier NotifMeSdk
 * @params message string
 * @returns Promise<void>
 */
export declare function sendSMS(notifier: NotifMeSdk, defaultMessage: string, config?: SMSConfig): Promise<void>;
