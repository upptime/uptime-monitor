"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
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
jest.mock("./summary", () => ({
    generateSummary: jest.fn(),
}));
const { update } = require("./update");
const { getConfig } = require("./helpers/config");
const { getOctokit } = require("./helpers/github");
const { shouldContinue } = require("./helpers/init-check");
const { commit, push } = require("./helpers/git");
const { getOwnerRepo, getSecret } = require("./helpers/secrets");
describe("update globalping handling", () => {
    const originalCwd = process.cwd();
    let testCwd;
    let issueApi;
    beforeEach(() => {
        jest.clearAllMocks();
        testCwd = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), "upptime-update-test-"));
        process.chdir(testCwd);
        shouldContinue.mockResolvedValue(true);
        getOwnerRepo.mockReturnValue(["owner", "repo"]);
        getSecret.mockReturnValue("globalping-token");
        getConfig.mockResolvedValue({
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
        getOctokit.mockResolvedValue({ issues: issueApi });
    });
    afterEach(() => {
        process.chdir(originalCwd);
        (0, fs_1.rmSync)(testCwd, { recursive: true, force: true });
    });
    it("fails the action instead of recording downtime when Globalping rejects a measurement", async () => {
        mockCreateMeasurement.mockResolvedValue({
            ok: false,
            response: { status: 403 },
            data: { message: "Security Reasons" },
        });
        await expect(update(true)).rejects.toThrow(/Globalping create measurement failed with HTTP 403.*Security Reasons/);
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
        await expect(update(true)).rejects.toThrow(/Globalping get measurement failed with HTTP 500.*measurement failed/);
        expect(commit).not.toHaveBeenCalled();
        expect(push).not.toHaveBeenCalled();
    });
    it("writes history for Unicode-only site names when no explicit slug is set", async () => {
        getConfig.mockResolvedValue({
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
        const historyPath = (0, path_1.join)(testCwd, "history", "鸭鸭梨.yml");
        expect((0, fs_1.existsSync)(historyPath)).toBe(true);
        expect((0, fs_1.readFileSync)(historyPath, "utf8")).toContain("url: https://example.com");
        expect(commit).toHaveBeenCalledWith(expect.stringContaining("鸭鸭梨 is up (200 in 123 ms)"), undefined, undefined);
    });
    it("supports $EMOJI in custom status change commit messages", async () => {
        getConfig.mockResolvedValue({
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
                statusChange: "$EMOJI $SITE_NAME is $STATUS ($RESPONSE_CODE in $RESPONSE_TIME ms) [skip ci] [upptime]\n\nSigned-off-by: Upptime Bot <73812536+upptime-bot@users.noreply.github.com>",
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
        expect(commit).toHaveBeenCalledWith("🟩 Custom Commit Site is up (200 in 123 ms) [skip ci] [upptime]\n\nSigned-off-by: Upptime Bot <73812536+upptime-bot@users.noreply.github.com>", undefined, undefined);
    });
    it("only closes Upptime-created status incidents for a recovered site", async () => {
        (0, fs_1.mkdirSync)((0, path_1.join)(testCwd, "history"));
        (0, fs_1.writeFileSync)((0, path_1.join)(testCwd, "history", "blocked-by-globalping.yml"), [
            "url: https://blocked.example",
            "status: down",
            "code: 0",
            "responseTime: 0",
            "lastUpdated: 2026-03-26T00:00:00Z",
            "startTime: 2026-03-26T00:00:00Z",
            "generator: Upptime <https://github.com/upptime/upptime>",
        ].join("\n"));
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
//# sourceMappingURL=update.spec.js.map