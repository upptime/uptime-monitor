jest.mock("./github", () => ({
  getOctokit: jest.fn(),
}));

const { getOctokit } = require("./github") as typeof import("./github");
const { getUptimeMonitorVersion } = require("./workflows") as typeof import("./workflows");

describe("workflow helpers", () => {
  it("falls back to tags when uptime-monitor has no GitHub releases", async () => {
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
});
