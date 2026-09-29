"use client";

import { useSiteState } from "@/lib/state";
import { AppSpotlight } from "./AppSpotlight";

export function HomeShowcase() {
  const { t } = useSiteState();
  return (
    <section className="section home-showcase" aria-labelledby="showcase-heading">
      <div className="showcase-copy">
        <p className="eyebrow" lang="en">TAKE A CLOSER LOOK</p>
        <h2 className="showcase-title" id="showcase-heading" lang="en">FIND YOUR<br />EVERYDAY.</h2>
        <p className="showcase-intro">{t.showcase_intro}</p>
        <span className="showcase-mark" aria-hidden="true"><svg viewBox="0 0 80 80" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 40h56M44 16l24 24-24 24" /></svg></span>
      </div>
      <AppSpotlight />
    </section>
  );
}
