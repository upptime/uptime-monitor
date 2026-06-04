import { normalizeWorkflowBadges } from "./summary";

describe("summary README workflow badges", () => {
  it("normalizes legacy Koj badge links to the current status repo", () => {
    const readme = `
[![Uptime CI](https://github.com/koj-co/upptime/workflows/Uptime%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Uptime+CI%22)
[![Response Time CI](https://github.com/koj-co/upptime/workflows/Response%20Time%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Response+Time+CI%22)
[![Graphs CI](https://github.com/koj-co/upptime/workflows/Graphs%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Graphs+CI%22)
[![Static Site CI](https://github.com/koj-co/upptime/workflows/Static%20Site%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Static+Site+CI%22)
[![Summary CI](https://github.com/koj-co/upptime/workflows/Summary%20CI/badge.svg)](https://github.com/koj-co/upptime/actions?query=workflow%3A%22Summary+CI%22)
`;

    const normalized = normalizeWorkflowBadges(
      readme,
      "AnandChowdhary",
      "status"
    );

    expect(normalized).not.toContain("koj-co/upptime");
    expect(normalized).toContain(
      "[![Uptime CI](https://github.com/AnandChowdhary/status/workflows/Uptime%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/uptime.yml)"
    );
    expect(normalized).toContain(
      "[![Response Time CI](https://github.com/AnandChowdhary/status/workflows/Response%20Time%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/response-time.yml)"
    );
    expect(normalized).toContain(
      "[![Graphs CI](https://github.com/AnandChowdhary/status/workflows/Graphs%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/graphs.yml)"
    );
    expect(normalized).toContain(
      "[![Static Site CI](https://github.com/AnandChowdhary/status/workflows/Static%20Site%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/site.yml)"
    );
    expect(normalized).toContain(
      "[![Summary CI](https://github.com/AnandChowdhary/status/workflows/Summary%20CI/badge.svg)](https://github.com/AnandChowdhary/status/actions/workflows/summary.yml)"
    );
  });

  it("updates direct upstream workflow links when generating a user README", () => {
    const readme =
      "[![Uptime CI](https://github.com/upptime/upptime/workflows/Uptime%20CI/badge.svg)](https://github.com/upptime/upptime/actions/workflows/uptime.yml)";

    expect(normalizeWorkflowBadges(readme, "owner", "status")).toBe(
      "[![Uptime CI](https://github.com/owner/status/workflows/Uptime%20CI/badge.svg)](https://github.com/owner/status/actions/workflows/uptime.yml)"
    );
  });
});