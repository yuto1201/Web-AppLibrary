"use client";

import Link from "next/link";
import { useSiteState } from "@/lib/state";
import { posts, profile, social } from "@/lib/site-data";

export function Posts() {
  const { t } = useSiteState();
  if (posts.length === 0) return null;

  return (
    <section className="section" id="posts">
      <div className="section-head">
        <h2 className="section-title">{t.section_posts}</h2>
        <span className="section-count">{posts.length}</span>
      </div>
      <ul className="post-list">
        {posts.map((post) => (
          <li className="post" lang="ja" key={post.date + post.title}>
            <time className="post-date" dateTime={post.date}>{post.date}</time>
            <span className="post-body">
              <span className="post-title">{post.title}</span>
              <span className="post-excerpt">{post.excerpt}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Contact() {
  const { t } = useSiteState();
  // url が空 / "#" のエントリは未公開とみなして描画しない。
  const visible = social.filter((entry) => entry.url && entry.url !== "#");

  return (
    <section className="section" id="contact">
      <h2 className="contact-h">{t.contact_h}</h2>
      <p className="contact-p">{t.contact_p}</p>
      {visible.length > 0 && (
        <ul className="socials">
          {visible.map((entry) => (
            <li key={entry.label}>
              <a className="social-link" href={entry.url} target="_blank" rel="noopener noreferrer">
                <span className="social-label">{entry.label}</span>
                <span className="social-handle">{entry.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function Footer() {
  const { t } = useSiteState();

  return (
    <footer className="footer">
      <span>{t.footer_copyright}</span>
      <span className="footer-links">
        <Link href="/privacy/">{t.privacy}</Link>
        <Link href="/terms/">{t.terms}</Link>
        <span>{profile.name}</span>
      </span>
    </footer>
  );
}
