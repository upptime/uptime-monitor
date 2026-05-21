jest.mock("./github", () => ({
  getOctokit: jest.fn(),
}));

jest.mock("./config", () => ({
  getConfig: jest.fn(),
}));

const loadWorkflowHelpers = () => {
  jest.resetModules();
  const { getOctokit } = require("./github") as typeof import("./github");
  const { getConfig } = require("./config") as typeof import("./config");
  const workflows = require("./workflows") as typeof import("./workflows");
  return { getConfig, getOctokit, ...workflows };
};

describe("workflow helpers", () => {
  it("falls back to tags when uptime-monitor has no GitHub releases", async () => {
    const { getOctokit, getUptimeMonitorVersion } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [] });
    const listTags = jest.fn().mockResolvedValue({ data: [{ name: "v1.41.2" }] });

    (getOctokit as jest.Mock).mockResolvedValue({
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

    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases, listTags },
    });

    await expect(getUptimeMonitorVersion()).resolves.toBe("v1.41.3");
    expect(listTags).toHaveBeenCalledWith({
      owner: "upptime",
      repo: "uptime-monitor",
      per_page: 1,
    });
  });

  it("generates workflows with the Node 24-compatible checkout action", async () => {
    const {
      getConfig,
      getOctokit,
      graphsCiWorkflow,
      responseTimeCiWorkflow,
      setupCiWorkflow,
      siteCiWorkflow,
      summaryCiWorkflow,
      updateTemplateCiWorkflow,
      updatesCiWorkflow,
      uptimeCiWorkflow,
    } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.4" }] });
    const listTags = jest.fn();

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      commitMessages: {},
      "status-website": {},
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases, listTags },
    });

    const workflows = await Promise.all([
      graphsCiWorkflow(),
      responseTimeCiWorkflow(),
      setupCiWorkflow(),
      siteCiWorkflow(),
      summaryCiWorkflow(),
      updateTemplateCiWorkflow(),
      updatesCiWorkflow(),
      uptimeCiWorkflow(),
    ]);

    for (const workflow of workflows) {
      expect(workflow).toContain("uses: actions/checkout@v5");
      expect(workflow).not.toContain("actions/checkout@v4");
    }
    expect(listTags).not.toHaveBeenCalled();
  });
});
