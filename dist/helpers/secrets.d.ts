export declare const hydrateSecretsEnvironment: (serialized?: string) => void;
/** Get a secret from the context or an environment variable */
export declare const getSecret: (key: string) => string | undefined;
/** Get the GitHub repo */
export declare const getOwnerRepo: () => [string, string];
export declare const githubAppTokenJobEnvironment = "    env:\n      GH_APP_PRIVATE_KEY: ${{ secrets.GH_APP_PRIVATE_KEY }}";
export declare const githubAppTokenSteps = "      - name: Create GitHub App token\n        id: app_token\n        if: ${{ vars.GH_APP_ID != '' && env.GH_APP_PRIVATE_KEY != '' }}\n        uses: actions/create-github-app-token@v3\n        with:\n          client-id: ${{ vars.GH_APP_ID }}\n          private-key: ${{ env.GH_APP_PRIVATE_KEY }}\n      - name: Clear GitHub App private key\n        if: ${{ always() }}\n        shell: bash\n        run: echo \"GH_APP_PRIVATE_KEY=\" >> \"$GITHUB_ENV\"";
export declare const generatedWorkflowToken = "${{ steps.app_token.outputs.token || secrets.GH_PAT || github.token }}";
