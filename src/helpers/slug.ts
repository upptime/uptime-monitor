import slugify from "@sindresorhus/slugify";
import { UpptimeConfig } from "../interfaces";

const sanitizeUnicodeSlug = (name: string): string =>
  name
    .normalize("NFKC")
    .trim()
    .replace(/[\\/]/g, "-")
    .replace(/[<>:"|?*#%]/g, "-")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");

export const getSiteSlug = (site: UpptimeConfig["sites"][number]): string => {
  const explicitSlug = site.slug?.trim();
  if (explicitSlug) return explicitSlug;

  const asciiSlug = slugify(site.name);
  if (asciiSlug) return asciiSlug;

  const unicodeSlug = sanitizeUnicodeSlug(site.name);
  if (unicodeSlug) return unicodeSlug;

  return slugify(site.url) || "site";
};
