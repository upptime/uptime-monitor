import { CustomNotification } from "../interfaces";
export declare const sendCustomNotification: (config: CustomNotification, message: string) => Promise<void>;
export declare const sendNotification: (message: string) => Promise<void>;
