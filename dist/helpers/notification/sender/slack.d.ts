import NotifMeSdk from "notifme-sdk";
import { NotificationChannels } from "../types";
import { SlackConfig } from "../../../interfaces";
/**
 * Check if a slack message should be sent
 *
 * @returns boolean
 */
export declare function checkMaybeSendSlackMsg(): boolean;
/**
 * Setup the slack channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
export declare function setupNotifierSlackChannel(channels: NotificationChannels): void;
/**
 * Send a slack message via NotifMeSdk
 *
 * @param notifier
 * @param message
 * @returns Promise<void>
 */
export declare function sendSlackMsg(notifier: NotifMeSdk, defaultMessage: string, config?: SlackConfig): Promise<void>;
