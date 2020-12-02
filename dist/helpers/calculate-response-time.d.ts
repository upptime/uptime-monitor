import { Downtimes } from "../interfaces";
export declare const getResponseTimeForSite: (slug: string) => Promise<Downtimes & {
    currentStatus: "up" | "down" | "degraded";
}>;
