import { UpptimeConfig } from "../interfaces";
export declare const curl: (site: UpptimeConfig["sites"][0]) => Promise<{
    httpCode: number;
    totalTime: number;
    data: string;
}>;
