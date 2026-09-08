/**
 * サイト全体のデータ。プロフィール / お知らせ / SNS / UI 文言。
 * アプリのメタデータは src/data/registry.ts が持つ。ここは「サイトの顔」用。
 * i18n は UI ラベルの切替のみで、アプリ説明文は registry 側の日本語を使う。
 */
export const LANGS = ["ja", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const profile = {
  name: "uesugiyuuto",
  // iOS 限定から全プラットフォームへ広げたため "iOS App Maker" を改めた。
  tagline: "App Maker",
  bio: "つくったアプリたち。日々を少しだけ丁寧にする、小さな道具を作っています。",
  location: "東京, 日本",
} as const;

export type Post = { date: string; title: string; excerpt: string };

export const posts: Post[] = [
  {
    date: "2026-09-08",
    title: "トップページを紙とステッカーに",
    excerpt: "検索とフィルタをやめ、アプリを行の索引に。アイコンは掴んで動かせるステッカーにしました。",
  },
  {
    date: "2026-04-19",
    title: "AppLibrary を新デザインに刷新",
    excerpt: "liquid-glass デザインの新しいトップページに切り替えました。",
  },
];

export type Social = { label: string; handle: string; url: string };

/** url が空 / "#" のエントリは未公開とみなして描画しない。 */
export const social: Social[] = [
  { label: "X", handle: "@Yuto_Program", url: "https://x.com/Yuto_Program" },
  { label: "GitHub", handle: "yuto1201", url: "https://github.com/yuto1201" },
];

type Dict = {
  nav: { apps: string; posts: string; contact: string };
  a11y_primary_nav: string;
  a11y_language: string;
  a11y_switch_language: string;
  a11y_theme: string;
  a11y_switch_light: string;
  a11y_switch_dark: string;
  hero_h1_a: string;
  hero_h1_b: string;
  hero_note: string;
  hero_cta: string;
  stickers_title: string;
  stickers_hint: string;
  stickers_reset: string;
  section_apps: string;
  section_posts: string;
  contact_h: string;
  contact_p: string;
  footer_copyright: string;
  privacy: string;
  terms: string;
  status_alpha: string;
  status_beta: string;
  status_release: string;
  status_archived: string;
};

export const i18n: Record<Lang, Dict> = {
  ja: {
    nav: { apps: "アプリ", posts: "お知らせ", contact: "お問い合わせ" },
    a11y_primary_nav: "メインナビゲーション",
    a11y_language: "言語",
    a11y_switch_language: "英語に切り替える",
    a11y_theme: "テーマ",
    a11y_switch_light: "ライトモードに切り替える",
    a11y_switch_dark: "ダークモードに切り替える",
    hero_h1_a: "小さなアプリを、",
    hero_h1_b: "丁寧に。",
    hero_note: "東京で、Swift と SwiftUI でつくっています。",
    hero_cta: "アプリを見る",
    stickers_title: "Stickers",
    stickers_hint: "つまんで動かせます。",
    stickers_reset: "ならべ直す",
    section_apps: "App Library",
    section_posts: "Notes",
    contact_h: "お仕事・感想・雑談まで。",
    contact_p: "お気軽にご連絡ください。SNS・メール、どちらでも。",
    footer_copyright: "© 2026 · 東京から、愛を込めて",
    privacy: "プライバシー",
    terms: "利用規約",
    status_alpha: "α 開発中",
    status_beta: "β テスト中",
    status_release: "リリース済み",
    status_archived: "公開終了",
  },
  en: {
    nav: { apps: "Apps", posts: "Notes", contact: "Contact" },
    a11y_primary_nav: "Primary navigation",
    a11y_language: "Language",
    a11y_switch_language: "Switch to Japanese",
    a11y_theme: "Theme",
    a11y_switch_light: "Switch to light mode",
    a11y_switch_dark: "Switch to dark mode",
    hero_h1_a: "Small apps,",
    hero_h1_b: "made with care.",
    hero_note: "Made in Tokyo with Swift and SwiftUI.",
    hero_cta: "Browse apps",
    stickers_title: "Stickers",
    stickers_hint: "Grab them and move them around.",
    stickers_reset: "Tidy up",
    section_apps: "App Library",
    section_posts: "Notes",
    contact_h: "Work, feedback, or just hi.",
    contact_p: "Always happy to hear from you — email or social, either works.",
    footer_copyright: "© 2026 · Made in Tokyo, with care",
    privacy: "Privacy",
    terms: "Terms",
    status_alpha: "In Development",
    status_beta: "In Beta",
    status_release: "Released",
    status_archived: "Archived",
  },
};
