export declare const formatTelegramHtmlMessage: (message: string) => string;
export declare const createTeamsAdaptiveCardPayload: (message: string) => {
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
export declare const sendNotification: (message: string) => Promise<void>;
