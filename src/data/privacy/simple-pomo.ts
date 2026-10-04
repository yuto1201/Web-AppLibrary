export const html = String.raw`
<h1>SimplePomo プライバシーポリシー / Privacy Policy</h1>
<p class="legal-meta">最終更新日 / Last updated: <time datetime="2026-10-04">2026-10-04</time></p>
<p class="legal-language">本ページは日本語と英語で提供しています。 <span lang="en">This page is available in Japanese and English.</span></p>
<nav class="legal-language-switch" aria-label="言語 / Language"><a href="#simplepomo-privacy-ja">日本語</a><span> · </span><a href="#simplepomo-privacy-en" lang="en">English</a></nav>

<section lang="ja">
<h2 id="simplepomo-privacy-ja">日本語</h2>
<p>SimplePomoは、uesugiyuutoが提供するiPhone・iPad向けのポモドーロタイマーアプリです。本ポリシーでは、SimplePomoが扱う情報について説明します。</p>

<h3>アカウントと外部への送信</h3>
<p>SimplePomoにアカウント登録はありません。広告、トラッキング、外部の分析SDK、クラッシュ収集SDKは使用しません。下記の「フィードバック」を除き、開発者のサーバーへデータを送信しません。iCloudによる同期も行いません。</p>

<h3>端末内に保存する情報</h3>
<p>次の情報を、端末内のUserDefaultsと、ウィジェット・ライブアクティビティ・コントロールセンターと共有するApp Groupの領域に保存します。</p>
<ul>
  <li>タイマーの設定（集中・休憩の長さ、プリセット、テーマ、音、触覚フィードバック）</li>
  <li>タイマーの進行状態</li>
  <li>日ごとの集中回数と集中時間、統計の集計値</li>
  <li>Proの購入状態とチップの購入回数</li>
  <li>初回の案内を終えたかどうか</li>
</ul>
<p>これらの情報は開発者に送信されません。アプリを削除すると、端末から削除されます。</p>

<h3>通知・アラームとiOSの表示</h3>
<p>集中・休憩の終わりを、端末内で登録するローカル通知でお知らせします。通知を許可するかどうかは利用者が選べ、iOSの設定から変更できます。</p>
<p>AlarmKitによる全画面アラーム（Pro）は、利用者がアプリの設定で有効にしたときに、iOSの許可を求めます。</p>
<p>ライブアクティビティ、Dynamic Island、ウィジェット、コントロールセンター、StandByは、端末内の共有データからタイマーの状態と統計を表示します。</p>
<p>Siriとショートカットは、タイマーの開始・一時停止・スキップ・リセットと、状態・今日の統計の確認を端末内で実行します。音声はAppleが処理し、開発者は受け取りません。</p>

<h3>モーションセンサーと音声の再生</h3>
<p>画面の陰影を表現するため、アプリを表示している間だけ、端末の傾き（モーションセンサー）を読み取ります。傾きの情報は保存も送信もしません。</p>
<p>環境音を鳴らし続けるために、バックグラウンドでの音声再生を使用します。マイクは使用しません。</p>

<h3>アプリ内課金</h3>
<p>Proとチップの購入は、AppleのApp Storeが処理します。開発者は支払い情報を受け取りません。購入状態はAppleのStoreKitで確認し、端末内に保存します。Appleによる情報の取り扱いには<a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Appleのプライバシーポリシー</a>が適用されます。</p>

<h3>フィードバック</h3>
<p>設定の「フィードバックを送る」から利用者が送信したときだけ、種類（不具合・要望・その他）、入力した本文、アプリとiOSのバージョン、端末の機種、言語と地域の設定を送ります。自動では送信しません。タイマーの記録と設定の値は送信しません。本文には個人情報を書かないでください。</p>
<p>送信内容は、開発者がCloudflare, Inc.（米国）のCloudflare Workersで運用する受付処理を経由し、GitHub, Inc.（米国）が提供する開発者の非公開リポジトリにIssueとして保存します。両社の<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflareプライバシーポリシー</a>と<a href="https://docs.github.com/ja/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHubプライバシーステートメント</a>をご確認ください。</p>
<p>送信元のIPアドレスは、送信回数の制限（同じ送信元からはおおむね60秒に1件まで）にだけ使い、保存せず、ログにもIssueにも残しません。受付処理の呼び出しログは無効にしています。受付件数には、全体で1日100件の上限があります。</p>
<p>連絡先を受け取らないため、フィードバックには返信しません。</p>

<h3>お問い合わせと変更</h3>
<p>不具合や要望は、アプリの設定にある「フィードバックを送る」から送れます（返信はしません）。そのほかのご質問は、<a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">開発者の連絡先</a>からお寄せください。機能や情報の取り扱いが変わる場合は本ページを更新します。利用条件は<a href="/apps/simple-pomo/terms/">SimplePomo利用規約</a>をご確認ください。</p>
</section>

<section lang="en">
<h2 id="simplepomo-privacy-en">English</h2>
<p>SimplePomo is a Pomodoro timer app for iPhone and iPad provided by uesugiyuuto. This policy explains the information SimplePomo handles.</p>

<h3>Accounts and data sent off the device</h3>
<p>SimplePomo has no account registration. It uses no advertising, no tracking, no third-party analytics SDK and no crash-reporting SDK. Except for Feedback described below, it does not send data to the developer’s server. It does not sync through iCloud.</p>

<h3>Information stored on your device</h3>
<p>The App stores the following information on your device, in UserDefaults and in an App Group container shared with its widgets, Live Activities and Control Center controls.</p>
<ul>
  <li>Timer settings (focus and break lengths, presets, theme, sound and haptic feedback)</li>
  <li>The timer’s current progress</li>
  <li>Daily focus session counts and focus time, and aggregated statistics</li>
  <li>Pro purchase status and the number of tips purchased</li>
  <li>Whether you have finished the first-run introduction</li>
</ul>
<p>This information is not sent to the developer. It is removed from your device when you delete the App.</p>

<h3>Notifications, alarms and iOS surfaces</h3>
<p>The App tells you when a focus or break session ends with local notifications scheduled on your device. You choose whether to allow notifications and can change this in iOS Settings.</p>
<p>Full-screen AlarmKit alarms (Pro) request iOS permission when you turn them on in the App’s Settings.</p>
<p>Live Activities, the Dynamic Island, widgets, Control Center and StandBy display the timer’s status and statistics from data shared on your device.</p>
<p>Siri and Shortcuts start, pause, skip and reset the timer and check its status and today’s statistics on your device. Apple processes your voice; the developer does not receive it.</p>

<h3>Motion sensor and audio playback</h3>
<p>To render shading on the screen, the App reads your device’s tilt (motion sensor) only while the App is on screen. Tilt data is neither stored nor sent.</p>
<p>The App uses background audio playback to keep ambient sounds playing. It does not use the microphone.</p>

<h3>In-app purchases</h3>
<p>Apple’s App Store processes purchases of Pro and tips. The developer does not receive payment information. The App checks purchase status with Apple StoreKit and stores it on your device. Apple’s processing is covered by <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple’s Privacy Policy</a>.</p>

<h3>Feedback</h3>
<p>The App sends feedback only when you submit it from the feedback option in Settings. It sends the category (bug, request or other), your message, the App and iOS versions, your device model, and your language and region settings. It does not send feedback automatically. Your timer records and setting values are not sent. Please do not put personal information in your message.</p>
<p>Feedback passes through an intake service operated by the developer on Cloudflare Workers from Cloudflare, Inc. (United States) and is saved as an Issue in the developer’s private repository hosted by GitHub, Inc. (United States). See the <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a> and <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a>.</p>
<p>The source IP address is used only to limit submissions (roughly one per 60 seconds from the same source). It is not stored and is not kept in logs or in the Issue. Request logs for the intake service are disabled. A limit of 100 submissions per day applies across all users.</p>
<p>Because no contact details are received, we do not reply to feedback.</p>

<h3>Contact and updates</h3>
<p>You can send bug reports and requests from the feedback option in the App’s Settings; we do not reply to feedback. For other questions, please use the <a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">developer&#x27;s contact links</a>. This policy will be updated when the App’s features or data practices change. See the <a href="/apps/simple-pomo/terms/">SimplePomo Terms of Use</a> for conditions of use.</p>
</section>
`;
