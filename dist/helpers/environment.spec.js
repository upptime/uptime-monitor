"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./environment");
const secrets_1 = require("./secrets");
describe("replaceEnvironmentVariables", () => {
    const names = ["UPPTIME_TEST_HOST", "UPPTIME_TEST_HOST_PORT"];
    afterEach(() => names.forEach((name) => delete process.env[name]));
    it("replaces a name that has another name as its prefix", () => {
        // Same order as a SECRETS_CONTEXT allowlist, which is sorted by name
        (0, secrets_1.hydrateSecretsEnvironment)(JSON.stringify({ UPPTIME_TEST_HOST: "gateway.example.com", UPPTIME_TEST_HOST_PORT: "2222" }));
        expect((0, environment_1.replaceEnvironmentVariables)("$UPPTIME_TEST_HOST_PORT")).toBe("2222");
        expect((0, environment_1.replaceEnvironmentVariables)("$UPPTIME_TEST_HOST")).toBe("gateway.example.com");
        expect((0, environment_1.replaceEnvironmentVariables)("$UPPTIME_TEST_HOST:$UPPTIME_TEST_HOST_PORT")).toBe("gateway.example.com:2222");
    });
});
//# sourceMappingURL=environment.spec.js.map