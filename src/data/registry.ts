import { registrySchema, type App } from "./schema";

/**
 * 掲載アプリの唯一の真実。
 * 新しいアプリを追加するときは、この配列と同じ slug の画像・privacy 本文も登録する。
 * 一覧カードと詳細ページはここから生成され、privacy coverage はテストで照合される。
 */
const entries = [
  {
    slug: "sublog",
    name: "SubLog",
    tagline: "毎月のサブスクを、ひと目で。",
    stickerNote: "月の固定費、見えてる？",

    platforms: ["iOS"],
    status: "release",
    releaseDate: "2026-04-14",
    year: 2026,

    icon: "icon.png",
    iconGlyph: "￥",
    color: "#E8E1F2",
    accent: "#6B5B8E",
    featured: false,

    category: "ファイナンス",
    description:
      "サブスクリプションの管理を、ひとつの画面で。月々の支払いを可視化し、無駄な支出を見つけられます。シンプルな UI と、必要十分なウィジェットで日々の確認を後押しします。",
    features: [
      {
        icon: "✍️",
        title: "かんたん登録",
        description: "85 以上のサービス候補から入力し、日本語・英語の検索ですばやく登録できます。",
      },
      {
        icon: "💱",
        title: "支出をひと目で把握",
        description: "月額・年額・日額と複数通貨をまとめ、実際の支出をわかりやすく表示します。",
      },
      {
        icon: "🔔",
        title: "請求前にお知らせ",
        description: "請求日や無料トライアルの終了前に、設定したタイミングでローカル通知します。",
      },
      {
        icon: "📅",
        title: "カレンダー表示",
        description: "今月の請求予定を一覧し、必要に応じて iOS カレンダーへ連携できます。",
      },
      {
        icon: "📊",
        title: "分析とヘルスチェック",
        description: "カテゴリ内訳・推移・ランキングなどから、見直したい契約を見つけられます。",
      },
      {
        icon: "🔒",
        title: "安全とウィジェット",
        description: "Face ID / Touch ID で保護し、ホーム・ロック画面のウィジェットから確認できます。",
      },
    ],
    price: "無料",
    version: "1.0",

    screenshots: ["1.png", "2.png", "3.png", "4.png"],

    appStoreUrl: "https://apps.apple.com/us/app/sublog/id6761677813",
    siteUrl: null,
  },
  {
    slug: "caflog",
    name: "CafLog",
    tagline: "カフェインとの付き合いを、見える化。",
    stickerNote: "今日、何杯目？",

    platforms: ["iOS"],
    status: "release",
    releaseDate: "2026-04-10",
    year: 2026,

    icon: "icon.png",
    iconGlyph: "☕",
    color: "#F5EBDD",
    accent: "#8B5E3C",
    featured: false,

    category: "ヘルスケア",
    description:
      "いつ・どれくらいのカフェインを摂ったかを記録し、1 日の合計と就寝時の体内残量を可視化します。睡眠の質を意識した飲み方をサポート。",
    features: [
      {
        icon: "⚡",
        title: "10 秒で記録",
        description: "18 種類のプリセットとカスタムドリンクから、摂取内容をすばやく記録できます。",
      },
      {
        icon: "🧪",
        title: "体内残量をリアルタイム計算",
        description: "半減期モデルでカフェインの吸収と代謝を計算し、現在の推定量を表示します。",
      },
      {
        icon: "🌙",
        title: "睡眠への影響を確認",
        description: "就寝予定時刻の推定残量から、安全・注意・危険の目安を確認できます。",
      },
      {
        icon: "📊",
        title: "13 種類の分析",
        description: "代謝グラフ、時間帯別傾向、ドリンクランキングなどから習慣を振り返れます。",
      },
      {
        icon: "🏅",
        title: "21 種類の称号",
        description: "記録を続けて称号とテーマを解放し、無理なく習慣化を続けられます。",
      },
      {
        icon: "☁️",
        title: "Pro 連携機能",
        description: "HealthKit、iCloud 同期、ホーム・ロック画面ウィジェットを利用できます。",
      },
    ],
    price: "無料",
    version: "1.0",

    screenshots: ["1.png", "2.png", "3.png", "4.png", "5.png"],

    appStoreUrl: "https://apps.apple.com/us/app/caflog/id6760961086",
    siteUrl: null,
  },
  {
    slug: "dev-tools",
    name: "Dev-Tools",
    tagline: "開発に使う小さな道具を、ひとつに。",
    stickerNote: "ブラウザで足りる",

    platforms: ["Web"],
    status: "beta",
    releaseDate: "2026-03-30",
    year: 2026,

    icon: "icon.png",
    iconGlyph: "🧰",
    color: "#E8EEF2",
    accent: "#357D9A",
    featured: false,

    category: "開発ツール",
    description:
      "ER 図、App Store スクリーンショット、デザインメモ、文字数、アイコンをブラウザで扱える開発者向けツール集です。インストールせず、必要な道具をすぐに開けます。",
    features: [
      {
        icon: "🗂️",
        title: "ER Diagram",
        description: "テーブル、カラム、リレーションを視覚的に整理し、データベース構造を設計できます。",
      },
      {
        icon: "📱",
        title: "App Store Preview",
        description: "App Store 向けスクリーンショットのレイアウトと書き出しをブラウザで進められます。",
      },
      {
        icon: "🎨",
        title: "Design Pocket",
        description: "アプリの配色、画面案、デザインメモをプロジェクト単位でまとめられます。",
      },
      {
        icon: "🔢",
        title: "Text Counter",
        description: "入力した文章の文字数、単語数、行数をリアルタイムに確認できます。",
      },
      {
        icon: "🧩",
        title: "Icon Gallery",
        description: "321 個のアイコンを検索し、用途や見た目を比較しながら選べます。",
      },
      {
        icon: "☁️",
        title: "端末内保存と任意の同期",
        description: "データをブラウザ内に保存し、対応ツールでは任意で Google Drive のアプリ専用領域へ同期できます。",
      },
    ],
    price: "無料",
    version: "0.8",

    screenshots: ["1.png", "2.png", "3.png"],

    appStoreUrl: null,
    siteUrl: "https://yuto1201.github.io/Dev-Tools/",
  },
  {
    "slug": "pay-cycle",
    "name": "PayCycle",
    "tagline": "給料日から、次の支払いまでを見通す。",
    "stickerNote": "次の給料日まで",
    "platforms": [
      "iOS",
      "iPadOS"
    ],
    "status": "alpha",
    "releaseDate": null,
    "year": 2026,
    "icon": "icon.png",
    "iconGlyph": "￥",
    "color": "#F6F4F0",
    "accent": "#D8343A",
    "featured": false,
    "category": "ファイナンス",
    "description": "給料日を基準に、カード請求・家賃・公共料金などの支払いをひとまとめに。収入と登録済み支払いの見込み差額を、ホーム・カレンダー・推移グラフで確認できます。新しいデザインの1.1をリリース準備中です。",
    "features": [
      {
        "icon": "📆",
        "title": "給料日からの見通し",
        "description": "給料日サイクルごとに収入・支払い・見込み差額を整理します。"
      },
      {
        "icon": "🗓️",
        "title": "カレンダーと差額の推移",
        "description": "統計画面で給料・臨時収入・支払いの予定と、サイクルごとの見込み差額を確認できます。"
      },
      {
        "icon": "🔁",
        "title": "繰り返しも、終わりまで",
        "description": "月・週単位の繰り返しと一回の支払いに対応。ローンや分割払いは最終回の日付も設定できます。"
      },
      {
        "icon": "💰",
        "title": "臨時収入もサイクルへ",
        "description": "賞与などの臨時収入を記録し、そのサイクルの収入と支払いの見通しに反映できます。"
      },
      {
        "icon": "🔔",
        "title": "支払いと確認をお知らせ",
        "description": "支払い予定日と、支払い済みか確認が必要な予定を、設定した時刻に通知します。"
      },
      {
        "icon": "☁️",
        "title": "iCloud同期とデータ移行",
        "description": "端末内に保存し、iCloudにサインインしていれば自分のiPhone・iPadで同期。ファイルの書き出し・読み込みにも対応します。"
      }
    ],
    "price": "無料・広告非表示の買い切りを予定",
    "version": "1.1（準備中）",
    "screenshots": [
      "1.png",
      "2.png",
      "3.png",
      "4.png",
      "5.png"
    ],
    "appStoreUrl": null,
    "siteUrl": null
  },
  {
    slug: "simple-pomo", name: "SimplePomo",
    tagline: "目の前のことに、ただ集中する。", stickerNote: "ひとつずつ、25",
    platforms: ["iOS", "iPadOS"], status: "alpha", releaseDate: null, year: 2026,
    icon: "icon.png", iconGlyph: "◷", color: "#FFF0E1", accent: "#FD841B", featured: false,
    category: "仕事効率化",
    description: "集中と休憩を、自分のリズムで。Dynamic Islandやロック画面で残り時間を確認できる、iPhoneとiPadのためのポモドーロタイマー。現在リリース準備中です。",
    features: [
      { icon: "◷", title: "ひとつのことに、集中。", description: "時間を区切って、目の前のひとつから。7つのSiriショートカットとコントロールセンターの操作は無料で使えます。" },
      { icon: "↗", title: "ちらっと見れば、それで。", description: "Dynamic Island、Live Activity、ロック画面、StandByで残り時間を確認。今日の記録・連続日数・直近7日間の統計も振り返れます。" },
      { icon: "✳", title: "ひと息つくのも、大切な時間。", description: "集中と休憩を、自分のペースで。買い切りのProでは、5つの環境音・4つのテーマ・ウィジェット・AlarmKitの終了アラームと、より長い時間設定を利用できます。" },
    ],
    price: "無料・買い切りのProあり", version: "1.0（準備中）", screenshots: [],
    appStoreUrl: null, siteUrl: null,
  },
] satisfies unknown[];

/** ビルド時に検証する。スキーマ違反があれば build が失敗する。 */
export const apps: App[] = registrySchema.parse(entries);

export function getApp(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}
