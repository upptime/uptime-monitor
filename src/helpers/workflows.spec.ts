import yaml from "js-yaml";

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
      expect(workflow).toContain("uses: actions/checkout@v6");
      expect(workflow).not.toContain("actions/checkout@v5");
      expect(workflow).not.toContain("actions/checkout@v4");
    }
    expect(listTags).not.toHaveBeenCalled();
  });

  it("generates the static site workflow for assets changes", async () => {
    const { getConfig, getOctokit, siteCiWorkflow } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.7" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      workflowSchedule: {},
      commitMessages: {},
      "status-website": {},
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    const workflow = await siteCiWorkflow();

    expect(workflow).toContain(`on:
  push:
    paths:
      - "assets/**"`);
  });

  it("pins generated graph rendering to Node 20", async () => {
    const { getConfig, getOctokit, graphsCiWorkflow } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.9" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      commitMessages: {},
      "status-website": {},
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    const workflow = await graphsCiWorkflow();
    const parsed = yaml.load(workflow) as any;
    const steps = parsed.jobs.release.steps;

    expect(steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Setup Node.js for graphs",
          uses: "actions/setup-node@v6",
          with: { "node-version": "20" },
        }),
        expect.objectContaining({
          name: "Generate graphs",
          uses: "upptime/uptime-monitor@v1.41.9",
          with: { command: "graphs" },
        }),
      ])
    );
    expect(steps.findIndex((step: any) => step.name === "Setup Node.js for graphs")).toBeLessThan(
      steps.findIndex((step: any) => step.name === "Generate graphs")
    );
  });

  it("falls back to direct graph generation when workflow dispatch cannot find Graphs CI", async () => {
    const { getConfig, getOctokit, setupCiWorkflow } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.9" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      commitMessages: {},
      "status-website": {},
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    const workflow = await setupCiWorkflow();
    const parsed = yaml.load(workflow) as any;
    const steps = parsed.jobs.release.steps;
    const dispatchStep = steps.find((step: any) => step.id === "dispatch_graphs");
    const setupNodeStep = steps.find((step: any) => step.name === "Setup Node.js for direct graph generation");
    const fallbackStep = steps.find((step: any) => step.name === "Generate graphs directly if dispatch fails");

    expect(dispatchStep).toMatchObject({
      name: "Generate graphs",
      uses: "benc-uk/workflow-dispatch@v1",
      "continue-on-error": true,
      with: {
        workflow: "Graphs CI",
        token: "${{ secrets.GH_PAT || github.token }}",
      },
    });
    expect(setupNodeStep).toMatchObject({
      if: "steps.dispatch_graphs.outcome == 'failure'",
      uses: "actions/setup-node@v6",
      with: {
        "node-version": "20",
      },
    });
    expect(fallbackStep).toMatchObject({
      if: "steps.dispatch_graphs.outcome == 'failure'",
      uses: "upptime/uptime-monitor@v1.41.9",
      with: {
        command: "graphs",
      },
      env: {
        GH_PAT: "${{ secrets.GH_PAT || github.token }}",
      },
    });
    expect(steps.indexOf(setupNodeStep)).toBeLessThan(steps.indexOf(fallbackStep));
  });

  it("generates workflows that serialize branch writes from the live branch tip", async () => {
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
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.9" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      commitMessages: {},
      "status-website": {},
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
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
      expect(workflow).toContain(`concurrency:
  group: \${{ github.repository }}-\${{ github.head_ref || github.ref_name }}-upptime
  cancel-in-progress: false`);
      expect(workflow).toContain("ref: \${{ github.head_ref || github.ref_name }}");
    }
  });

  it("keeps passing the full GitHub Actions secrets context by default", async () => {
    const { getConfig, getOctokit, responseTimeCiWorkflow, setupCiWorkflow, uptimeCiWorkflow } =
      loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.10" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      commitMessages: {},
      "status-website": {},
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    const workflows = await Promise.all([responseTimeCiWorkflow(), setupCiWorkflow(), uptimeCiWorkflow()]);

    for (const workflow of workflows) {
      expect(workflow).toContain("SECRETS_CONTEXT: ${{ toJson(secrets) }}");
    }
  });

  it("generates an allowlisted secrets context when config.secrets is set", async () => {
    const { getConfig, getOctokit, responseTimeCiWorkflow, setupCiWorkflow, uptimeCiWorkflow } =
      loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.10" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      commitMessages: {},
      "status-website": {},
      secrets: ["GH_PAT", "SLACK_WEBHOOK_URL"],
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    const workflows = await Promise.all([responseTimeCiWorkflow(), setupCiWorkflow(), uptimeCiWorkflow()]);
    const expected =
      'SECRETS_CONTEXT: \'{"GH_PAT":${{ toJson(secrets.GH_PAT) }},"SLACK_WEBHOOK_URL":${{ toJson(secrets.SLACK_WEBHOOK_URL) }}}\'';

    for (const workflow of workflows) {
      expect(workflow).toContain(expected);
      expect(workflow).not.toContain("SECRETS_CONTEXT: ${{ toJson(secrets) }}");
      expect(() => yaml.load(workflow)).not.toThrow();
      expect(yaml.load(workflow)).toHaveProperty("jobs");
    }
  });

  it("deduplicates configured secret names", () => {
    const { getSecretsContext } = loadWorkflowHelpers();

    expect(getSecretsContext({ secrets: ["GH_PAT", "GH_PAT"] } as never)).toBe(
      '\'{"GH_PAT":${{ toJson(secrets.GH_PAT) }}}\''
    );
  });

  it("allows uppercase secret names that start with an underscore", () => {
    const { getSecretsContext } = loadWorkflowHelpers();

    expect(getSecretsContext({ secrets: ["_PRIVATE"] } as never)).toBe(
      '\'{"_PRIVATE":${{ toJson(secrets._PRIVATE) }}}\''
    );
  });

  it("rejects reserved, lowercase, and digit-prefixed secret names", () => {
    const { getSecretsContext } = loadWorkflowHelpers();

    for (const secret of ["GITHUB_TOKEN", "gh_pat", "1PASSWORD"]) {
      expect(() => getSecretsContext({ secrets: [secret] } as never)).toThrow(
        `Invalid secret name in .upptimerc.yml secrets allowlist: ${secret}`
      );
    }
  });

  it("generates an empty secrets object when config.secrets is empty", async () => {
    const { getConfig, getOctokit, uptimeCiWorkflow } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.10" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      secrets: [],
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    await expect(uptimeCiWorkflow()).resolves.toContain("SECRETS_CONTEXT: '{}'");
  });

  it("rejects a non-list secrets allowlist", async () => {
    const { getConfig, getOctokit, uptimeCiWorkflow } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.10" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      secrets: "GH_PAT" as unknown as string[],
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    await expect(uptimeCiWorkflow()).rejects.toThrow(
      "Invalid .upptimerc.yml secrets allowlist: expected a list of GitHub secret names."
    );
  });

  it("rejects non-string secret names in the allowlist", () => {
    const { getSecretsContext } = loadWorkflowHelpers();

    expect(() => getSecretsContext({ secrets: [42] } as never)).toThrow(
      "Invalid .upptimerc.yml secrets allowlist: expected every secret name to be a string."
    );
  });

  it("rejects secret names that cannot be referenced safely in GitHub expressions", async () => {
    const { getConfig, getOctokit, uptimeCiWorkflow } = loadWorkflowHelpers();
    const listReleases = jest.fn().mockResolvedValue({ data: [{ tag_name: "v1.41.10" }] });

    (getConfig as jest.Mock).mockResolvedValue({
      sites: [{ name: "Example", url: "https://example.com" }],
      workflowSchedule: {},
      secrets: ["BAD-NAME"],
    });
    (getOctokit as jest.Mock).mockResolvedValue({
      repos: { listReleases },
    });

    await expect(uptimeCiWorkflow()).rejects.toThrow(
      "Invalid secret name in .upptimerc.yml secrets allowlist: BAD-NAME"
    );
  });
});
