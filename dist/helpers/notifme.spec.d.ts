declare const mockNotifmeSend: jest.Mock<any, any, any>;
declare const mockNotifmeConstructor: jest.Mock<any, any, any>;
declare const originalEnv: NodeJS.ProcessEnv;
declare const loadNotifme: (secrets: Record<string, string>) => {
    formatNotificationError: (error: unknown) => string;
    formatTelegramHtmlMessage: (message: string) => string;
    createTeamsAdaptiveCardPayload: (message: string) => {
        type: string;
        attachments: {
            contentType: string;
            contentUrl: null;
            content: {
                $schema: string;
                type: string;
                version: string;
                body: {
                    type: string;
                    text: string;
                    wrap: boolean;
                }[];
            };
        }[];
    };
    sendNotification: (message: string) => Promise<void>;
    axios: {
        post: jest.Mock;
    };
};
