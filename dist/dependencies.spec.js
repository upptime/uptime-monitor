"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
jest.mock("./helpers/config", () => ({
    getConfig: jest.fn(),
}));
jest.mock("./helpers/github", () => ({
    getOctokit: jest.fn(),
}));
jest.mock("./helpers/git", () => ({
    commit: jest.fn(),
    push: jest.fn(),
}));
jest.mock("./helpers/secrets", () => ({
    getOwnerRepo: jest.fn(),
}));
const originalCwd = process.cwd();
const loadDependencies = () => {
    jest.resetModules();
    const { getConfig } = require("./helpers/config");
    const { getOctokit } = require("./helpers/github");
    const { commit, push } = require("./helpers/git");
    const { getOwnerRepo } = require("./helpers/secrets");
    const dependencies = require("./dependencies");
    return { commit, getConfig, getOctokit, getOwnerRepo, push, ...dependencies };
};
describe("updateDependencies", () => {
    let tempDir;
    let workflowPath;
    const writeWorkflow = (contents) => {
        (0, fs_1.mkdirSync)((0, path_1.join)(tempDir, ".github", "workflows"), { recursive: true });
        workflowPath = (0, path_1.join)(tempDir, ".github", "workflows", "updates.yml");
        (0, fs_1.writeFileSync)(workflowPath, contents);
    };
    beforeEach(() => {
        tempDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), "upptime-dependencies-"));
        process.chdir(tempDir);
        writeWorkflow(`name: Updates CI
jobs:
  update:
    steps:
      - uses: upptime/uptime-monitor@v1.41.2
`);
    });
    afterEach(() => {
        process.chdir(originalCwd);
        (0, fs_1.rmSync)(tempDir, { recursive: true, force: true });
        jest.clearAllMocks();
    });
    it("updates dependencies from the latest GitHub release", async () => {
        const { commit, getConfig, getOctokit, getOwnerRepo, updateDependencies } = loadDependencies();
        const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.42.4" }] });
        const listTags = jest.fn();
        const getContent = jest.fn().mockResolvedValue({ data: { content: "", sha: "readme-sha" } });
        const createOrUpdateFileContents = jest.fn().mockResolvedValue({});
        getOwnerRepo.mockReturnValue(["upptime", "upptime"]);
        getConfig.mockResolvedValue({ commitMessages: {} });
        getOctokit.mockResolvedValue({
            repos: { createOrUpdateFileContents, getContent, listReleases, listTags },
        });
        await updateDependencies();
        expect(listReleases).toHaveBeenCalledWith({ owner: "upptime", repo: "uptime-monitor", per_page: 1 });
        expect(listTags).not.toHaveBeenCalled();
        expect((0, fs_1.readFileSync)(workflowPath, "utf8")).toContain("uses: upptime/uptime-monitor@v1.42.4");
        expect(commit).toHaveBeenCalledWith(expect.stringContaining("Signed-off-by: Anand Chowdhary <github@anandchowdhary.com>"), undefined, undefined, undefined);
    });
    it("uses native git signoff for dependency bumps without duplicating the built-in trailer", async () => {
        const { commit, getConfig, getOctokit, getOwnerRepo, updateDependencies } = loadDependencies();
        const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.42.4" }] });
        const listTags = jest.fn();
        const getContent = jest.fn().mockResolvedValue({ data: { content: "", sha: "readme-sha" } });
        const createOrUpdateFileContents = jest.fn().mockResolvedValue({});
        getOwnerRepo.mockReturnValue(["upptime", "upptime"]);
        getConfig.mockResolvedValue({
            commitMessages: {
                commitAuthorName: "DCO Bot",
                commitAuthorEmail: "dco@example.com",
                signoff: true,
            },
        });
        getOctokit.mockResolvedValue({
            repos: { createOrUpdateFileContents, getContent, listReleases, listTags },
        });
        await updateDependencies();
        expect(commit).toHaveBeenCalledWith(expect.not.stringContaining("Signed-off-by:"), "DCO Bot", "dco@example.com", true);
    });
    it("falls back to tags when a dependency has no GitHub releases", async () => {
        const { getConfig, getOctokit, getOwnerRepo, updateDependencies } = loadDependencies();
        const listReleases = jest.fn().mockResolvedValue({ data: [] });
        const listTags = jest.fn().mockResolvedValue({ data: [{ name: "v1.42.4" }] });
        const getContent = jest.fn().mockResolvedValue({ data: { content: "", sha: "readme-sha" } });
        const createOrUpdateFileContents = jest.fn().mockResolvedValue({});
        getOwnerRepo.mockReturnValue(["upptime", "upptime"]);
        getConfig.mockResolvedValue({ commitMessages: {} });
        getOctokit.mockResolvedValue({
            repos: { createOrUpdateFileContents, getContent, listReleases, listTags },
        });
        await updateDependencies();
        expect(listReleases).toHaveBeenCalledWith({ owner: "upptime", repo: "uptime-monitor", per_page: 1 });
        expect(listTags).toHaveBeenCalledWith({ owner: "upptime", repo: "uptime-monitor", per_page: 1 });
        expect((0, fs_1.readFileSync)(workflowPath, "utf8")).toContain("uses: upptime/uptime-monitor@v1.42.4");
    });
    it("keeps the current dependency version when release lookup fails and no tags exist", async () => {
        const { getConfig, getOctokit, getOwnerRepo, updateDependencies } = loadDependencies();
        const listReleases = jest.fn().mockRejectedValue(new Error("rate limited"));
        const listTags = jest.fn().mockResolvedValue({ data: [] });
        getOwnerRepo.mockReturnValue(["upptime", "upptime"]);
        getConfig.mockResolvedValue({ commitMessages: {} });
        getOctokit.mockResolvedValue({ repos: { listReleases, listTags } });
        await expect(updateDependencies()).resolves.toBeUndefined();
        expect((0, fs_1.readFileSync)(workflowPath, "utf8")).toContain("uses: upptime/uptime-monitor@v1.41.2");
    });
    it("keeps the current dependency version when release and tag lookups both fail", async () => {
        const { getConfig, getOctokit, getOwnerRepo, updateDependencies } = loadDependencies();
        const listReleases = jest.fn().mockRejectedValue(new Error("rate limited"));
        const listTags = jest.fn().mockRejectedValue(new Error("secondary rate limit"));
        getOwnerRepo.mockReturnValue(["upptime", "upptime"]);
        getConfig.mockResolvedValue({ commitMessages: {} });
        getOctokit.mockResolvedValue({ repos: { listReleases, listTags } });
        await expect(updateDependencies()).resolves.toBeUndefined();
        expect((0, fs_1.readFileSync)(workflowPath, "utf8")).toContain("uses: upptime/uptime-monitor@v1.41.2");
    });
    it("keeps unversioned dependency references unversioned when lookups fail", async () => {
        const { getConfig, getOctokit, getOwnerRepo, updateDependencies } = loadDependencies();
        const listReleases = jest.fn().mockRejectedValue(new Error("rate limited"));
        const listTags = jest.fn().mockResolvedValue({ data: [] });
        writeWorkflow(`name: Updates CI
jobs:
  update:
    steps:
      - uses: upptime/uptime-monitor
`);
        getOwnerRepo.mockReturnValue(["upptime", "upptime"]);
        getConfig.mockResolvedValue({ commitMessages: {} });
        getOctokit.mockResolvedValue({ repos: { listReleases, listTags } });
        await expect(updateDependencies()).resolves.toBeUndefined();
        expect((0, fs_1.readFileSync)(workflowPath, "utf8")).toContain("uses: upptime/uptime-monitor\n");
        expect((0, fs_1.readFileSync)(workflowPath, "utf8")).not.toContain("upptime/uptime-monitor@undefined");
    });
});
//# sourceMappingURL=dependencies.spec.js.map