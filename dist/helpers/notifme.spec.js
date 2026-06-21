"use strict";
jest.mock("axios", () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
    },
}));
const originalEnv = process.env;
const loadNotifme = (secrets) => {
    jest.resetModules();
    process.env = { ...originalEnv, SECRETS_CONTEXT: JSON.stringify(secrets) };
    const axios = require("axios").default;
    axios.post.mockResolvedValue({});
    const notifme = require("./notifme");
    return { axios, ...notifme };
};
describe("Telegram notifications", () => {
    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });
    it("formats Upptime's default GitHub-flavored status message for Telegram HTML", async () => {
        const { axios, sendNotification } = loadNotifme({
            NOTIFICATION_TELEGRAM: "true",
            NOTIFICATION_TELEGRAM_BOT_KEY: "telegram-token",
            NOTIFICATION_TELEGRAM_CHAT_ID: "12345",
        });
        await sendNotification("🟥 My_Site (https://example.com/?a=1&b=2) is **down** : https://github.com/o/r/issues/1");
        expect(axios.post).toHaveBeenCalledWith("https://api.telegram.org/bottelegram-token/sendMessage", {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            chat_id: "12345",
            text: "🟥 My_Site (https://example.com/?a=1&amp;b=2) is <b>down</b> : https://github.com/o/r/issues/1",
        });
    });
    it("escapes Telegram HTML while preserving converted bold segments", () => {
        const { formatTelegramHtmlMessage } = loadNotifme({});
        expect(formatTelegramHtmlMessage("**down <again>** & needs attention")).toBe("<b>down &lt;again&gt;</b> &amp; needs attention");
    });
});
//# sourceMappingURL=notifme.spec.js.map