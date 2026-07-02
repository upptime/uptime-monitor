import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const mockCreateMeasurement = jest.fn();
const mockAwaitMeasurement = jest.fn();

jest.mock("globalping", () => ({
  Globalping: jest.fn().mockImplementation(() => ({
    createMeasurement: mockCreateMeasurement,
    awaitMeasurement: mockAwaitMeasurement,
  })),
  HttpProtocol: { HTTP: "http", HTTPS: "https" },
  HttpRequestMethod: { GET: "GET" },
  IpVersion: { 4: 4, 6: 6 },
}));

jest.mock("./helpers/config", () => ({
  getConfig: jest.fn(),
}));

jest.mock("./helpers/github", () => ({
  getOctokit: jest.fn(),
}));

jest.mock("./helpers/init-check", () => ({
  shouldContinue: jest.fn(),
}));

jest.mock("./helpers/git", () => ({
  commit: jest.fn(),
  lastCommit: jest.fn(() => "abc1234"),
  push: jest.fn(),
}));

jest.mock("./helpers/secrets", () => ({
  getOwnerRepo: jest.fn(),
  getSecret: jest.fn(),
}));

jest.mock("./helpers/notifme", () => ({
  sendNotification: jest.fn(),
}));

jest.mock("./helpers/ping", () => ({
  ping: jest.fn(),
}));

jest.mock("./summary", () => ({
  generateSummary: jest.fn(),
}));

const { update } = require("./update") as typeof import("./update");
const { getConfig } = require("./helpers/config") as typeof import("./helpers/config");
const { getOctokit } = require("./helpers/github") as typeof import("./helpers/github");
const { shouldContinue } = require("./helpers/init-check") as typeof import("./helpers/init-check");
const { commit, push } = require("./helpers/git") as typeof import("./helpers/git");
const { ping } = require("./helpers/ping") as typeof import("./helpers/ping");
const { getOwnerRepo, getSecret } = require("./helpers/secrets") as typeof import("./helpers/secrets");
const { sendNotification } = require("./helpers/notifme") as typeof import("./helpers/notifme");

describe("update globalping handling", () => {
  const originalCwd = process.cwd();
  let testCwd: string;
  let issueApi: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    testCwd = mkdtempSync(join(tmpdir(), "upptime-update-test-"));
    process.chdir(testCwd);

    (shouldContinue as jest.Mock).mockResolvedValue(true);
    (getOwnerRepo as jest.Mock).mockReturnValue(["owner", "repo"]);
    (getSecret as jest.Mock).mockReturnValue("globalping-token");
    (getConfig as jest.Mock).mockResolvedValue({
      owner: "owner",
      repo: "repo",
      sites: [
        {
          name: "Blocked by Globalping",
          url: "https://blocked.example",
          type: "globalping",
        },
      ],
      assignees: [],
      workflowSchedule: {},
    });

    issueApi = {
      listForRepo: jest.fn().mockResolvedValue({ data: [] }),
      create: jest.fn().mockResolvedValue({ data: { number: 1, html_url: "https://example.test/1" } }),
      addAssignees: jest.fn().mockResolvedValue({}),
      lock: jest.fn().mockResolvedValue({}),
      unlock: jest.fn().mockResolvedValue({}),
      createComment: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };
    (getOctokit as jest.Mock).mockResolvedValue({ issues: issueApi });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(testCwd, { recursive: true, force: true });
  });

  it("fails the action instead of recording downtime when Globalping rejects a measurement", async () => {
    mockCreateMeasurement.mockResolvedValue({
      ok: false,
      response: { status: 403 },
      data: { message: "Security Reasons" },
    });

    await expect(update(true)).rejects.toThrow(
      /Globalping create measurement failed with HTTP 403.*Security Reasons/
    );
    expect(commit).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("fails the action instead of recording downtime when Globalping rejects measurement results", async () => {
    mockCreateMeasurement.mockResolvedValue({
      ok: true,
      data: { id: "measurement-id" },
    });
    mockAwaitMeasurement.mockResolvedValue({
      ok: false,
      response: { status: 500 },
      data: "measurement failed",
    });

    await expect(update(true)).rejects.toThrow(
      /Globalping get measurement failed with HTTP 500.*measurement failed/
    );
    expect(commit).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("writes history for Unicode-only site names when no explicit slug is set", async () => {
    (getConfig as jest.Mock).mockResolvedValue({
      owner: "owner",
      repo: "repo",
      sites: [
        {
          name: "鸭鸭梨",
          url: "https://example.com",
          type: "globalping",
        },
      ],
      assignees: [],
      workflowSchedule: {},
    });
    mockCreateMeasurement.mockResolvedValue({
      ok: true,
      data: { id: "measurement-id" },
    });
    mockAwaitMeasurement.mockResolvedValue({
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              timings: { total: 123 },
              rawBody: "",
            },
          },
        ],
      },
    });

    await update(true);

    const historyPath = join(testCwd, "history", "鸭鸭梨.yml");
    expect(existsSync(historyPath)).toBe(true);
    expect(readFileSync(historyPath, "utf8")).toContain("url: https://example.com");
    expect(commit).toHaveBeenCalledWith(
      expect.stringContaining("鸭鸭梨 is up (200 in 123 ms)"),
      undefined,
      undefined,
      undefined
    );
  });

  it("supports $EMOJI in custom status change commit messages", async () => {
    (getConfig as jest.Mock).mockResolvedValue({
      owner: "owner",
      repo: "repo",
      sites: [
        {
          name: "Custom Commit Site",
          url: "https://example.com",
          type: "globalping",
        },
      ],
      assignees: [],
      workflowSchedule: {},
      commitMessages: {
        statusChange:
          "$EMOJI $SITE_NAME is $STATUS ($RESPONSE_CODE in $RESPONSE_TIME ms) [skip ci] [upptime]\n\nSigned-off-by: Upptime Bot <73812536+upptime-bot@users.noreply.github.com>",
      },
    });
    mockCreateMeasurement.mockResolvedValue({
      ok: true,
      data: { id: "measurement-id" },
    });
    mockAwaitMeasurement.mockResolvedValue({
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              timings: { total: 123 },
              rawBody: "",
            },
          },
        ],
      },
    });

    await update(true);

    expect(commit).toHaveBeenCalledWith(
      "🟩 Custom Commit Site is up (200 in 123 ms) [skip ci] [upptime]\n\nSigned-off-by: Upptime Bot <73812536+upptime-bot@users.noreply.github.com>",
      undefined,
      undefined,
      undefined
    );
  });

  it("redacts secret-backed site URLs in notifications", async () => {
    const oldPrivateUrl = process.env.PRIVATE_STATUS_URL;
    process.env.PRIVATE_STATUS_URL = "https://private.example/path?session=abc123";
    mkdirSync(join(testCwd, "history"));
    writeFileSync(
      join(testCwd, "history", "secret-url.yml"),
      [
        "url: $PRIVATE_STATUS_URL",
        "status: down",
        "code: 500",
        "responseTime: 0",
        "lastUpdated: 2026-01-01T00:00:00.000Z",
        "startTime: 2026-01-01T00:00:00.000Z",
        "generator: Upptime <https://github.com/upptime/upptime>",
      ].join("\n")
    );
    (getSecret as jest.Mock).mockImplementation((key: string) =>
      key === "GLOBALPING_TOKEN" ? "globalping-token" : undefined
    );
    (getConfig as jest.Mock).mockResolvedValue({
      owner: "owner",
      repo: "repo",
      sites: [
        {
          name: "Secret URL",
          url: "$PRIVATE_STATUS_URL",
          type: "globalping",
        },
      ],
      assignees: [],
      workflowSchedule: {},
    });
    issueApi.listForRepo
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            number: 42,
            title: "🛑 Secret URL is down",
            created_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      });
    mockCreateMeasurement.mockResolvedValue({
      ok: true,
      data: { id: "measurement-id" },
    });
    mockAwaitMeasurement.mockResolvedValue({
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              timings: { total: 123 },
              rawBody: "",
            },
          },
        ],
      },
    });

    try {
      await update(true);
    } finally {
      if (oldPrivateUrl === undefined) delete process.env.PRIVATE_STATUS_URL;
      else process.env.PRIVATE_STATUS_URL = oldPrivateUrl;
    }

    expect(sendNotification).toHaveBeenCalledWith("🟩 Secret URL ([redacted]) is back up");
    expect(JSON.stringify((sendNotification as jest.Mock).mock.calls)).not.toContain(
      "https://private.example/path?session=abc123"
    );
    expect(JSON.stringify((sendNotification as jest.Mock).mock.calls)).not.toContain(
      "$PRIVATE_STATUS_URL"
    );
  });

  it("does not log raw tcp-ping endpoints when URL and port come from secrets", async () => {
    const oldSecretHost = process.env.SECRET_TCP_HOST;
    const oldSecretPort = process.env.SECRET_TCP_PORT;
    process.env.SECRET_TCP_HOST = "10.0.0.10";
    process.env.SECRET_TCP_PORT = "8443";
    (getConfig as jest.Mock).mockResolvedValue({
      owner: "owner",
      repo: "repo",
      sites: [
        {
          name: "Secret TCP",
          url: "$SECRET_TCP_HOST",
          check: "tcp-ping",
          port: "$SECRET_TCP_PORT" as unknown as number,
        },
      ],
      assignees: [],
      workflowSchedule: {},
    });
    (ping as jest.Mock).mockResolvedValue({
      address: "10.0.0.10",
      port: 8443,
      attempts: 5,
      avg: 12.4,
      max: 15,
      min: 10,
      results: [{ seq: 1, time: 12.4 }],
    });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    let serializedLogs = "";

    try {
      await update(false);
      serializedLogs = [...logSpy.mock.calls, ...errorSpy.mock.calls]
        .map((args) => args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" "))
        .join("\n");
    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
      if (oldSecretHost === undefined) delete process.env.SECRET_TCP_HOST;
      else process.env.SECRET_TCP_HOST = oldSecretHost;
      if (oldSecretPort === undefined) delete process.env.SECRET_TCP_PORT;
      else process.env.SECRET_TCP_PORT = oldSecretPort;
    }

    expect(serializedLogs).not.toContain("10.0.0.10");
    expect(serializedLogs).not.toContain("8443");
  });

  it("passes commitMessages.signoff to status change commits", async () => {
    (getConfig as jest.Mock).mockResolvedValue({
      owner: "owner",
      repo: "repo",
      sites: [
        {
          name: "DCO Site",
          url: "https://example.com",
          type: "globalping",
        },
      ],
      assignees: [],
      workflowSchedule: {},
      commitMessages: {
        commitAuthorName: "DCO Bot",
        commitAuthorEmail: "dco@example.com",
        signoff: true,
      },
    });
    mockCreateMeasurement.mockResolvedValue({
      ok: true,
      data: { id: "measurement-id" },
    });
    mockAwaitMeasurement.mockResolvedValue({
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              timings: { total: 123 },
              rawBody: "",
            },
          },
        ],
      },
    });

    await update(true);

    expect(commit).toHaveBeenCalledWith(
      expect.stringContaining("DCO Site is up (200 in 123 ms)"),
      "DCO Bot",
      "dco@example.com",
      true
    );
  });

  it("does not open an incident for expected degraded maintenance", async () => {
    (getConfig as jest.Mock).mockResolvedValue({
      owner: "owner",
      repo: "repo",
      sites: [
        {
          name: "Slow Site",
          url: "https://example.com",
          type: "globalping",
          maxResponseTime: 50,
        },
      ],
      assignees: [],
      workflowSchedule: {},
    });
    issueApi.listForRepo
      .mockResolvedValueOnce({
        data: [
          {
            number: 99,
            body: [
              "Scheduled maintenance",
              "<!--",
              "start: 2000-01-01T00:00:00.000Z",
              "end: 2999-01-01T00:00:00.000Z",
              "expectedDegraded: slow-site",
              "-->",
            ].join("\n"),
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] });
    mockCreateMeasurement.mockResolvedValue({
      ok: true,
      data: { id: "measurement-id" },
    });
    mockAwaitMeasurement.mockResolvedValue({
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              timings: { total: 123 },
              rawBody: "",
            },
          },
        ],
      },
    });

    await update(true);

    const history = readFileSync(join(testCwd, "history", "slow-site.yml"), "utf8");
    expect(history).toContain("status: degraded");
    expect(history).toContain("responseTime: 123");
    expect(issueApi.create).not.toHaveBeenCalled();
  }, 15000);

  it("only closes Upptime-created status incidents for a recovered site", async () => {
    mkdirSync(join(testCwd, "history"));
    writeFileSync(
      join(testCwd, "history", "blocked-by-globalping.yml"),
      [
        "url: https://blocked.example",
        "status: down",
        "code: 0",
        "responseTime: 0",
        "lastUpdated: 2026-03-26T00:00:00Z",
        "startTime: 2026-03-26T00:00:00Z",
        "generator: Upptime <https://github.com/upptime/upptime>",
      ].join("\n")
    );
    issueApi.listForRepo
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            number: 42,
            title: "🛑 Blocked by Globalping is down",
            created_at: "2026-03-26T00:00:00Z",
          },
        ],
      });
    mockCreateMeasurement.mockResolvedValue({
      ok: true,
      data: { id: "measurement-id" },
    });
    mockAwaitMeasurement.mockResolvedValue({
      ok: true,
      data: {
        results: [
          {
            result: {
              statusCode: 200,
              timings: { total: 123 },
              rawBody: "",
            },
          },
        ],
      },
    });

    await update(true);

    expect(issueApi.listForRepo).toHaveBeenNthCalledWith(2, {
      owner: "owner",
      repo: "repo",
      labels: "status,blocked-by-globalping",
      filter: "all",
      state: "open",
      sort: "created",
      direction: "desc",
      per_page: 1,
    });
    expect(issueApi.create).not.toHaveBeenCalled();
    expect(issueApi.unlock).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      issue_number: 42,
    });
    expect(issueApi.update).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      issue_number: 42,
      state: "closed",
    });
  });
});
