import type { ReactNode } from "react";
import type { App } from "@/data/schema";
import { apps } from "@/data/registry";
import { appLinks, showsStoreFacts } from "@/lib/app-links";
import { AppFrameView } from "@/components/AppFrameClient";

export { AppFrameStrip } from "@/components/AppFrameClient";

/** アプリのページの共通の枠。registry を読むのでサーバーで行き先を決め、表示は AppFrameView に渡す。 */
export function AppFrame({ app, light, children }: { app: App; light: boolean; children: ReactNode }) {
  return (
    <AppFrameView
      app={app}
      light={light}
      links={appLinks(app)}
      storeFacts={showsStoreFacts(app)}
      others={apps
        .filter((other) => other.slug !== app.slug)
        .map(({ slug, name, tagline, accent, icon }) => ({ slug, name, tagline, accent, icon }))}
    >
      {children}
    </AppFrameView>
  );
}
