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
}
