"use client";

import Link from "next/link";
import { useSiteState } from "@/lib/state";
import { posts, profile, social } from "@/lib/site-data";
import project from "../../config/project.json";

export function Workshop() {
  const { t } = useSiteState();
  return (
    <section className="section workshop" aria-labelledby="workshop-heading">
      <div className="workshop-lead">
        <p className="eyebrow" lang="en">BEHIND THE APPS</p>
        <h2 id="workshop-heading">{t.workshop_title}</h2>
        <p>{t.workshop_intro}</p>
        <span className="workshop-flower" aria-hidden="true">✳</span>
      </div>
      <ol className="workshop-notes">
        {t.workshop_items.map((item, index) => (
          <li key={index}>
            <span className="workshop-number" aria-hidden="true">0{index + 1}</span>
            <div><h3>{item.title}</h3><p>{item.text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Posts() {
  const { t } = useSiteState();
  if (posts.length === 0) return null;

  return (
    <section className="section" id="posts">
      <div className="section-head">
        <h2 className="section-title">{t.section_posts}</h2>
        <span className="section-count">{posts.length}</span>
      </div>
      <p className="section-intro">{t.posts_intro}</p>
      <ul className="post-list">
        {posts.map((post) => (
          <li className="post" lang="ja" key={post.date + post.title}>
            <time className="post-date" dateTime={post.date}>{post.date}</time>
            <div className="post-body">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-excerpt">{post.excerpt}</p>
            </div>
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
      <div className="contact-postcard">
        <div className="contact-stamp" aria-hidden="true"><span>FROM TOKYO</span><span>hello.</span><span>WITH CARE</span></div>
        <p className="eyebrow" lang="en">SAY HELLO</p>
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
        <p className="contact-note">{t.contact_note}</p>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useSiteState();

  return (
    <footer className="footer">
      {/* 既定で閉じている。開いて初めて人格が見える、フッターの奥付。 */}
      <details className="colophon">
        <summary>{t.colophon_label}</summary>
        <div className="colophon-body">
          <p>{t.colophon_p1}</p>
          <p>{t.colophon_p2}</p>
          <a
            className="colophon-source"
            href={`https://github.com/${project.repository}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.colophon_source}
          </a>
        </div>
      </details>
      <div className="footer-row">
        <span>{t.footer_copyright}</span>
        <span className="footer-links">
          <Link href="/privacy/">{t.privacy}</Link>
          <Link href="/terms/">{t.terms}</Link>
          <span>{profile.name}</span>
        </span>
      </div>
    </footer>
  );
}
