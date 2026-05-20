"use strict";
jest.mock("./github", () => ({
    getOctokit: jest.fn(),
}));
const loadWorkflowHelpers = () => {
    jest.resetModules();
    const { getOctokit } = require("./github");
    const { getUptimeMonitorVersion } = require("./workflows");
    return { getOctokit, getUptimeMonitorVersion };
};
describe("workflow helpers", () => {
    it("falls back to tags when uptime-monitor has no GitHub releases", async () => {
        const { getOctokit, getUptimeMonitorVersion } = loadWorkflowHelpers();
        const listReleases = jest.fn().mockResolvedValue({ data: [] });
        const listTags = jest.fn().mockResolvedValue({ data: [{ name: "v1.41.2" }] });
        getOctokit.mockResolvedValue({
            repos: { listReleases, listTags },
        });
        await expect(getUptimeMonitorVersion()).resolves.toBe("v1.41.2");
        expect(listReleases).toHaveBeenCalledWith({
            owner: "upptime",
            repo: "uptime-monitor",
            per_page: 1,
        });
        expect(listTags).toHaveBeenCalledWith({
            owner: "upptime",
            repo: "uptime-monitor",
            per_page: 1,
        });
    });
    it("falls back to tags when listing GitHub releases fails", async () => {
        const { getOctokit, getUptimeMonitorVersion } = loadWorkflowHelpers();
        const listReleases = jest.fn().mockRejectedValue(new Error("rate limited"));
        const listTags = jest.fn().mockResolvedValue({ data: [{ name: "v1.41.3" }] });
        getOctokit.mockResolvedValue({
            repos: { listReleases, listTags },
        });
        await expect(getUptimeMonitorVersion()).resolves.toBe("v1.41.3");
        expect(listTags).toHaveBeenCalledWith({
            owner: "upptime",
            repo: "uptime-monitor",
            per_page: 1,
        });
    });
});
//# sourceMappingURL=workflows.spec.js.map