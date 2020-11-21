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
    slug?: string;
    __dangerous__insecure?: boolean;
  }[];
  notifications?: { type: string; [index: string]: string }[];
  assignees: string[];
  PAT?: string;
  "status-website"?: {
    cname?: string;
    logoUrl?: string;
    name?: string;
    introTitle?: string;
    introMessage?: string;
    navbar?: { title: string; url: string }[];
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
  summaryStartHtmlComment?: string;
  summaryEndHtmlComment?: string;
  commitPrefixStatusUp?: string;
  commitPrefixStatusDown?: string;
  i18n?: {
    up?: string;
    down?: string;
    url?: string;
    status?: string;
    history?: string;
    responseTime?: string;
    uptime?: string;
    responseTimeGraphAlt?: string;
  } & Record<string, string>;
}

export interface SiteHistory {
  url: string;
  status: "up" | "down";
  code: number;
  responseTime: number;
  lastUpdated?: string;
  startTime?: string;
  generator: "Upptime <https://github.com/upptime/upptime>";
}

export interface SiteStatus {
  /** Name of site */
  name: string;
  /** Short slug of the site */
  slug: string;
  /** Full URL of the site */
  url: string;
  /** Current status, up or down */
  status: "up" | "down";
  /** Current response time (ms) */
  time: number;
  /** Total uptime percentage */
  uptime: string;
}
