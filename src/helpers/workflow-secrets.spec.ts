import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { UpptimeConfig } from "../interfaces";
import {
  getConfiguredSecretReferences,
  getWorkflowSecretNames,
  renderSecretsContext,
  UPPTIME_RUNTIME_SECRET_NAMES,
  validateSecretNames,
} from "./workflow-secrets";

const config = (overrides: Partial<UpptimeConfig> = {}): UpptimeConfig =>
  ({
    owner: "example",
    repo: "status",
    sites: [],
    assignees: [],
    workflowSchedule: {},
    ...overrides,
  } as UpptimeConfig);

const getLiteralSecrets = (sourceFile: string) => {
  const source = fs.readFileSync(sourceFile, "utf8");
  return [...source.matchAll(/getSecret\("([A-Z0-9_]+)"\)/g)].map((match) => match[1]);
};

const sourceRoot = path.join(__dirname, "..", "..", "src");

describe("workflow secrets", () => {
  describe("configuration discovery", () => {
    it("finds multiple secrets across every substitutable site field", () => {
      const discovered = getConfiguredSecretReferences(
        config({
          sites: [
            {
              name: "Private API",
              url: "https://$PRIVATE_HOST/$TENANT_ID",
              headers: ["Authorization: Bearer $API_TOKEN", "X-Tenant: $TENANT_ID"],
              body: '{"key":"$BODY_SECRET"}',
              port: "$PRIVATE_PORT" as unknown as number,
              __dangerous__body_down: "$DOWN_BODY",
              __dangerous__body_down_if_text_missing: "$DOWN_MISSING_BODY",
              __dangerous__body_degraded: "$DEGRADED_BODY",
              __dangerous__body_degraded_if_text_missing: "$DEGRADED_MISSING_BODY",
            },
          ],
        })
      );

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
      const discovered = getConfiguredSecretReferences(
        config({
          sites: [
            {
              name: "$DISPLAY_NAME",
              url:
                "https://$API_TOKEN/$API_TOKEN/$GITHUB_TOKEN/$GH_PAT/" +
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
        })
      );

      expect(discovered).toEqual(["API_TOKEN"]);
    });

    it("does not expose surrounding configuration values in errors", () => {
      const sensitiveUrl = "https://internal.example/$API_TOKEN";
      expect(() =>
        getConfiguredSecretReferences(
          config({
            sites: [{ name: "Private", url: sensitiveUrl }],
          })
        )
      ).not.toThrow();

      try {
        validateSecretNames(["BAD-NAME"]);
      } catch (error) {
        expect((error as Error).message).not.toContain(sensitiveUrl);
      }
    });
  });

  describe("selection and validation", () => {
    it("uses the sorted union of runtime and discovered names in automatic mode", () => {
      const names = getWorkflowSecretNames(
        config({
          sites: [{ name: "Private", url: "https://$ZZZ_HOST/$API_TOKEN" }],
        })
      );

      expect(names).toContain("API_TOKEN");
      expect(names).toContain("GLOBALPING_TOKEN");
      expect(names).toContain("NOTIFICATION_SLACK_WEBHOOK_URL");
      expect(names).toContain("ZZZ_HOST");
      expect(names).toEqual([...names].sort());
      expect(new Set(names).size).toBe(names.length);
    });

    it("keeps an explicit list authoritative and deduplicates it", () => {
      expect(
        getWorkflowSecretNames(
          config({
            sites: [{ name: "Private", url: "$DISCOVERED_SECRET" }],
            secrets: ["API_TOKEN", "API_TOKEN", "_PRIVATE"],
          })
        )
      ).toEqual(["API_TOKEN", "_PRIVATE"]);
    });

    it("preserves an explicit empty strict mode", () => {
      expect(getWorkflowSecretNames(config({ secrets: [] }))).toEqual([]);
    });

    it("rejects malformed explicit allowlists", () => {
      expect(() => validateSecretNames("API_TOKEN")).toThrow(
        "Invalid .upptimerc.yml secrets allowlist: expected a list of GitHub secret names."
      );
      expect(() => validateSecretNames(["API_TOKEN", 42])).toThrow(
        "Invalid .upptimerc.yml secrets allowlist: expected every secret name to be a string."
      );

      for (const name of ["GITHUB_TOKEN", "api_token", "2FA_TOKEN", "API-TOKEN"]) {
        expect(() => validateSecretNames([name])).toThrow(
          `Invalid secret name in .upptimerc.yml secrets allowlist: ${name}`
        );
      }
    });
  });

  describe("rendering", () => {
    it("renders empty, single, and multiple bounded contexts", () => {
      expect(renderSecretsContext([])).toBe("'{}'");
      expect(renderSecretsContext(["API_TOKEN"])).toBe(
        `'{"API_TOKEN":\${{ toJson(secrets.API_TOKEN) }}}'`
      );
      expect(renderSecretsContext(["API_TOKEN", "SECRET_SITE"])).toBe(
        `'{"API_TOKEN":\${{ toJson(secrets.API_TOKEN) }},"SECRET_SITE":\${{ toJson(secrets.SECRET_SITE) }}}'`
      );
    });

    it("renders as valid YAML without serializing the complete secrets object", () => {
      const rendered = renderSecretsContext(["API_TOKEN", "SECRET_SITE"]);
      const document = `env:\n  SECRETS_CONTEXT: ${rendered}\n`;

      expect(() => yaml.load(document)).not.toThrow();
      expect(rendered).not.toContain("toJson(secrets)");
    });

    it("validates names before interpolating them into expressions", () => {
      expect(() => renderSecretsContext(["BAD-NAME"])).toThrow(
        "Invalid secret name in .upptimerc.yml secrets allowlist: BAD-NAME"
      );
    });
  });

  describe("runtime catalog", () => {
    it("matches every literal runtime secret consumer", () => {
      const notificationSecrets = getLiteralSecrets(path.join(sourceRoot, "helpers", "notifme.ts"));
      const updateSecrets = getLiteralSecrets(path.join(sourceRoot, "update.ts"));
      const githubSecrets = getLiteralSecrets(path.join(sourceRoot, "helpers", "github.ts")).filter(
        (name) => !["GH_PAT", "GITHUB_TOKEN"].includes(name)
      );
      const environmentSource = fs.readFileSync(
        path.join(sourceRoot, "helpers", "environment.ts"),
        "utf8"
      );
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

      expect(UPPTIME_RUNTIME_SECRET_NAMES).toHaveLength(91);
      expect([...UPPTIME_RUNTIME_SECRET_NAMES]).toEqual(expected);
    });

    it("excludes separately provided and system values", () => {
      for (const name of [
        "AUTOMATION_TOKEN",
        "GH_PAT",
        "GITHUB_REPOSITORY",
        "GITHUB_TOKEN",
        "SECRETS_CONTEXT",
      ]) {
        expect(UPPTIME_RUNTIME_SECRET_NAMES).not.toContain(name as never);
      }
    });
  });
});
