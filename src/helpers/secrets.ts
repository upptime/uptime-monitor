export const hydrateSecretsEnvironment = (serialized = process.env.SECRETS_CONTEXT || "{}") => {
  const secrets = JSON.parse(serialized) as Record<string, unknown>;
  for (const [name, value] of Object.entries(secrets)) {
    if (typeof value === "string" && value.length > 0) process.env[name] = value;
  }
};

/** Get a secret from the context or an environment variable */
export const getSecret = (key: string) => {
  const SECRETS_CONTEXT = process.env.SECRETS_CONTEXT || "{}";
  const allSecrets: Record<string, string> = JSON.parse(SECRETS_CONTEXT);
  if (allSecrets[key]) return allSecrets[key];
  return process.env[key];
};

/** Get the GitHub repo */
export const getOwnerRepo = (): [string, string] => {
  const result = (getSecret("GITHUB_REPOSITORY") || "").split("/");
  if (result.length !== 2) throw new Error("Unable to find GitHub repo");
  return result as [string, string];
};

export const githubAppTokenJobEnvironment = `    env:
      GH_APP_PRIVATE_KEY: \${{ secrets.GH_APP_PRIVATE_KEY }}`;

export const githubAppTokenSteps = `      - name: Create GitHub App token
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

export const generatedWorkflowToken =
  "\${{ steps.app_token.outputs.token || secrets.GH_PAT || github.token }}";
