declare const loadResponseTimeHelpers: () => {
    getOctokit: () => Promise<import("@octokit/rest").Octokit>;
    getOwnerRepo: () => [string, string];
    getResponseTimeForSite: (slug: string) => Promise<Omit<import("../interfaces").Downtimes & {
        currentStatus: "up" | "down" | "degraded";
    }, "dailyMinutesDown">>;
};
