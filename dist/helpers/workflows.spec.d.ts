declare const loadWorkflowHelpers: () => {
    getUptimeMonitorVersion: () => Promise<string>;
    graphsCiWorkflow: () => Promise<string>;
    responseTimeCiWorkflow: () => Promise<string>;
    setupCiWorkflow: () => Promise<string>;
    siteCiWorkflow: () => Promise<string>;
    summaryCiWorkflow: () => Promise<string>;
    updateTemplateCiWorkflow: () => Promise<string>;
    updatesCiWorkflow: () => Promise<string>;
    uptimeCiWorkflow: () => Promise<string>;
    getConfig: () => Promise<import("../interfaces").UpptimeConfig>;
    getOctokit: () => Promise<import("@octokit/rest").Octokit>;
};
