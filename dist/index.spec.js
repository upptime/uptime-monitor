"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secrets_1 = require("./helpers/secrets");
const originalEnv = process.env;
describe("secrets environment hydration", () => {
    beforeEach(() => {
        process.env = { ...originalEnv };
    });
    afterAll(() => {
        process.env = originalEnv;
    });
    it("promotes non-empty secret values with contextual precedence", () => {
        process.env.API_TOKEN = "runner-value";
        (0, secrets_1.hydrateSecretsEnvironment)(JSON.stringify({ API_TOKEN: "secret-value" }));
        expect(process.env.API_TOKEN).toBe("secret-value");
    });
    it("does not erase existing values when contextual secrets are empty", () => {
        process.env.USER_AGENT = "runner-agent";
        process.env.RANDOM_MIN = "10";
        (0, secrets_1.hydrateSecretsEnvironment)(JSON.stringify({ USER_AGENT: "", RANDOM_MIN: "" }));
        expect(process.env.USER_AGENT).toBe("runner-agent");
        expect(process.env.RANDOM_MIN).toBe("10");
    });
    it("ignores null, undefined, and non-string values", () => {
        process.env.EXISTING = "preserved";
        (0, secrets_1.hydrateSecretsEnvironment)(JSON.stringify({
            EXISTING: null,
            NUMBER_VALUE: 42,
            BOOLEAN_VALUE: true,
        }));
        expect(process.env.EXISTING).toBe("preserved");
        expect(process.env.NUMBER_VALUE).toBeUndefined();
        expect(process.env.BOOLEAN_VALUE).toBeUndefined();
        expect(Object.values(process.env)).not.toContain("undefined");
        expect(Object.values(process.env)).not.toContain("null");
    });
    it("throws for malformed JSON", () => {
        expect(() => (0, secrets_1.hydrateSecretsEnvironment)("{not-json")).toThrow();
    });
    it("never logs secret values", () => {
        const log = jest.spyOn(console, "log").mockImplementation(() => { });
        const error = jest.spyOn(console, "error").mockImplementation(() => { });
        (0, secrets_1.hydrateSecretsEnvironment)(JSON.stringify({ API_TOKEN: "must-not-be-logged" }));
        expect(log).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
        log.mockRestore();
        error.mockRestore();
    });
});
//# sourceMappingURL=index.spec.js.map