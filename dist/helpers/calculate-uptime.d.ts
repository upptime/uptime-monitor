import { DownPecentages } from "../interfaces";
/**
 * Get the uptime percentage for a website
 * @returns Percent string, e.g., 94.43%
 * @param slug - Slug of the site
 */
export declare const getUptimePercentForSite: (slug: string) => Promise<DownPecentages>;
