"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteSlug = void 0;
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const sanitizeUnicodeSlug = (name) => name
    .normalize("NFKC")
    .trim()
    .replace(/[\\/]/g, "-")
    .replace(/[<>:"|?*#%]/g, "-")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");
const getSiteSlug = (site) => {
    const explicitSlug = site.slug?.trim();
    if (explicitSlug)
        return explicitSlug;
    const asciiSlug = (0, slugify_1.default)(site.name);
    if (asciiSlug)
        return asciiSlug;
    const unicodeSlug = sanitizeUnicodeSlug(site.name);
    if (unicodeSlug)
        return unicodeSlug;
    return (0, slugify_1.default)(site.url) || "site";
};
exports.getSiteSlug = getSiteSlug;
//# sourceMappingURL=slug.js.map