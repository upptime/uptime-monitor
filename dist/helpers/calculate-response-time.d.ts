import { Downtimes } from "../interfaces";
export declare const getResponseTimeForSite: (slug: string) => Promise<Omit<Downtimes & {
    currentStatus: "up" | "down" | "degraded";
}, "dailyMinutesDown">>;
