/** Get a secret from the context or an environment variable */
export declare const getSecret: (key: string) => string | undefined;
/** Get the GitHub repo */
export declare const getOwnerRepo: () => [string, string];
