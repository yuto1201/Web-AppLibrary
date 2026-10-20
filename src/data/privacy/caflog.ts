/**
 * CafLog 2.0 のプライバシーポリシー。
 * iOS-CafLog の specs/product.md 2.25・app-decisions.md（A-075 まで）・app-privacy.md・decisions.md の D-076、
 * Google Mobile Ads SDK の公式文書（データの開示、プライバシーの戦略、Publisher Privacy Treatment）に合わせた本文。
 */
export const html = String.raw`
<h1>CafLog プライバシーポリシー / Privacy Policy</h1>
<p class="legal-meta">最終更新日 / Last updated: <time datetime="2026-10-20">2026-10-20</time></p>
<p class="legal-language">本ページは日本語と英語で提供しています。 <span lang="en">This page is available in Japanese and English.</span></p>
<nav class="legal-language-switch" aria-label="言語 / Language"><a href="#caflog-privacy-ja">日本語</a><span> · </span><a href="#caflog-privacy-en" lang="en">English</a></nav>

<section id="caflog-privacy-ja" lang="ja">
<h2>日本語</h2>
<p>CafLog（以下「本アプリ」）は、uesugiyuutoが提供するカフェイン摂取の記録アプリです。本ポリシーは、本アプリのバージョン2.0以降が取り扱う情報と、その使い方を説明します。本アプリには独自のアカウントがなく、氏名、メールアドレス、電話番号を入力していただくことはありません。</p>

<h3>端末内に保存する情報</h3>
<p>次の情報を、端末内のSwiftDataデータベースと設定の領域に保存します。保存先はアプリとウィジェットが共有する端末内の領域（App Group）です。</p>
<ul>
  <li>摂取記録: 日時、ドリンク名、カフェイン量（mg）、容量（ml）、カテゴリ、容器の形と見た目、ヘルスケアとの連携の状態とヘルスケアのサンプルの識別子</li>
  <li>ドリンク（プリセットとカスタム）、お気に入り、削除したプリセットの記録</li>
  <li>以前のバージョンで作成した、飲まない日の宣言とカレンダーのメモ（画面には表示しませんが、データは残します）</li>
  <li>設定: 1日の上限、半減期、吸収時間、睡眠の閾値、就寝・起床の時刻、毎日のリマインダー、ヘルスケアとiCloud同期のオン・オフ</li>
  <li>実績とごほうびの状態、Appleから確認したCafLog Proの購入の状態</li>
</ul>
<p>体内に残るカフェインの推定、睡眠への影響、振り返り、ウィジェットの表示は、これらの情報から端末上で計算します。データを開けない不具合が起きた場合は、元のデータを失わないよう、端末内のアプリの領域に写しを残します。</p>

<h3>iCloud同期</h3>
<p>CafLog Proの利用中に、アカウントの「iCloud同期」をオンにした場合だけ、摂取記録、ドリンク（削除したプリセットの記録を含みます）、飲まない日、メモを、AppleのCloudKitを使って利用者自身のiCloudのプライベートデータベースと同期します。設定は同期しません。開発者はプライベートデータベースの内容にアクセスできません。iCloud同期をオフにしたり、Proが終了したりしても、端末内のデータとすでにiCloudにあるデータは削除されません。Appleによる処理には<a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Appleのプライバシーポリシー</a>が適用されます。</p>

<h3>ヘルスケア（HealthKit）</h3>
<p>CafLog Proの利用中に、アカウントの「ヘルスケア」をオンにして許可した場合だけ、記録したカフェインの量と日時を、ヘルスケアの「カフェイン」のデータとして書き込みます。記録を編集・削除したときは、本アプリが書き込んだデータを探して書き直し・削除するために、同じ種類のデータの読み取りの許可も求めます。ほかのアプリが書き込んだカフェインのデータを表示や分析に使うことはありません。ヘルスケアのデータは、広告、マーケティング、データブローカーへの提供には使わず、開発者のサーバーや広告SDKへ送りません。許可はiOSの「設定」またはヘルスケアAppから変更できます。</p>

<h3>購入とオファーコード</h3>
<p>CafLog Proの月額と年額の自動更新サブスクリプション、購入の復元、オファーコードの引き換えには、AppleのStoreKitを使います。決済はAppleが処理し、本アプリと開発者は決済情報やクレジットカード情報を受け取りません。Appleから取得して検証した購入の状態だけを使ってProの機能と広告の表示を判定し、確認の結果を端末内のアプリとウィジェットの領域に保存します。</p>

<h3>広告</h3>
<p>無料プランでは、Google LLCのGoogle Mobile Ads SDK（Google AdMob）を使い、振り返りとアカウントの画面の下部（タブバーのすぐ上）にバナー広告を表示します。ホーム、記録の画面、Proの案内などには表示しません。CafLog Proの利用中と、購入の状態を確認している間は、広告を読み込みません。</p>
<p>本アプリは、App Tracking Transparencyによるトラッキングの許可を求めず、他社のアプリやWebサイトをまたいだトラッキングを行いません。そのため、本アプリと広告SDKは広告識別子（IDFA）を使用できません。広告のリクエストでは、パーソナライズ広告を無効にし（Publisher Privacy Treatmentでパーソナライズを無効に設定）、Googleのpublisher first-party IDも無効にします。法令により同意が必要な地域では、Googleの同意管理の仕組み（User Messaging Platform）で同意の状態を確認し、広告のリクエストが認められる場合にだけ広告を読み込みます。同意の内容は、アカウントに表示される「広告のプライバシー設定」から確認・変更できます（Googleの仕組みが求める場合にだけ表示されます）。摂取記録、ヘルスケアのデータ、設定などの本アプリのデータを、広告SDKへ渡すことはありません。</p>
<p>Googleの公式の説明によると、Google Mobile Ads SDKは、広告の配信と測定、分析、不正の防止、問題の診断とSDKの改善のため、次の情報を取り扱う場合があります。</p>
<ul>
  <li>IPアドレス（おおよその位置の推定に使われます）</li>
  <li>クラッシュのログと、アプリの起動時間などのパフォーマンスのデータ</li>
  <li>端末の識別子（アプリや開発者の範囲で使われる識別子など）</li>
  <li>表示された広告などの広告のデータ</li>
  <li>広告のタップなどの操作の情報</li>
</ul>
<p>Googleによる情報の取り扱いと保存期間については、<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleのプライバシーポリシー</a>と<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Googleのサービスを使用するサイトやアプリから収集した情報の利用</a>をご確認ください。本アプリは、広告SDKのほかに、アクセス解析やクラッシュ解析のSDKを使用しません。</p>

<h3>通知</h3>
<p>毎日のリマインダーと実績のお知らせは、端末上で予約するローカル通知です。リマインダーの時刻を「自動」にした場合は、直近30日の記録から時刻を端末上で計算します。通知の内容を開発者のサーバーへ送ることはありません。通知の許可はiOSの「設定」から変更できます。</p>

<h3>フィードバック</h3>
<p>アカウントの「フィードバックを送る」が表示されている場合に、利用者が送信したときだけ、種類（不具合・要望・その他）、入力した本文（最大2000文字）、アプリのバージョンとビルド番号、iOSのバージョン、端末の機種、言語と地域の設定の7項目を送ります。自動では送信しません。摂取記録、メモ、購入の情報、連絡先、氏名、メールアドレス、端末の識別子、広告識別子は送りません。本文にも個人情報を書かないでください。</p>
<p>送信内容は、開発者がCloudflare, Inc.（米国）のCloudflare Workersで運用する受付処理を経由し、GitHub, Inc.（米国）が提供する開発者の非公開リポジトリにIssueとして保存し、不具合の調査と本アプリの改善に使います。両社の<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflareプライバシーポリシー</a>と<a href="https://docs.github.com/ja/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHubプライバシーステートメント</a>をご確認ください。送信元のIPアドレスは短い時間の送信回数の制限にだけ使い、IPアドレスと本文を受付処理で保存・記録しません。送信者を特定する情報を受け取らないため、返信はできません。</p>
<p>フィードバックは、不具合の調査と機能の改善に必要な間だけ保存します。削除を希望する場合は、下記の連絡先へ送信した日時と本文の一部を知らせてください。特定できたものを削除します。フィードバックを利用者に関連付けたり、トラッキングに使ったりしません。</p>

<h3>データの書き出しと取り込み</h3>
<p>アカウントの「データ」から利用者が操作したときだけ、摂取記録をCSVファイルに、摂取記録・飲まない日・カスタムドリンクを取り込み用のバックアップ（JSON）ファイルに書き出します。ファイルは端末上で作成され、共有シートで利用者が選んだ保存先・送信先に渡されます。開発者には送られません。ファイルは暗号化されないため、保管と共有は利用者が管理してください。バックアップの取り込みでは、利用者が選んだファイルを端末上で読み込み、今のデータに足します。</p>

<h3>データの削除</h3>
<p>アカウントの「データ」の「記録と宣言を削除」は、すべての摂取記録、飲まない日、実績とごほうび、ヘルスケアの連携がオンの場合は本アプリがヘルスケアに書き込んだカフェインのデータを削除します。ドリンクとお気に入り、設定、購入の状態、メモのデータは削除しません。iCloud同期の利用中は、削除をほかの端末へも反映します。</p>
<p>アプリを削除すると、端末内の本アプリのデータは削除されますが、iCloud上のデータとヘルスケアのデータは残ります。iCloud上のデータは、iPhoneの「設定」 &gt; 「ユーザー名」 &gt; 「iCloud」 &gt; 「ストレージを管理」から、ヘルスケアのデータはヘルスケアAppから削除できます。表示はiOSのバージョンにより異なる場合があります。</p>

<h3>第三者への提供と対象年齢</h3>
<p>開発者は利用者のデータを販売しません。本ポリシーに書いた、Apple（iCloud、ヘルスケア、購入）、Google（広告）、Cloudflare と GitHub（フィードバック）による処理を除き、法令に基づく場合のほかは、開発者が受け取った情報を第三者へ提供しません。これらの事業者による情報の取り扱いには、各社のプライバシーポリシーが適用されます。本アプリは18歳以上の方を対象としており、子どもの個人情報を意図的に収集しません。</p>

<h3>お問い合わせと変更</h3>
<p>ご質問は<a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">開発者の連絡先</a>からお寄せください。機能や情報の取り扱いが変わる場合は本ページを更新します。利用条件は<a href="/apps/caflog/terms/">CafLog利用規約</a>をご確認ください。</p>
</section>

<section id="caflog-privacy-en" lang="en">
<h2>English</h2>
<p>CafLog (the “App”) is a caffeine intake log provided by uesugiyuuto. This policy explains what information version 2.0 and later of the App handles and how it is used. The App has no separate account and never asks for your name, email address or phone number.</p>

<h3>Information stored on your device</h3>
<p>The following information is stored in an on-device SwiftData database and settings storage, in an area on the device shared by the App and its widgets (an App Group).</p>
<ul>
  <li>Intake records: date and time, drink name, caffeine amount (mg), serving size (ml), category, container shape and look, Health sync status and the identifier of the Health sample</li>
  <li>Drinks (presets and custom drinks), favorites, and records of deleted presets</li>
  <li>No-caffeine day declarations and calendar memos created in earlier versions (no longer shown, but the data is kept)</li>
  <li>Settings: daily limit, half-life, absorption time, sleep threshold, bedtime and wake time, daily reminder, and whether Health and iCloud sync are on</li>
  <li>Achievement and reward status, and the CafLog Pro purchase status confirmed with Apple</li>
</ul>
<p>Estimates of remaining caffeine, sleep impact, Review and widget content are calculated on your device from this information. If the App cannot open its data, it keeps a copy in the App’s area on the device so that the original data is not lost.</p>

<h3>iCloud sync</h3>
<p>Only when you turn on “iCloud Sync” in Account while CafLog Pro is active, intake records, drinks (including records of deleted presets), no-caffeine days and memos sync with your own private iCloud database through Apple CloudKit. Settings do not sync. The developer cannot access the contents of your private database. Turning iCloud sync off, or the end of Pro, does not delete data on your device or data already in iCloud. Apple’s processing is covered by <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple’s Privacy Policy</a>.</p>

<h3>Health (HealthKit)</h3>
<p>Only when you turn on “Health” in Account while CafLog Pro is active and grant permission, the App writes the amount and time of the caffeine you log to Health as Caffeine data. The App also asks for permission to read the same data type so that, when you edit or delete a record, it can find the data it wrote and rewrite or delete it. Caffeine data written by other apps is not used for display or analysis. Health data is not used for advertising, marketing or data brokers, and is not sent to the developer’s servers or the advertising SDK. You can change permission in iOS Settings or the Health app.</p>

<h3>Purchases and offer codes</h3>
<p>The monthly and yearly CafLog Pro auto-renewable subscriptions, purchase restoration and offer code redemption use Apple StoreKit. Apple processes payments; neither the App nor the developer receives payment or credit card information. Only purchase status obtained and verified from Apple determines access to Pro features and whether ads are shown, and the confirmed result is stored in the area shared by the App and its widgets on your device.</p>

<h3>Advertising</h3>
<p>On the free plan, the App uses the Google Mobile Ads SDK (Google AdMob) from Google LLC to display banner ads at the bottom of the Review and Account screens, just above the tab bar. Ads are not shown on Home, the logging screens, the Pro screen or similar screens. No ads are loaded while CafLog Pro is active or while purchase status is being checked.</p>
<p>The App does not request tracking permission through App Tracking Transparency and does not track you across other companies’ apps or websites. As a result, neither the App nor the advertising SDK can use the advertising identifier (IDFA). Ad requests turn off personalized ads (personalization is disabled through Publisher Privacy Treatment), and Google’s publisher first-party ID is also disabled. Where consent is required by law, the App checks consent status through Google’s consent management tool (the User Messaging Platform) and loads ads only when ad requests are permitted. You can review or change your choices from the ad privacy settings item in Account, which appears only when Google’s tool requires it. App data such as intake records, Health data and settings is never passed to the advertising SDK.</p>
<p>According to Google’s official documentation, the Google Mobile Ads SDK may handle the following information for ad delivery and measurement, analytics, fraud prevention, and diagnosing problems and improving the SDK:</p>
<ul>
  <li>IP address (used to estimate general location)</li>
  <li>Crash logs, and performance data such as app launch time</li>
  <li>Device identifiers (such as identifiers scoped to an app or developer)</li>
  <li>Advertising data, such as ads that have been shown</li>
  <li>Interaction information, such as ad taps</li>
</ul>
<p>See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s Privacy Policy</a> and <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google’s use of information from partner sites and apps</a> for Google’s processing and retention practices. Apart from the advertising SDK, the App uses no analytics or crash-reporting SDK.</p>

<h3>Notifications</h3>
<p>Daily reminders and achievement notices are local notifications scheduled on your device. When the reminder time is set to “Automatic”, the time is calculated on your device from the last 30 days of records. Notification content is not sent to the developer’s servers. You can change notification permission in iOS Settings.</p>

<h3>Feedback</h3>
<p>When “Send Feedback” is shown in Account, the App sends feedback only when you submit it. It sends seven items: the category (bug, request or other), your message (up to 2,000 characters), the App version and build number, iOS version, device model, and language and region settings. Nothing is sent automatically. Intake records, memos, purchase information, contacts, name, email address, device identifiers and advertising identifiers are not sent. Please do not put personal information in your message.</p>
<p>Feedback passes through an intake service operated by the developer on Cloudflare Workers from Cloudflare, Inc. (United States) and is saved as an Issue in the developer’s private repository hosted by GitHub, Inc. (United States), where it is used to investigate problems and improve the App. See the <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a> and <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a>. The source IP address is used only to limit submissions within a short period; the intake service neither stores nor logs IP addresses or messages. Because no information identifying the sender is received, we cannot reply.</p>
<p>Feedback is kept only as long as needed to investigate problems and improve the App. To request deletion, use the contact links below and provide the time you sent it and part of the message. We delete feedback we can identify. Feedback is not linked to you or used for tracking.</p>

<h3>Export and import</h3>
<p>Only when you use “Data” in Account, the App exports intake records to a CSV file, or intake records, no-caffeine days and custom drinks to a backup (JSON) file for import. Files are created on your device and handed to the destination you choose in the share sheet; they are not sent to the developer. Files are not encrypted, so you are responsible for storing and sharing them. Importing a backup reads the file you choose on your device and adds it to your current data.</p>

<h3>Deleting data</h3>
<p>“Delete Records and Declarations” in Account &gt; Data deletes all intake records, no-caffeine days, achievements and rewards, and, if Health sync is on, the caffeine data the App wrote to Health. Drinks and favorites, settings, purchase status and memo data are not deleted. While iCloud sync is in use, the deletion is also applied to your other devices.</p>
<p>Deleting the App removes its data from your device, but data in iCloud and in Health remains. You can delete iCloud data in Settings &gt; your name &gt; iCloud &gt; Manage Storage, and Health data in the Health app. Labels may vary by iOS version.</p>

<h3>Sharing with third parties and age requirement</h3>
<p>The developer does not sell your data. Except for the processing described in this policy by Apple (iCloud, Health and purchases), Google (advertising), and Cloudflare and GitHub (feedback), the developer does not share information it receives with third parties unless required by law. Each company’s privacy policy applies to its handling of information. The App is intended for people aged 18 and over and does not knowingly collect personal information from children.</p>

<h3>Contact and updates</h3>
<p>Please use the <a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">developer&#x27;s contact links</a> for questions. This policy will be updated when the App’s features or data practices change. See the <a href="/apps/caflog/terms/">CafLog Terms of Use</a> for conditions of use.</p>
</section>
`;
