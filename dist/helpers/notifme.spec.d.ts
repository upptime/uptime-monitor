declare const originalEnv: NodeJS.ProcessEnv;
declare const loadNotifme: (secrets: Record<string, string>) => {
    formatTelegramHtmlMessage: (message: string) => string;
    sendNotification: (message: string) => Promise<void>;
    axios: {
        post: jest.Mock;
    };
};
