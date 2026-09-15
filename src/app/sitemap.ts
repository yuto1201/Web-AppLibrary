import type { MetadataRoute } from "next";
import project from "../../config/project.json";
import { apps } from "@/data/registry";
import { termsDocuments } from "@/data/terms/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "privacy/",
    "terms/",
    ...apps.flatMap((app) => [`apps/${app.slug}/`, `apps/${app.slug}/privacy/`]),
    ...apps.filter((app) => termsDocuments[app.slug]).map((app) => `apps/${app.slug}/terms/`),
  ];

  return paths.map((path) => ({ url: new URL(path, project.productionUrl).href }));
}
