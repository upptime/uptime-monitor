import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

jest.mock("./github", () => ({
  getOctokit: jest.fn(),
}));

jest.mock("./secrets", () => ({
  getOwnerRepo: jest.fn(),
}));

const loadCalculateUptimeHelpers = () => {
  jest.resetModules();
  const { getOctokit } = require("./github") as typeof import("./github");
  const { getOwnerRepo } = require("./secrets") as typeof import("./secrets");
  const { getUptimePercentForSite } = require("./calculate-uptime") as typeof import("./calculate-uptime");
  return { getOctokit, getOwnerRepo, getUptimePercentForSite };
};

describe("calculate uptime", () => {
  const originalCwd = process.cwd();
  let cwd: string;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-27T00:00:00Z"));
    cwd = mkdtempSync(join(tmpdir(), "upptime-uptime-test-"));
    mkdirSync(join(cwd, "history"));
    writeFileSync(
      join(cwd, "history", "example.yml"),
      [
        "url: https://example.com",
        "status: up",
        "code: 200",
        "responseTime: 100",
        "lastUpdated: 2026-03-27T00:00:00Z",
        "startTime: 2026-03-20T00:00:00Z",
        "generator: Upptime <https://github.com/upptime/upptime>",
      ].join("\n")
    );
    process.chdir(cwd);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(cwd, { recursive: true, force: true });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("counts overlapping downtime incidents only once", async () => {
    const { getOctokit, getOwnerRepo, getUptimePercentForSite } = loadCalculateUptimeHelpers();
    const listForRepo = jest.fn().mockResolvedValue({
      data: [
        {
          created_at: "2026-03-26T00:00:00Z",
          closed_at: "2026-03-26T02:00:00Z",
        },
        {
          created_at: "2026-03-26T01:00:00Z",
          closed_at: "2026-03-26T03:00:00Z",
        },
      ],
    });

    (getOwnerRepo as jest.Mock).mockReturnValue(["owner", "repo"]);
    (getOctokit as jest.Mock).mockResolvedValue({
      issues: { listForRepo },
    });

    const uptime = await getUptimePercentForSite("example");

    expect(uptime.day).toBe("87.50%");
    expect(uptime.dailyMinutesDown["2026-03-26"]).toBe(180);
    expect(listForRepo).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      labels: "status,example",
      filter: "all",
      state: "all",
      per_page: 100,
    });
  });
});
