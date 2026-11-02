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

    screenshots: [
      { file: "1.png", alt: "ホーム画面。今月の合計 ¥21,150 と日割り・年額、明日の支払い（Kindle Unlimited、Netflix）、有効なサブスクの一覧" },
      { file: "2.png", alt: "サブスクを追加する画面。名前から Apple TV+ などの候補を出し、金額、請求サイクル、カテゴリ、契約開始日、無料トライアル、通知を設定" },
      { file: "3.png", alt: "分析の画面。今月の合計をカテゴリ別に分けたドーナツグラフと、1 年分の月別推移の折れ線グラフ" },
      { file: "4.png", alt: "カレンダーの画面。2026 年 4 月の月表示で支払いのある日に印を付け、合計金額・請求予定・契約中の数と今後の支払いの一覧を表示" },
    ],

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
      "毎日のカフェインを手早く記録して、今日の量と、寝るころに体に残る量の目安を確かめられます。飲んだ一杯は 3D の景色になってたまり、コーヒーくんが睡眠への影響をひとことで伝えます。",
    features: [
      {
        icon: "⚡",
        title: "さっと記録",
        description: "コーヒー、エスプレッソ、緑茶、エナジードリンクなど 26 種類から選ぶだけで記録できます。記録ボタンの長押しでお気に入りがすぐ出て、量や時刻はあとから調整でき、自分のドリンクも登録できます。",
      },
      {
        icon: "🧊",
        title: "記録が 3D の景色に",
        description: "記録するたびにカップや缶、ペットボトルが画面の上から落ちて、底にたまります。週ごとに入れ替わるので、今週どれだけ飲んだかがひと目で分かります。容器は指でつかんで動かせます。",
      },
      {
        icon: "🧪",
        title: "からだに残る量を計算",
        description: "今、体にどれくらい残っているかの目安を計算します。Pro では、体に残る量の曲線（代謝シミュレーション）も見られます。",
      },
      {
        icon: "🌙",
        title: "睡眠への影響を確認",
        description: "寝る時刻に残っている量の目安と、最後の一杯の目安を示します。アプリのキャラクター「コーヒーくん」が、今日のようすをひとことで伝えます。",
      },
      {
        icon: "📅",
        title: "月のマス目で振り返り",
        description: "その月の毎日の量を、色の濃さのマス目で表示します。記録のない日は「飲まなかった日」として見え、要点は 4 つのカードにまとめます。",
      },
      {
        icon: "🏅",
        title: "続けるほど増えるごほうび",
        description: "記録を続けると 6 段の実績が上がり、コーヒーくんの表情のアイコンと絵、アプリ全体の着せ替え、3D の見た目がもらえます。",
      },
      {
        icon: "📱",
        title: "ウィジェット",
        description: "ホーム画面とロック画面で、今日の量と寝るころの残りの目安を確かめられます。",
      },
      {
        icon: "☁️",
        title: "CafLog Pro",
        description: "過去の記録（前の週の 3D と、前の月の振り返り）、代謝シミュレーション、すべての見た目、ヘルスケアへの記録と iCloud での同期、お気に入り 4 件、広告なし。月額と年額のプランがあります。無料版では振り返りとアカウントの画面の下部に広告を表示しますが、追跡の許可は求めず、個人に合わせた広告も表示しません。",
      },
    ],
    price: "無料",
    version: "2.0",

    screenshots: [
      { file: "1.webp", alt: "ホーム画面。今日のカフェイン 100mg と上限までの残り、週ごとの記録の数、飲んだ容器が積み重なった 3D の景色と「飲んだものを記録」のボタン" },
      { file: "2.webp", alt: "飲んだものを記録する画面。コーヒー・お茶・エナジードリンクの絞り込みと、お気に入り、カフェインの量つきの飲み物の一覧" },
      { file: "3.webp", alt: "睡眠への影響の画面。寝るころに残るカフェイン 15.1mg を閾値 50mg と比べるメーターと、最後の一杯の目安から就寝までの今日の見通し" },
      { file: "4.webp", alt: "振り返りの画面。2026 年 10 月のカレンダーを日ごとの量の濃さで塗り分け、上限超過と飲まなかった日の印、選んだ日の記録を表示" },
      { file: "5.webp", alt: "実績の画面。いまの実績「セルフケア上手」と次の実績までの点数、実績ごとに増えるアイコンの着せ替えやコーヒーくんの新しい絵" },
      { file: "6.webp", alt: "ピンクの色に着せ替えたホーム画面。今日のカフェインと週の記録、飲んだ容器の 3D の景色を表示" },
    ],

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

    screenshots: [
      { file: "1.png", alt: "ツールの一覧の画面。ER Diagram Generator、App Store Preview、Design Pocket などを、説明と版の札つきのカードで並べる" },
      { file: "2.png", alt: "ER Diagram のプロジェクトの一覧の画面。新規プロジェクトのボタンと、テーブルの数と日付つきのプロジェクトのカード" },
      { file: "3.png", alt: "Icon Gallery の画面。アイコンの検索欄と種類の絞り込み、名前つきのアイコンの一覧" },
    ],

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
    "status": "release",
    "releaseDate": "2026-09-24",
    "year": 2026,
    "icon": "icon.png",
    "iconGlyph": "￥",
    "color": "#F6F4F0",
    "accent": "#D8343A",
    "featured": false,
    "category": "ファイナンス",
    "description": "給料日を基準に、カード請求・家賃・公共料金などの支払いをひとまとめに。収入と登録済み支払いの見込み差額を、ホーム・カレンダー・推移グラフで確認できます。",
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
        "description": "端末内に保存します。バージョン1.2以降は、設定でiCloud同期をオンにした端末だけ、自分のiPhone・iPadで同期できます（初期値はオフ）。ファイルの書き出し・読み込みにも対応します。"
      }
    ],
    "price": "無料・広告非表示の買い切りあり",
    "version": "1.1",
    "screenshots": [
      { "file": "1.png", "alt": "ホーム画面。2026 年 9 月分のサイクルで、給料と登録済みの支払いの差額 ¥137,670 と、カード引き落とし・家賃・電気代の予定と状態" },
      { "file": "2.png", "alt": "統計の画面。サイクルのカレンダーに給料と支払いの日を示し、選んだ日の支払いと、月ごとの残額の推移のグラフを表示" },
      { "file": "3.png", "alt": "支払いの一覧の画面。2026 年 9 月分の予定の支払いを、日付、支払い方法、口座、繰り返し、確認待ちなどの状態とあわせて表示" },
      { "file": "4.png", "alt": "支払いを追加する画面。繰り返しの単位と間隔、毎月の支払日、回数、金額、口座引き落としか銀行振込か、引落元の口座を設定" },
      { "file": "5.png", "alt": "設定の画面。給料・サイクル、支払い、銀行口座・カード、通知、iCloud 同期、データの書き出し・読み込みと、サポートの項目" }
    ],
    "appStoreUrl": "https://apps.apple.com/jp/app/id6809831827",
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
      { icon: "✳", title: "ひと息つくのも、大切な時間。", description: "集中と休憩を、自分のペースで。買い切りのProでは、5つの環境音・4つのテーマ・インタラクティブウィジェット・AlarmKitの終了アラームと、より長い時間設定を利用できます。" },
    ],
    price: "無料・買い切りのProあり", version: "1.0（準備中）", screenshots: [],
    appStoreUrl: null, siteUrl: null,
  },
  {
    slug: "flower", name: "花島",
    tagline: "浮かぶ島で、花と空を眺める。", stickerNote: "今日のそら、なにいろ？",
    platforms: ["iOS", "iPadOS"], status: "alpha", releaseDate: null, year: 2026,
    icon: "icon.png", iconGlyph: "✿", color: "#E6F0FB", accent: "#B0123A", featured: false,
    category: "ライフスタイル",
    description: "浮かぶ島に咲く花と時計を、空の時刻や天気とともに眺めるアプリ。アカウントも広告もなく、iPhoneとiPadで静かに花を眺める時間を届けます。現在リリース準備中です。",
    features: [
      { icon: "✿", title: "島に咲く、一輪の花", description: "浮かぶ島に咲く3Dの花が、風にそっと揺れます。指で回したり近づいたりして、好きな角度から眺められます。" },
      { icon: "◐", title: "時刻と天気で変わる空", description: "空は時刻に合わせて朝・昼・夜へ移り変わります。設定をオンにすると、おおよその現在地で太陽と月を置き、Apple WeatherKitで現在地の天気に合わせます。" },
      { icon: "◷", title: "好みの時計", description: "12時間・24時間表示や日付の有無、7種類の書体から、花のそばに置く時計を選べます。" },
      { icon: "✦", title: "花を加える", description: "椿・バラ・ダリアははじめから。アネモネ・ハイビスカス・彼岸花は、買い切りのアプリ内課金で島に加えられます。" },
    ],
    price: "無料・一部の花は買い切りのアプリ内課金", version: "1.0（準備中）", screenshots: [],
    appStoreUrl: null, siteUrl: null,
  },
] satisfies unknown[];

/** ビルド時に検証する。スキーマ違反があれば build が失敗する。 */
export const apps: App[] = registrySchema.parse(entries);

export function getApp(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}
