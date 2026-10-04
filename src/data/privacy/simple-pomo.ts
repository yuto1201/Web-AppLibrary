export const html = String.raw`
<h1>SimplePomo プライバシーポリシー / Privacy Policy</h1>
<p class="legal-meta">最終更新日 / Last updated: <time datetime="2026-10-04">2026-10-04</time></p>
<p class="legal-language">本ページは日本語と英語で提供しています。 <span lang="en">This page is available in Japanese and English.</span></p>
<nav class="legal-language-switch" aria-label="言語 / Language"><a href="#simplepomo-privacy-ja">日本語</a><span> · </span><a href="#simplepomo-privacy-en" lang="en">English</a></nav>

<section id="simplepomo-privacy-ja" lang="ja">
<h2>日本語</h2>
<p>SimplePomoは、uesugiyuutoが提供するiPhone・iPad向けポモドーロタイマーです。現在リリース準備中です。本ポリシーは、公開に向けて準備しているアプリの情報の取り扱いを説明します。</p>
<h3>1. 端末内に保存する情報</h3>
<p>タイマーの設定と状態、日ごとの集中回数・集中時間とその集計、Proの購入状態、投げ銭の購入回数、初回案内の完了状態をUserDefaultsとApp Groupの端末内領域に保存します。これらの情報は開発者へ送信せず、iCloud同期も行いません。アプリを削除すると端末内のアプリデータは削除されます。Appleが管理する購入履歴はアプリの削除では消えません。</p>
<h3>2. アカウント、広告、解析</h3>
<p>独自アカウントの作成は不要です。広告、トラッキング、解析SDK、クラッシュ収集SDKを使用せず、タイマーの記録や設定を開発者のサーバーへ送信しません。</p>
<h3>3. 通知と終了アラーム</h3>
<p>利用者が有効にした場合だけ、端末上でローカル通知を登録します。ProのAlarmKitによる終了アラームは、機能を有効にした場合だけ必要な許可を求めます。許可はiOSの設定から変更できます。</p>
<h3>4. システム連携とSiri</h3>
<p>Live Activity、Dynamic Island、ロック画面、StandBy、ウィジェット、コントロールセンターでは、端末内の共有領域にあるタイマー状態や統計を使用します。Siriショートカットによる開始・一時停止・スキップ・リセット・状態や今日の記録の確認も、端末内のタイマーを操作します。Siriの音声はAppleが処理し、開発者には送られません。Appleによる取り扱いは<a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Appleのプライバシーポリシー</a>をご確認ください。</p>
<h3>5. モーションセンサーと環境音</h3>
<p>アプリが表示されている間だけ、画面の陰影表現に端末の傾き情報を使用します。この情報は保存・送信しません。環境音はバックグラウンドで再生できますが、マイクは使用せず、録音もしません。</p>
<h3>6. アプリ内購入</h3>
<p>Proの買い切り購入と3段階の投げ銭はAppleのApp StoreとStoreKitを通じて処理します。開発者はクレジットカードなどの決済情報を受け取りません。購入状態の検証は端末上で行います。Appleによる情報の取り扱いにはAppleのプライバシーポリシーが適用されます。</p>
<h3>7. フィードバック機能の導入予定</h3>
<p>アプリ内の「フィードバックを送る」は現在未実装です。現時点でこの機能による送信は行いません。導入時には、利用者が送信した場合にだけ、種類（不具合・要望・その他）、本文、アプリとiOSのバージョン、端末の機種、言語・地域を送信する予定です。タイマーのログや設定値、連絡先や返信先は送信項目に含めません。本文に個人情報を書かないでください。</p>
<p>導入予定の受付処理はCloudflare Workersを経由し、開発者のGitHub非公開リポジトリにIssueとして保存します。IPアドレスは短時間の送信回数制限にだけ使用し、保存・ログ記録・Issueへの記載は行わず、受付処理の呼び出しログは無効にする予定です。全体の1日の受付上限も設けます。保存期間、削除依頼の手順、本文の上限などの確定した運用条件は、機能を公開する前に本ページへ追記します。この項目は導入予定の説明です。</p>
<h3>8. お問い合わせと変更</h3>
<p>現在のお問い合わせは<a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">開発者の連絡先</a>をご利用ください。タイマーの記録や個人情報など、不要な情報をお問い合わせに含めないでください。機能や情報の取り扱いを変更する場合は本ページを更新します。利用条件は<a href="/apps/simple-pomo/terms/">SimplePomo利用規約</a>をご確認ください。</p>
</section>

<section id="simplepomo-privacy-en" lang="en">
<h2>English</h2>
<p>SimplePomo is a Pomodoro timer for iPhone and iPad provided by uesugiyuuto. The App is being prepared for release. This policy explains the data practices of the App being prepared for publication.</p>
<h3>1. Information stored on your device</h3>
<p>Timer settings and state, daily focus counts and minutes and their aggregates, Pro purchase status, tip purchase counts and onboarding completion are stored locally in UserDefaults and the App Group storage. This information is not sent to the developer and does not sync through iCloud. Deleting the App removes its local app data. Deleting the App does not delete purchase records managed by Apple.</p>
<h3>2. Accounts, advertising and analytics</h3>
<p>No separate account is required. The App uses no advertising, tracking, analytics SDK or crash reporting SDK. Timer records and settings are not sent to the developer's server.</p>
<h3>3. Notifications and end alarms</h3>
<p>Local notifications are scheduled on your device only if you enable them. The Pro end alarm using AlarmKit requests permission only if you enable that feature. Permissions can be changed in iOS Settings.</p>
<h3>4. System integration and Siri</h3>
<p>Live Activity, Dynamic Island, the Lock Screen, StandBy, widgets and Control Center use timer state and statistics in local shared storage. Siri shortcuts for starting, pausing, skipping, resetting and checking the timer or today's records operate on your local timer. Siri voice input is processed by Apple and is not sent to the developer. See <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple's Privacy Policy</a> for Apple's processing.</p>
<h3>5. Motion sensors and ambient sounds</h3>
<p>While the App is visible, device tilt is used for visual shading. This information is neither stored nor sent. Ambient sounds can play in the background. The App does not use the microphone or record audio.</p>
<h3>6. In-app purchases</h3>
<p>The one-time Pro purchase and three tip levels are processed through Apple's App Store and StoreKit. The developer does not receive payment details such as credit card information. Purchase status is verified on your device. Apple's Privacy Policy applies to Apple's processing.</p>
<h3>7. Planned feedback feature</h3>
<p>The in-app “Send Feedback” feature has not been implemented. No submission through this feature takes place at present. When introduced, it is planned to send only after you submit: a category (bug, request or other), your message, App and iOS versions, device model, and language and region. Timer logs, setting values, contacts and a reply address will not be included in the sent fields. Do not include personal information in your message.</p>
<p>The planned intake service will pass submissions through Cloudflare Workers and save them as Issues in the developer's private GitHub repository. The source IP address is planned to be used only for short-term rate limiting, without storage, logging or inclusion in an Issue; intake request logs will be disabled. A daily limit will apply to all submissions. Final operational terms, including retention, deletion requests and the message limit, will be added to this page before the feature is released. This section describes a planned feature.</p>
<h3>8. Contact and updates</h3>
<p>For questions at present, use the <a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">developer's contact links</a>. Do not include unnecessary timer records or personal information in messages. This page will be updated when features or data practices change. See the <a href="/apps/simple-pomo/terms/">SimplePomo Terms of Use</a> for conditions of use.</p>
</section>
`;
