import { Downtimes } from "../interfaces";
export declare const getResponseTimeForSite: (slug: string) => Promise<Pick<Downtimes & {
    currentStatus: "up" | "down" | "degraded";
}, "all" | "day" | "month" | "year" | "week" | "currentStatus">>;
