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
    date: "2026-09-29",
    title: "さわって、並べて、見つけて。",
    excerpt: "ホームを、カラフルなアプリの遊び場に。気になるアイコンを動かしたり、実際の画面をのぞいたり。自分のペースで探してみてください。",
  },
  {
    date: "2026-09-29",
    title: "アプリを眺める、小さな工房に",
    excerpt: "気になるアイコンから、実際の画面をひとつずつ。紙とシールの机に、アプリの小さな展示を加えました。",
  },
  {
    date: "2026-09-26",
    title: "使う前に、画面をのぞけるように",
    excerpt: "アプリの詳細ページにスクリーンショットのギャラリーを追加。機能と一緒に、使い心地も想像できるように。",
  },
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
  showcase_intro: string;
  spotlight_title: string;
  spotlight_choose: string;
  spotlight_screen: string;
  spotlight_icon: string;
  spotlight_open: string;
  spotlight_static: string;
  studio_intro: string;
  studio_apps: string;
  studio_made: string;
  apps_intro: string;
  workshop_title: string;
  workshop_intro: string;
  workshop_items: { title: string; text: string }[];
  posts_intro: string;
  contact_note: string;
  desk_hint: string;
  stickers_title: string;
  stickers_hint: string;
  stickers_reset: string;
  section_apps: string;
  section_posts: string;
  contact_h: string;
  contact_p: string;
  footer_copyright: string;
  colophon_label: string;
  colophon_p1: string;
  colophon_p2: string;
  colophon_source: string;
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
    hero_h1_a: "小さなアプリで、",
    hero_h1_b: "毎日を面白く。",
    hero_note: "東京で、Swift と SwiftUI でつくっています。",
    hero_cta: "アプリを見る",
    showcase_intro: "気になるアイコンを選んで、使う前にひとのぞき。あなたの毎日に合う、ひとつを。",
    spotlight_title: "画面から、見つけよう。",
    spotlight_choose: "選んでみて",
    spotlight_screen: "アプリの画面",
    spotlight_icon: "アプリアイコン",
    spotlight_open: "詳しく見る",
    spotlight_static: "実際のアプリのスクリーンショットです。アプリ自体はこのページでは操作できません。",
    studio_intro: "東京の、小さな個人開発室",
    studio_apps: "{count}つの小さな道具",
    studio_made: "つくる。使う。また直す。",
    apps_intro: "暮らしのことも、つくることも。気になるひとつをどうぞ。",
    workshop_title: "小さく作って、\n少しずつ育てる。",
    workshop_intro: "この机から、生まれるもの。",
    workshop_items: [
      { title: "日々の「ちょっと」から。", text: "毎月の支払い、コーヒー、開発のひと手間。身近なことを、ひとつの道具に。" },
      { title: "使い心地まで、こつこつと。", text: "必要な機能を、迷わず使える形へ。小さな画面の手触りも大切にしています。" },
      { title: "途中も、ここに。", text: "リリースしたものも、まだ開発中のものも。できあがっていく過程ごと並べています。" },
    ],
    posts_intro: "机の端に残しておく、ちょっとした変化の記録。",
    contact_note: "感想ひとつから、次のアイデアが生まれることも。",
    desk_hint: "ちょっとべんり。ちょっとたのしい。",
    stickers_title: "Stickers",
    stickers_hint: "動かして遊ぶ。タップでのぞく。",
    stickers_reset: "ならべ直す",
    section_apps: "App Library",
    section_posts: "Notes",
    contact_h: "お仕事・感想・雑談まで。",
    contact_p: "使ってみた感想も、こんなの欲しい、も。X や GitHub からお気軽に。",
    footer_copyright: "© 2026 · 東京から、愛を込めて",
    colophon_label: "奥付",
    colophon_p1: "東京在住のひとりの開発者が、趣味と実益を兼ねて作って運用しています。",
    colophon_p2: "解析もトラッキングも入れていません。Next.js の静的出力だけで動いていて、サーバーもデータベースもありません。",
    colophon_source: "ソースコードは GitHub にあります",
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
    hero_h1_b: "brighter days.",
    hero_note: "Made in Tokyo with Swift and SwiftUI.",
    hero_cta: "Browse apps",
    showcase_intro: "Pick an icon. Take a closer look. Find a little tool that feels right for your everyday.",
    spotlight_title: "A closer look.",
    spotlight_choose: "Pick an app",
    spotlight_screen: "app screenshot",
    spotlight_icon: "app icon",
    spotlight_open: "Explore",
    spotlight_static: "An actual app screenshot. The app itself is not interactive on this page.",
    studio_intro: "A small independent studio in Tokyo",
    studio_apps: "{count} little tools",
    studio_made: "Make. Use. Make it better.",
    apps_intro: "For everyday life, and for making things. Find a little tool for you.",
    workshop_title: "Start small.\nKeep making it better.",
    workshop_intro: "Things that begin at this desk.",
    workshop_items: [
      { title: "An everyday starting point.", text: "Monthly bills, a cup of coffee, a step in a workflow. Familiar things, made into little tools." },
      { title: "Care in the small details.", text: "Useful features, easy to find. A little extra thought for how every screen feels to use." },
      { title: "Room for work in progress.", text: "Released apps sit alongside works in progress. This is a place to see them take shape." },
    ],
    posts_intro: "Small changes, noted down at the edge of the desk.",
    contact_note: "A little feedback can be the start of the next idea.",
    desk_hint: "A little useful. A little playful.",
    stickers_title: "Stickers",
    stickers_hint: "Drag to play. Tap to explore.",
    stickers_reset: "Tidy up",
    section_apps: "App Library",
    section_posts: "Notes",
    contact_h: "Work, feedback, or just hi.",
    contact_p: "Tried an app, or have an idea? Drop me a line on X or GitHub.",
    footer_copyright: "© 2026 · Made in Tokyo, with care",
    colophon_label: "Colophon",
    colophon_p1: "Built and run by one developer in Tokyo, as a side project.",
    colophon_p2: "No analytics, no tracking. Just a static Next.js export — no server, no database.",
    colophon_source: "Source code is on GitHub",
    privacy: "Privacy",
    terms: "Terms",
    status_alpha: "In Development",
    status_beta: "In Beta",
    status_release: "Released",
    status_archived: "Archived",
  },
};
