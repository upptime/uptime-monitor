"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const summary_1 = require("./summary");
describe("summary README workflow badges", () => {
    it("normalizes legacy Koj badge links to the current status repo", () => {
        const readme = `
[![Uptime CI](https://github.com/koj-co/upptime/workflows/Uptime%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Uptime+CI%22)
[![Response Time CI](https://github.com/koj-co/upptime/workflows/Response%20Time%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Response+Time+CI%22)
[![Graphs CI](https://github.com/koj-co/upptime/workflows/Graphs%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Graphs+CI%22)
[![Static Site CI](https://github.com/koj-co/upptime/workflows/Static%20Site%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Static+Site+CI%22)
[![Summary CI](https://github.com/koj-co/upptime/workflows/Summary%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Summary+CI%22)
`;
        const normalized = (0, summary_1.normalizeWorkflowBadges)(readme, "AnandChowdhary", "status");
        expect(normalized).not.toContain("koj-co/upptime");
        expect(normalized).toContain("[![Uptime CI](https://github.com/AnandChowdhary/status/workflows/Uptime%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/uptime.yml)");
        expect(normalized).toContain("[![Response Time CI](https://github.com/AnandChowdhary/status/workflows/Response%20Time%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/response-time.yml)");
        expect(normalized).toContain("[![Graphs CI](https://github.com/AnandChowdhary/status/workflows/Graphs%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/graphs.yml)");
        expect(normalized).toContain("[![Static Site CI](https://github.com/AnandChowdhary/status/workflows/Static%20Site%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/site.yml)");
        expect(normalized).toContain("[![Summary CI](https://github.com/AnandChowdhary/status/workflows/Summary%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/summary.yml)");
    });
    it("updates direct upstream workflow links when generating a user README", () => {
        const readme = "[![Uptime CI](https://github.com/upptime/upptime/workflows/Uptime%20CI/badge.svg)](https://github.com/upptime/upptime/actions/workflows/uptime.yml)";
        expect((0, summary_1.normalizeWorkflowBadges)(readme, "owner", "status")).toBe("[![Uptime CI](https://github.com/owner/status/workflows/Uptime%20CI/badge.svg)](https://github.com/owner/status/actions/workflows/uptime.yml)");
    });
});
describe("recent status issue cleanup", () => {
    it("paginates recent issues without deleting old short incidents", async () => {
        const now = Date.parse("2026-08-01T12:00:00.000Z");
        const recentIssue = {
            number: 42,
            node_id: "recent-node",
            created_at: "2026-08-01T11:50:00.000Z",
            closed_at: "2026-08-01T11:55:00.000Z",
            comments: 1,
        };
        const oldIssue = {
            number: 7,
            node_id: "old-node",
            created_at: "2025-01-01T00:00:00.000Z",
            closed_at: "2025-01-01T00:05:00.000Z",
            comments: 1,
        };
        const listForRepo = jest.fn();
        const paginate = jest.fn().mockResolvedValue([recentIssue, oldIssue]);
        const graphql = jest.fn().mockResolvedValue({});
        await (0, summary_1.deleteRecentStatusIssues)({ issues: { listForRepo }, paginate, graphql }, "owner", "repo", now);
        expect(paginate).toHaveBeenCalledWith(listForRepo, {
            owner: "owner",
            repo: "repo",
            state: "closed",
            labels: "status",
            since: "2026-08-01T11:45:00.000Z",
            per_page: 100,
        });
        expect(graphql).toHaveBeenCalledTimes(1);
        expect(graphql.mock.calls[0][0]).toContain("$issueId: ID!");
        expect(graphql.mock.calls[0][1]).toEqual({ issueId: "recent-node" });
        expect(JSON.stringify(graphql.mock.calls)).not.toContain("old-node");
    });
});
//# sourceMappingURL=summary.spec.js.map