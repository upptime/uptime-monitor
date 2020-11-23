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
    maxResponseTime?: number;
    __dangerous__insecure?: boolean;
    __dangerous__disable_verify_host?: boolean;
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
  liveStatusHtmlComment?: string;
  commitPrefixStatusUp?: string;
  commitPrefixStatusDown?: string;
  commitPrefixStatusDegraded?: string;
  i18n?: {
    up?: string;
    down?: string;
    degraded?: string;
    url?: string;
    status?: string;
    history?: string;
    ms?: string;
    responseTime?: string;
    uptime?: string;
    responseTimeGraphAlt?: string;
    liveStatus?: string;
    allSystemsOperational?: string;
    degradedPerformance?: string;
    completeOutage?: string;
    partialOutage?: string;
  } & Record<string, string>;
}

export interface SiteHistory {
  url: string;
  status: "up" | "down" | "degraded";
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
  status: "up" | "down" | "degraded";
  /** Current response time (ms) */
  time: number;
  /** Total uptime percentage */
  uptime: string;
}
