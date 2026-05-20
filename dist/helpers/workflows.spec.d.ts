declare const loadWorkflowHelpers: () => {
    getOctokit: () => Promise<import("@octokit/rest").Octokit>;
    getUptimeMonitorVersion: () => Promise<string>;
};
