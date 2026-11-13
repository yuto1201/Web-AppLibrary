import type { App } from "@/data/schema";
import { supportDocuments } from "@/data/support/registry";
import { termsDocuments } from "@/data/terms/registry";

export type AppLinks = {
  support: string;
  privacy: string;
  terms: string | null;
  store: string | null;
};

/** アプリの「このアプリについて」に並べるリンクの行き先。専用ページを持たないものは連絡先 / null。 */
export function appLinks(app: App): AppLinks {
  return {
    support: Object.hasOwn(supportDocuments, app.slug) ? `/apps/${app.slug}/support/` : "/#contact",
    privacy: `/apps/${app.slug}/privacy/`,
    terms: Object.hasOwn(termsDocuments, app.slug) ? `/apps/${app.slug}/terms/` : null,
    store: app.appStoreUrl,
  };
}
