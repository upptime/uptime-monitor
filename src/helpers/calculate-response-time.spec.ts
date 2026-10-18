jest.mock("./github", () => ({
  getOctokit: jest.fn(),
}));

jest.mock("./secrets", () => ({
  getOwnerRepo: jest.fn(),
}));

jest.mock("./config", () => ({
  getConfig: jest.fn().mockResolvedValue({}),
}));

const loadResponseTimeHelpers = () => {
  jest.resetModules();
  const { getOctokit } = require("./github") as typeof import("./github");
  const { getOwnerRepo } = require("./secrets") as typeof import("./secrets");
  const { getResponseTimeForSite } = require("./calculate-response-time") as typeof import(
    "./calculate-response-time"
  );
  return { getOctokit, getOwnerRepo, getResponseTimeForSite };
};

describe("calculate response time", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-27T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const commit = (message: string, date = "2026-03-26T12:00:00Z") => ({
    commit: { message, author: { date } },
  });

  it("parses response time from a normal commit message", async () => {
    const { getOctokit, getOwnerRepo, getResponseTimeForSite } = loadResponseTimeHelpers();
    const listCommits = jest.fn().mockResolvedValue({
      data: [commit("🟩 Example is up (200 in 123 ms) [skip ci] [upptime]")],
    });

    (getOwnerRepo as jest.Mock).mockReturnValue(["owner", "repo"]);
    (getOctokit as jest.Mock).mockResolvedValue({ repos: { listCommits } });

    const result = await getResponseTimeForSite("example");

    expect(result.day).toBe(123);
    expect(result.week).toBe(123);
    expect(result.month).toBe(123);
    expect(result.year).toBe(123);
    expect(result.all).toBe(123);
    expect(result.currentStatus).toBe("up");
  });

  it("parses response time when the site name contains ' in '", async () => {
    const { getOctokit, getOwnerRepo, getResponseTimeForSite } = loadResponseTimeHelpers();
    const listCommits = jest.fn().mockResolvedValue({
      data: [commit("🟩 Signing in is up (200 in 337 ms) [skip ci] [upptime]")],
    });

    (getOwnerRepo as jest.Mock).mockReturnValue(["owner", "repo"]);
    (getOctokit as jest.Mock).mockResolvedValue({ repos: { listCommits } });

    const result = await getResponseTimeForSite("signing-in");

    expect(result.day).toBe(337);
    expect(result.all).toBe(337);
    expect(result.currentStatus).toBe("up");
  });

  it("parses degraded and down commit messages for sites containing ' in '", async () => {
    const { getOctokit, getOwnerRepo, getResponseTimeForSite } = loadResponseTimeHelpers();
    const listCommits = jest.fn().mockResolvedValue({
      data: [
        commit("🟥 Sign in page is down (500 in 321 ms) [skip ci] [upptime]", "2026-03-26T06:00:00Z"),
        commit("🟨 Sign in page is degraded (200 in 500 ms) [skip ci] [upptime]", "2026-03-25T00:00:00Z"),
      ],
    });

    (getOwnerRepo as jest.Mock).mockReturnValue(["owner", "repo"]);
    (getOctokit as jest.Mock).mockResolvedValue({ repos: { listCommits } });

    const result = await getResponseTimeForSite("sign-in-page");

    expect(result.all).toBe(411);
    expect(result.day).toBe(321);
    expect(result.currentStatus).toBe("down");
  });

  it("ignores commits without a parseable response time", async () => {
    const { getOctokit, getOwnerRepo, getResponseTimeForSite } = loadResponseTimeHelpers();
    const listCommits = jest.fn().mockResolvedValue({
      data: [commit("🟩 Example is up (200 in 123 ms) [skip ci] [upptime]"), commit("Initial commit")],
    });

    (getOwnerRepo as jest.Mock).mockReturnValue(["owner", "repo"]);
    (getOctokit as jest.Mock).mockResolvedValue({ repos: { listCommits } });

    const result = await getResponseTimeForSite("example");

    expect(result.all).toBe(123);
  });
});
