import NotifMeSdk from "notifme-sdk";

export interface UpptimeConfig {
  owner: string;
  repo: string;
  "user-agent"?: string;
  sites: SiteConfig[];
  notifications?: { type: string; [index: string]: string }[];
  assignees: string[];
  delay?: number;
  PAT?: string;
  "status-website"?: {
    cname?: string;
    logoUrl?: string;
    name?: string;
    introTitle?: string;
    introMessage?: string;
    navbar?: { title: string; url: string }[];
    publish?: boolean;
    singleCommit?: boolean;
  };
  skipDescriptionUpdate?: boolean;
  skipTopicsUpdate?: boolean;
  skipHomepageUpdate?: boolean;
  skipDeleteIssues?: boolean;
  skipPoweredByReadme?: boolean;
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
    responseTimeDay?: string;
    responseTimeWeek?: string;
    responseTimeMonth?: string;
    responseTimeYear?: string;
    uptime?: string;
    uptimeDay?: string;
    uptimeWeek?: string;
    uptimeMonth?: string;
    uptimeYear?: string;
    responseTimeGraphAlt?: string;
    liveStatus?: string;
    allSystemsOperational?: string;
    degradedPerformance?: string;
    completeOutage?: string;
    partialOutage?: string;
  } & Record<string, string>;
  workflowSchedule: {
    graphs?: string;
    responseTime?: string;
    staticSite?: string;
    summary?: string;
    updateTemplate?: string;
    updates?: string;
    uptime?: string;
  };
  runner?: string;
  customStatusWebsitePackage?: string;
  skipGeneratingWebsite?: boolean;
}

export interface SiteConfig {
  check?: "http" | "tcp-ping" | "ws";
  method?: string;
  name: string;
  url: string;
  port?: number;
  expectedStatusCodes?: number[];
  assignees?: string[];
  headers?: string[];
  tags?: string[];
  slug?: string;
  body?: string;
  icon?: string;
  maxResponseTime?: number;
  maxRedirects?: number;
  verbose?: boolean;
  ipv6?: boolean;
  customNotification: CustomNotification[];
  __dangerous__insecure?: boolean;
  __dangerous__disable_verify_peer?: boolean;
  __dangerous__disable_verify_host?: boolean;
  __dangerous__body_down?: string;
  __dangerous__body_down_if_text_missing?: string;
  __dangerous__body_degraded?: string;
  __dangerous__body_degraded_if_text_missing?: string;
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
  /** Favicon URL of the site */
  icon: string;
  /** Current status, up or down */
  status: "up" | "down" | "degraded";
  /** Current response time (ms) */
  time: number;
  timeDay: number;
  timeWeek: number;
  timeMonth: number;
  timeYear: number;
  /** Total uptime percentage */
  uptime: string;
  uptimeDay: string;
  uptimeWeek: string;
  uptimeMonth: string;
  uptimeYear: string;
  /** Summary for downtimes */
  dailyMinutesDown: Record<string, number>;
}

export interface Downtimes {
  day: number;
  week: number;
  month: number;
  year: number;
  all: number;
  dailyMinutesDown: Record<string, number>;
}
export interface DownPecentages {
  day: string;
  week: string;
  month: string;
  year: string;
  all: string;
  dailyMinutesDown: Record<string, number>;
}

export interface CustomNotification {
  customWebhook?: CustomWebhookConfig;
  discord?: DiscordConfig;
  email?: EmailConfig;
  googleChat?: GoogleChatConfig;
  lark?: LarkConfig;
  mastodon?: MastodonConfig;
  misskey?: MisskeyConfig;
  msTeams?: MSTeamsConfig;
  slack?: SlackConfig;
  sms?: SMSConfig;
  telegram?: TelegramConfig;
  zulip?: ZulipConfig;
}

export interface CustomWebhookConfig {
  url?: string;
  message?: string;
}
export interface DiscordConfig {
  url: string;
  message?: string;
}

export interface EmailConfig {
  to: string;
  from: string;
  subject?: string;
  message?: string;
}

export interface GoogleChatConfig {
  url: string;
  message?: string;
}

export interface LarkConfig {
  url: string;
  message?: string;
}

export type MastodonVisibility = "public" | "unlisted" | "private" | "direct";
export interface MastodonConfig {
  url: string;
  tootVisibility: MastodonVisibility;
  apiKey: string;
  message?: string;
}

export type MisskeyMessageMethod = "note" | "chat";
export type MisskeyNoteVisibility = "public" | "home" | "followers" | "specified";
export interface MisskeyConfig {
  method: MisskeyMessageMethod;
  url: string;
  apiKey: string;
  misskeyNoteVisibility?: MisskeyNoteVisibility;
  userId?: string;
  userIdsString?: string;
  message?: string;
}

export interface MSTeamsConfig {
  url: string;
  summary?: string;
  message?: string;
  themeColor?: string;
}

export interface SlackConfig {
  customUrl?: string;
  message?: string;
}

export interface SMSConfig {
  from: string;
  to: string;
  message?: string;
}

export interface TelegramConfig {
  chatIdsString: string;
  message?: string;
}

export interface ZulipConfig {
  url: string;
  apiUsername: string;
  apiKey: string;
  message?: string;
}
