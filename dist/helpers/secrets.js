"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatedWorkflowToken = exports.githubAppTokenSteps = exports.githubAppTokenJobEnvironment = exports.getOwnerRepo = exports.getSecret = exports.hydrateSecretsEnvironment = void 0;
const hydrateSecretsEnvironment = (serialized = process.env.SECRETS_CONTEXT || "{}") => {
    const secrets = JSON.parse(serialized);
    for (const [name, value] of Object.entries(secrets)) {
        if (typeof value === "string" && value.length > 0)
            process.env[name] = value;
    }
};
exports.hydrateSecretsEnvironment = hydrateSecretsEnvironment;
/** Get a secret from the context or an environment variable */
const getSecret = (key) => {
    const SECRETS_CONTEXT = process.env.SECRETS_CONTEXT || "{}";
    const allSecrets = JSON.parse(SECRETS_CONTEXT);
    if (allSecrets[key])
        return allSecrets[key];
    return process.env[key];
};
exports.getSecret = getSecret;
/** Get the GitHub repo */
const getOwnerRepo = () => {
    const result = ((0, exports.getSecret)("GITHUB_REPOSITORY") || "").split("/");
    if (result.length !== 2)
        throw new Error("Unable to find GitHub repo");
    return result;
};
exports.getOwnerRepo = getOwnerRepo;
exports.githubAppTokenJobEnvironment = `    env:
      GH_APP_PRIVATE_KEY: \${{ secrets.GH_APP_PRIVATE_KEY }}`;
exports.githubAppTokenSteps = `      - name: Create GitHub App token
        id: app_token
        if: \${{ vars.GH_APP_ID != '' && env.GH_APP_PRIVATE_KEY != '' }}
        uses: actions/create-github-app-token@v3
        with:
          client-id: \${{ vars.GH_APP_ID }}
          private-key: \${{ env.GH_APP_PRIVATE_KEY }}
      - name: Clear GitHub App private key
        if: \${{ always() }}
        shell: bash
        run: echo "GH_APP_PRIVATE_KEY=" >> "$GITHUB_ENV"`;
exports.generatedWorkflowToken = "\${{ steps.app_token.outputs.token || secrets.GH_PAT || github.token }}";
//# sourceMappingURL=secrets.js.map