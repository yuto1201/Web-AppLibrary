"use client";

import { useSiteState } from "@/lib/state";
import { profile, posts } from "@/lib/site-data";
import { IconSun, IconMoon } from "./icons";

export function Nav() {
  const { prefs, setPrefs, t } = useSiteState();
  const hasPosts = posts.length > 0;

  return (
    <nav className="nav" aria-label={t.a11y_primary_nav}>
      <div className="nav-inner">
        <a className="nav-brand" href="#top">{profile.name}</a>
        <div className="nav-links">
          <a href="#apps">{t.nav.apps}</a>
          {hasPosts && <a href="#posts">{t.nav.posts}</a>}
          <a href="#contact">{t.nav.contact}</a>
        </div>
        <div className="nav-tools">
          <button
            className="text-btn"
            type="button"
            title={t.a11y_language}
            aria-label={t.a11y_switch_language}
            onClick={() => setPrefs({ lang: prefs.lang === "ja" ? "en" : "ja" })}
          >
            {prefs.lang === "ja" ? "EN" : "JA"}
          </button>
          <button
            className="icon-btn"
            type="button"
            title={t.a11y_theme}
            aria-label={prefs.theme === "dark" ? t.a11y_switch_light : t.a11y_switch_dark}
            onClick={() => setPrefs({ theme: prefs.theme === "dark" ? "light" : "dark" })}
          >
            {prefs.theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
