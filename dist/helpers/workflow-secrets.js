"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSecretsContext = exports.getWorkflowSecretNames = exports.getConfiguredSecretReferences = exports.validateSecretNames = exports.UPPTIME_RUNTIME_SECRET_NAMES = void 0;
const SECRET_NAME_PATTERN = /^[A-Z_][A-Z0-9_]*$/;
const DISCOVERABLE_SECRET_PATTERN = /\$([A-Z_][A-Z0-9_]*)/g;
const EXCLUDED_DISCOVERED_NAMES = new Set([
    "DYNAMIC_ALPHANUMERIC_STRING",
    "DYNAMIC_RANDOM_NUMBER",
    "GH_PAT",
]);
exports.UPPTIME_RUNTIME_SECRET_NAMES = [
    "DYNAMIC_STRING_LENGTH",
    "GLOBALPING_TOKEN",
    "NOTIFICATIONS_DOWN_MESSAGE",
    "NOTIFICATIONS_UP_MESSAGE",
    "NOTIFICATION_CUSTOM_WEBHOOK",
    "NOTIFICATION_CUSTOM_WEBHOOK_URL",
    "NOTIFICATION_DISCORD_WEBHOOK_URL",
    "NOTIFICATION_EMAIL",
    "NOTIFICATION_EMAIL_FROM",
    "NOTIFICATION_EMAIL_MAILGUN",
    "NOTIFICATION_EMAIL_MAILGUN_API_KEY",
    "NOTIFICATION_EMAIL_MAILGUN_DOMAIN_NAME",
    "NOTIFICATION_EMAIL_SENDGRID",
    "NOTIFICATION_EMAIL_SENDGRID_API_KEY",
    "NOTIFICATION_EMAIL_SES",
    "NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID",
    "NOTIFICATION_EMAIL_SES_REGION",
    "NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY",
    "NOTIFICATION_EMAIL_SES_SESSION_TOKEN",
    "NOTIFICATION_EMAIL_SMTP",
    "NOTIFICATION_EMAIL_SMTP_HOST",
    "NOTIFICATION_EMAIL_SMTP_PASSWORD",
    "NOTIFICATION_EMAIL_SMTP_PORT",
    "NOTIFICATION_EMAIL_SMTP_USERNAME",
    "NOTIFICATION_EMAIL_SPARKPOST",
    "NOTIFICATION_EMAIL_SPARKPOST_API_KEY",
    "NOTIFICATION_EMAIL_STRATEGY",
    "NOTIFICATION_EMAIL_TO",
    "NOTIFICATION_GOOGLE_CHAT_WEBHOOK_URL",
    "NOTIFICATION_GOTIFY",
    "NOTIFICATION_GOTIFY_PRIORITY",
    "NOTIFICATION_GOTIFY_TITLE",
    "NOTIFICATION_GOTIFY_TOKEN",
    "NOTIFICATION_GOTIFY_URL",
    "NOTIFICATION_LARK",
    "NOTIFICATION_LARK_BOT_WEBHOOK",
    "NOTIFICATION_MASTODON",
    "NOTIFICATION_MASTODON_API_KEY",
    "NOTIFICATION_MASTODON_INSTANCE_URL",
    "NOTIFICATION_MASTODON_TOOT_VISIBILITY",
    "NOTIFICATION_MISSKEY",
    "NOTIFICATION_MISSKEY_API_KEY",
    "NOTIFICATION_MISSKEY_CHAT",
    "NOTIFICATION_MISSKEY_CHAT_USER_ID",
    "NOTIFICATION_MISSKEY_INSTANCE_URL",
    "NOTIFICATION_MISSKEY_NOTE",
    "NOTIFICATION_MISSKEY_NOTE_VISIBILITY",
    "NOTIFICATION_MISSKEY_NOTE_VISIBLE_USER_IDS",
    "NOTIFICATION_SLACK",
    "NOTIFICATION_SLACK_STRATEGY",
    "NOTIFICATION_SLACK_WEBHOOK_URL",
    "NOTIFICATION_SMS_46ELKS",
    "NOTIFICATION_SMS_46ELKS_API_PASSWORD",
    "NOTIFICATION_SMS_46ELKS_API_USERNAME",
    "NOTIFICATION_SMS_CALLR",
    "NOTIFICATION_SMS_CALLR_LOGIN",
    "NOTIFICATION_SMS_CALLR_PASSWORD",
    "NOTIFICATION_SMS_CLICKATELL",
    "NOTIFICATION_SMS_CLICKATELL_API_KEY",
    "NOTIFICATION_SMS_FROM",
    "NOTIFICATION_SMS_INFOBIP",
    "NOTIFICATION_SMS_INFOBIP_PASSWORD",
    "NOTIFICATION_SMS_INFOBIP_USERNAME",
    "NOTIFICATION_SMS_NEXMO",
    "NOTIFICATION_SMS_NEXMO_API_KEY",
    "NOTIFICATION_SMS_NEXMO_API_SECRET",
    "NOTIFICATION_SMS_OVH",
    "NOTIFICATION_SMS_OVH_ACCOUNT",
    "NOTIFICATION_SMS_OVH_APP_KEY",
    "NOTIFICATION_SMS_OVH_APP_SECRET",
    "NOTIFICATION_SMS_OVH_CONSUMER_KEY",
    "NOTIFICATION_SMS_OVH_HOST",
    "NOTIFICATION_SMS_PLIVO",
    "NOTIFICATION_SMS_PLIVO_AUTH_ID",
    "NOTIFICATION_SMS_PLIVO_AUTH_TOKEN",
    "NOTIFICATION_SMS_STRATEGY",
    "NOTIFICATION_SMS_TO",
    "NOTIFICATION_SMS_TWILIO",
    "NOTIFICATION_SMS_TWILIO_ACCOUNT_SID",
    "NOTIFICATION_SMS_TWILIO_AUTH_TOKEN",
    "NOTIFICATION_TEAMS",
    "NOTIFICATION_TEAMS_WEBHOOK_URL",
    "NOTIFICATION_TELEGRAM",
    "NOTIFICATION_TELEGRAM_BOT_KEY",
    "NOTIFICATION_TELEGRAM_CHAT_ID",
    "NOTIFICATION_ZULIP_API_EMAIL",
    "NOTIFICATION_ZULIP_API_KEY",
    "NOTIFICATION_ZULIP_MESSAGE_URL",
    "RANDOM_MAX",
    "RANDOM_MIN",
    "USER_AGENT",
];
const invalidSecretNameError = (name) => new Error(`Invalid secret name in .upptimerc.yml secrets allowlist: ${name}. ` +
    "GitHub secret names must contain only uppercase letters, numbers, and underscores, " +
    "must not start with a number, and must not start with GITHUB_.");
const validateSecretNames = (names) => {
    if (!Array.isArray(names)) {
        throw new Error("Invalid .upptimerc.yml secrets allowlist: expected a list of GitHub secret names.");
    }
    const validatedNames = [];
    for (const name of names) {
        if (typeof name !== "string") {
            throw new Error("Invalid .upptimerc.yml secrets allowlist: expected every secret name to be a string.");
        }
        if (!SECRET_NAME_PATTERN.test(name) || name.startsWith("GITHUB_")) {
            throw invalidSecretNameError(name);
        }
        if (!validatedNames.includes(name))
            validatedNames.push(name);
    }
    return validatedNames;
};
exports.validateSecretNames = validateSecretNames;
const collectSecretReferences = (value, names) => {
    if (typeof value !== "string")
        return;
    for (const match of value.matchAll(DISCOVERABLE_SECRET_PATTERN)) {
        const name = match[1];
        if (!name.startsWith("GITHUB_") && !EXCLUDED_DISCOVERED_NAMES.has(name)) {
            names.add(name);
        }
    }
};
const getConfiguredSecretReferences = (config) => {
    const names = new Set();
    for (const site of config.sites || []) {
        collectSecretReferences(site.url, names);
        for (const header of site.headers || [])
            collectSecretReferences(header, names);
        collectSecretReferences(site.body, names);
        collectSecretReferences(site.port, names);
        collectSecretReferences(site.__dangerous__body_down, names);
        collectSecretReferences(site.__dangerous__body_down_if_text_missing, names);
        collectSecretReferences(site.__dangerous__body_degraded, names);
        collectSecretReferences(site.__dangerous__body_degraded_if_text_missing, names);
    }
    return [...names].sort();
};
exports.getConfiguredSecretReferences = getConfiguredSecretReferences;
const getWorkflowSecretNames = (config) => {
    if (config.secrets !== undefined)
        return (0, exports.validateSecretNames)(config.secrets);
    return [
        ...new Set([...exports.UPPTIME_RUNTIME_SECRET_NAMES, ...(0, exports.getConfiguredSecretReferences)(config)]),
    ].sort();
};
exports.getWorkflowSecretNames = getWorkflowSecretNames;
const renderSecretsContext = (names) => {
    const validatedNames = (0, exports.validateSecretNames)(names);
    const secretPairs = validatedNames
        .map((name) => `${JSON.stringify(name)}:\${{ toJson(secrets.${name}) }}`)
        .join(",");
    // GitHub Actions evaluates expressions inside YAML string scalars, so this
    // keeps JSON structure static while each allowlisted secret is resolved at runtime.
    return `'{${secretPairs}}'`;
};
exports.renderSecretsContext = renderSecretsContext;
//# sourceMappingURL=workflow-secrets.js.map