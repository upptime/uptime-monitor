import NotifMeSdk from "notifme-sdk";
import { NotificationChannels } from "../types";
import { EmailConfig } from "../../../interfaces";
/**
 * Check if a mail should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendMail(): boolean;
/**
 * Setup the email channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
export declare function setupNotifierEmailChannel(channels: NotificationChannels): void;
/**
 * Send Email via NotifMeSdk
 *
 * @param notifier
 * @param message
 * @returns Promise<void>
 */
export declare function sendEmail(notifier: NotifMeSdk, defaultMessage: string, config?: EmailConfig): Promise<void>;
