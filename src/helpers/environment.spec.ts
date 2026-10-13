import { replaceEnvironmentVariables } from "./environment";
import { hydrateSecretsEnvironment } from "./secrets";

describe("replaceEnvironmentVariables", () => {
  const names = ["UPPTIME_TEST_HOST", "UPPTIME_TEST_HOST_PORT"];

  afterEach(() => names.forEach((name) => delete process.env[name]));

  it("replaces a name that has another name as its prefix", () => {
    // Same order as a SECRETS_CONTEXT allowlist, which is sorted by name
    hydrateSecretsEnvironment(
      JSON.stringify({ UPPTIME_TEST_HOST: "gateway.example.com", UPPTIME_TEST_HOST_PORT: "2222" })
    );

    expect(replaceEnvironmentVariables("$UPPTIME_TEST_HOST_PORT")).toBe("2222");
    expect(replaceEnvironmentVariables("$UPPTIME_TEST_HOST")).toBe("gateway.example.com");
    expect(replaceEnvironmentVariables("$UPPTIME_TEST_HOST:$UPPTIME_TEST_HOST_PORT")).toBe(
      "gateway.example.com:2222"
    );
  });
});
