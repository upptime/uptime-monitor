export const removeUrlProtocol = (uri: string): string => {
    let rawUri = uri;
    rawUri = rawUri.replace(/^https?:\/\//,'');
    rawUri = rawUri.replace(/^http?:\/\//,'');
    return rawUri
};
