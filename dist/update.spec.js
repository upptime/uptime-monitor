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
        const issueApi = {
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
});
//# sourceMappingURL=update.spec.js.map