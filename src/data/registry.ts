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
] satisfies unknown[];

/** ビルド時に検証する。スキーマ違反があれば build が失敗する。 */
export const apps: App[] = registrySchema.parse(entries);

export function getApp(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}
