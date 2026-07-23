"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const workflow_secrets_1 = require("./workflow-secrets");
const config = (overrides = {}) => ({
    owner: "example",
    repo: "status",
    sites: [],
    assignees: [],
    workflowSchedule: {},
    ...overrides,
});
const getLiteralSecrets = (sourceFile) => {
    const source = fs_1.default.readFileSync(sourceFile, "utf8");
    return [...source.matchAll(/getSecret\("([A-Z0-9_]+)"\)/g)].map((match) => match[1]);
};
const sourceRoot = path_1.default.join(__dirname, "..", "..", "src");
describe("workflow secrets", () => {
    describe("configuration discovery", () => {
        it("finds multiple secrets across every substitutable site field", () => {
            const discovered = (0, workflow_secrets_1.getConfiguredSecretReferences)(config({
                sites: [
                    {
                        name: "Private API",
                        url: "https://$PRIVATE_HOST/$TENANT_ID",
                        headers: ["Authorization: Bearer $API_TOKEN", "X-Tenant: $TENANT_ID"],
                        body: '{"key":"$BODY_SECRET"}',
                        port: "$PRIVATE_PORT",
                        __dangerous__body_down: "$DOWN_BODY",
                        __dangerous__body_down_if_text_missing: "$DOWN_MISSING_BODY",
                        __dangerous__body_degraded: "$DEGRADED_BODY",
                        __dangerous__body_degraded_if_text_missing: "$DEGRADED_MISSING_BODY",
                    },
                ],
            }));
            expect(discovered).toEqual([
                "API_TOKEN",
                "BODY_SECRET",
                "DEGRADED_BODY",
                "DEGRADED_MISSING_BODY",
                "DOWN_BODY",
                "DOWN_MISSING_BODY",
                "PRIVATE_HOST",
                "PRIVATE_PORT",
                "TENANT_ID",
            ]);
        });
        it("deduplicates references and excludes runtime, reserved, and lowercase placeholders", () => {
            const discovered = (0, workflow_secrets_1.getConfiguredSecretReferences)(config({
                sites: [
                    {
                        name: "$DISPLAY_NAME",
                        url: "https://$API_TOKEN/$API_TOKEN/$GITHUB_TOKEN/$GH_PAT/" +
                            "$DYNAMIC_RANDOM_NUMBER/$DYNAMIC_ALPHANUMERIC_STRING/$lowercase",
                    },
                ],
                "status-website": {
                    name: "$WEBSITE_SECRET",
                    introMessage: "$INTRO_SECRET",
                },
                commitMessages: {
                    statusChange: "$COMMIT_SECRET",
                },
            }));
            expect(discovered).toEqual(["API_TOKEN"]);
        });
        it("does not expose surrounding configuration values in errors", () => {
            const sensitiveUrl = "https://internal.example/$API_TOKEN";
            expect(() => (0, workflow_secrets_1.getConfiguredSecretReferences)(config({
                sites: [{ name: "Private", url: sensitiveUrl }],
            }))).not.toThrow();
            try {
                (0, workflow_secrets_1.validateSecretNames)(["BAD-NAME"]);
            }
            catch (error) {
                expect(error.message).not.toContain(sensitiveUrl);
            }
        });
    });
    describe("selection and validation", () => {
        it("uses the sorted union of runtime and discovered names in automatic mode", () => {
            const names = (0, workflow_secrets_1.getWorkflowSecretNames)(config({
                sites: [{ name: "Private", url: "https://$ZZZ_HOST/$API_TOKEN" }],
            }));
            expect(names).toContain("API_TOKEN");
            expect(names).toContain("GLOBALPING_TOKEN");
            expect(names).toContain("NOTIFICATION_SLACK_WEBHOOK_URL");
            expect(names).toContain("ZZZ_HOST");
            expect(names).toEqual([...names].sort());
            expect(new Set(names).size).toBe(names.length);
        });
        it("keeps an explicit list authoritative and deduplicates it", () => {
            expect((0, workflow_secrets_1.getWorkflowSecretNames)(config({
                sites: [{ name: "Private", url: "$DISCOVERED_SECRET" }],
                secrets: ["API_TOKEN", "API_TOKEN", "_PRIVATE"],
            }))).toEqual(["API_TOKEN", "_PRIVATE"]);
        });
        it("preserves an explicit empty strict mode", () => {
            expect((0, workflow_secrets_1.getWorkflowSecretNames)(config({ secrets: [] }))).toEqual([]);
        });
        it("rejects malformed explicit allowlists", () => {
            expect(() => (0, workflow_secrets_1.validateSecretNames)("API_TOKEN")).toThrow("Invalid .upptimerc.yml secrets allowlist: expected a list of GitHub secret names.");
            expect(() => (0, workflow_secrets_1.validateSecretNames)(["API_TOKEN", 42])).toThrow("Invalid .upptimerc.yml secrets allowlist: expected every secret name to be a string.");
            for (const name of ["GITHUB_TOKEN", "api_token", "2FA_TOKEN", "API-TOKEN"]) {
                expect(() => (0, workflow_secrets_1.validateSecretNames)([name])).toThrow(`Invalid secret name in .upptimerc.yml secrets allowlist: ${name}`);
            }
        });
    });
    describe("rendering", () => {
        it("renders empty, single, and multiple bounded contexts", () => {
            expect((0, workflow_secrets_1.renderSecretsContext)([])).toBe("'{}'");
            expect((0, workflow_secrets_1.renderSecretsContext)(["API_TOKEN"])).toBe(`'{"API_TOKEN":\${{ toJson(secrets.API_TOKEN) }}}'`);
            expect((0, workflow_secrets_1.renderSecretsContext)(["API_TOKEN", "SECRET_SITE"])).toBe(`'{"API_TOKEN":\${{ toJson(secrets.API_TOKEN) }},"SECRET_SITE":\${{ toJson(secrets.SECRET_SITE) }}}'`);
        });
        it("renders as valid YAML without serializing the complete secrets object", () => {
            const rendered = (0, workflow_secrets_1.renderSecretsContext)(["API_TOKEN", "SECRET_SITE"]);
            const document = `env:\n  SECRETS_CONTEXT: ${rendered}\n`;
            expect(() => js_yaml_1.default.load(document)).not.toThrow();
            expect(rendered).not.toContain("toJson(secrets)");
        });
        it("validates names before interpolating them into expressions", () => {
            expect(() => (0, workflow_secrets_1.renderSecretsContext)(["BAD-NAME"])).toThrow("Invalid secret name in .upptimerc.yml secrets allowlist: BAD-NAME");
        });
    });
    describe("runtime catalog", () => {
        it("matches every literal runtime secret consumer", () => {
            const notificationSecrets = getLiteralSecrets(path_1.default.join(sourceRoot, "helpers", "notifme.ts"));
            const updateSecrets = getLiteralSecrets(path_1.default.join(sourceRoot, "update.ts"));
            const githubSecrets = getLiteralSecrets(path_1.default.join(sourceRoot, "helpers", "github.ts")).filter((name) => !["GH_PAT", "GITHUB_TOKEN"].includes(name));
            const environmentSource = fs_1.default.readFileSync(path_1.default.join(sourceRoot, "helpers", "environment.ts"), "utf8");
            const environmentSecrets = [...environmentSource.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)]
                .map((match) => match[1])
                .filter((name) => name !== "SECRETS_CONTEXT");
            const expected = [
                ...new Set([
                    ...notificationSecrets,
                    ...updateSecrets,
                    ...githubSecrets,
                    ...environmentSecrets,
                ]),
            ].sort();
            expect(workflow_secrets_1.UPPTIME_RUNTIME_SECRET_NAMES).toHaveLength(91);
            expect([...workflow_secrets_1.UPPTIME_RUNTIME_SECRET_NAMES]).toEqual(expected);
        });
        it("excludes separately provided and system values", () => {
            for (const name of [
                "AUTOMATION_TOKEN",
                "GH_PAT",
                "GITHUB_REPOSITORY",
                "GITHUB_TOKEN",
                "SECRETS_CONTEXT",
            ]) {
                expect(workflow_secrets_1.UPPTIME_RUNTIME_SECRET_NAMES).not.toContain(name);
            }
        });
    });
});
//# sourceMappingURL=workflow-secrets.spec.js.map