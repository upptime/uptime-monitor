export interface UpptimeConfig {
    owner: string;
    repo: string;
    "user-agent"?: string;
    sites: {
        method?: string;
        name: string;
        url: string;
        expectedStatusCodes?: number[];
        assignees?: string[];
        headers?: string[];
        __dangerous__insecure?: boolean;
    }[];
    notifications?: {
        type: string;
        [index: string]: string;
    }[];
    assignees: string[];
    PAT?: string;
    "status-website"?: {
        cname?: string;
        logoUrl?: string;
        name?: string;
        introTitle?: string;
        introMessage?: string;
        navbar?: {
            title: string;
            url: string;
        }[];
    };
    skipDescriptionUpdate?: boolean;
    skipTopicsUpdate?: boolean;
    skipHomepageUpdate?: boolean;
    skipDeleteIssues?: boolean;
    commitMessages?: {
        readmeContent?: string;
        summaryJson?: string;
        statusChange?: string;
        graphsUpdate?: string;
        commitAuthorName?: string;
        commitAuthorEmail?: string;
    };
}
