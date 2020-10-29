export interface UpptimeConfig {
  owner: string;
  repo: string;
  "user-agent"?: string;
  sites: { method?: string; name: string; url: string; assignees?: string[] }[];
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
}
