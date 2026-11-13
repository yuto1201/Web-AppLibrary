import type { ReactNode } from "react";
import type { App } from "@/data/schema";
import { apps } from "@/data/registry";
import { appLinks, showsStoreFacts } from "@/lib/app-links";
import { AppFrameStrip, AppFrameView } from "@/components/AppFrameClient";

/** 法務・サポートのページの先頭の帯。枠の色の変数を持つ .app-frame で包む（保存テーマに従い、light 固定にはしない）。 */
export function AppFrameHeader({ app }: { app: App }) {
  return (
    <div className="app-frame">
      <AppFrameStrip app={app} />
    </div>
  );
}

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
