export const html = String.raw`
<h1>PayCycle プライバシーポリシー / Privacy Policy</h1>
<p class="legal-meta">最終更新日 / Last updated: <time datetime="2026-09-30">2026-09-30</time></p>
<p class="legal-language">本ページは日本語と英語で提供しています。 <span lang="en">This page is available in Japanese and English.</span></p>
<nav class="legal-language-switch" aria-label="言語 / Language"><a href="#paycycle-privacy-ja">日本語</a><span> · </span><a href="#paycycle-privacy-en" lang="en">English</a></nav>

<section lang="ja">
<h2 id="paycycle-privacy-ja">日本語</h2>
<p>PayCycleは、uesugiyuutoが提供する給料日サイクル単位の支払い管理アプリです。</p>

<h3>保存する情報とiCloud同期</h3>
<p>給料日の設定、給料の表示名・見込み額・確定額・予定日・実際の入金日、支払いの表示名・見込み額・確定額・手数料・予定日・実際の支払日・確認状態・繰り返し設定・最終回の日付、臨時収入の表示名・見込み額・確定額・予定日・実際の入金日、銀行口座とカードの表示名および任意の下4桁を端末内のSwiftDataデータベースに保存します。通知の有効状態と通知時刻も端末内に保存します。</p>
<p>バージョン1.1以降、家計データは利用者自身のiCloudのプライベートデータベースとCloudKitで常に同期します。この同期はアプリ内でオフにできません。開発者はプライベートデータベースの内容にアクセスできず、家計データは開発者のサーバーや広告SDKには送られません。iCloudにサインインしていない端末やiCloudが制限されている端末では、端末内だけで動作し、サインイン後に同期されます。通知の有効状態と通知時刻は端末ごとの設定で、同期しません。</p>
<p>完全な口座番号、カード番号、暗証番号、認証情報、銀行取引明細は保存しません。PayCycleは独自のアカウントを作成せず、銀行やカード会社へ接続しません。</p>

<h3>データの書き出し、読み込みと削除</h3>
<p>バージョン1.1以降、利用者が設定から操作したときだけ、すべての家計記録を1つのJSONファイルに書き出します。端末ごとの通知設定は含めません。ファイルは端末上で作成され、共有シートで利用者が選んだ保存先・送信先に渡されます。開発者には送られません。ファイルは暗号化されないため、保存と共有は利用者が管理してください。</p>
<p>読み込みは利用者の確認後、現在の家計データをファイルの内容ですべて置き換えます。置き換え前のデータの写しを端末内のアプリ領域に直近3件まで残し、iCloudへは送りません。読み込んだデータは通常の家計データと同様に同期します。また、1.0から1.1への更新時には、更新前のデータの写しを端末内のアプリ領域に最大3件残し、iCloudへは送りません。</p>
<p>アプリを削除すると端末内のアプリデータは削除されますが、iCloud上のデータは残ります。iCloud上のデータを削除するには、iPhoneの「設定」 &gt; 「ユーザー名」 &gt; 「iCloud」 &gt; 「ストレージを管理」 &gt; 「PayCycle」から削除してください。表示はiOSのバージョンにより異なる場合があります。詳しくは<a href="https://support.apple.com/ja-jp/guide/icloud/mm62d92d6b3e/icloud" target="_blank" rel="noopener noreferrer">Appleのサポート</a>をご確認ください。</p>

<h3>フィードバック</h3>
<p>バージョン1.1以降、設定の「フィードバックを送る」から利用者が送信したときだけ、種類（不具合・要望・その他）、入力した本文（最大2000文字）、アプリのバージョンとビルド番号、iOSのバージョン、端末の機種、言語と地域の設定を送ります。自動送信はしません。家計データ、口座・カード、連絡先、氏名、メールアドレス、端末識別子、広告IDは送信項目に含めません。本文にも個人情報を書かないでください。</p>
<p>送信内容は、開発者がCloudflare, Inc.（米国）のCloudflare Workersで運用する受付処理を経由し、GitHub, Inc.（米国）が提供する開発者の非公開リポジトリにIssueとして保存します。両社の<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflareプライバシーポリシー</a>と<a href="https://docs.github.com/ja/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHubプライバシーステートメント</a>をご確認ください。送信元のIPアドレスは短時間の送信回数制限にだけ使い、Issueには含めません。受付処理は送信内容を記録せず、Cloudflareの呼び出しログも無効にしています。1日の受付件数には全体の上限があります。</p>
<p>フィードバックは不具合の調査と機能の改善に必要な間だけ保存します。送信者を特定する情報を受け取らないため返信や本人確認は行いません。削除を希望する場合は、下記の連絡先へ送信日時と本文の一部を知らせてください。特定できたものを削除します。フィードバックを利用者に関連付けたり、トラッキングに使用したりしません。</p>

<h3>広告と第三者SDK</h3>
<p>バージョン1.1以降、無料利用時はGoogle AdMobのアンカー型アダプティブバナーをホーム、統計、設定の3つのタブの下部だけに表示します。Google UMPの同意状態が広告要求を許可した場合にだけ広告を読み込み、同意情報を取得できない場合は読み込みません。PayCycleは位置情報の権限やApp Tracking Transparencyの許可を要求せず、Googleのpublisher first-party IDを無効にし、publisher privacy personalization stateをdisabledに設定します。</p>
<p>広告の配信・測定、不正防止、品質改善のため、GoogleのSDKはCoarse Location、Device ID、Product Interaction、Advertising Data、Crash Data、Performance Data、Other Diagnostic Dataを取り扱う場合があります。Googleが取り扱う情報と保持期間については<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleのプライバシーポリシー</a>および<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Googleのサービスを使用するサイトやアプリから収集した情報の利用</a>をご確認ください。</p>

<h3>購入とApple Offer Code</h3>
<p>広告非表示の非消費型アプリ内課金、購入の復元、対象となるApple Offer CodeにはApple StoreKit 2を使用します。決済はAppleが処理し、PayCycleは決済情報やクレジットカード情報を受け取りません。Appleから取得して検証した購入権利だけを広告非表示の判定に使い、権利を確認できた状態では新しい広告要求を行いません。Appleによる情報の取り扱いには<a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Appleのプライバシーポリシー</a>が適用されます。</p>

<h3>通知</h3>
<p>利用者が通知を有効にした場合だけ、支払い予定に基づくローカル通知を端末上で登録します。通知のためのリモートPushや独自のバックグラウンド通信、銀行取引の監視は行いません。通知権限を拒否しても主要機能を利用でき、許可はiOS設定から変更できます。</p>

<h3>お問い合わせと変更</h3>
<p>ご質問は<a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">開発者の連絡先</a>からお寄せください。お問い合わせに家計情報、口座番号、カード番号などの機微な情報を含めないでください。機能や情報の取り扱いが変わる場合は本ページを更新します。利用条件は<a href="/apps/pay-cycle/terms/">PayCycle利用規約</a>をご確認ください。</p>
</section>

<section lang="en">
<h2 id="paycycle-privacy-en">English</h2>
<p>PayCycle is a payday-based bill planning app provided by uesugiyuuto.</p>

<h3>Information stored and iCloud sync</h3>
<p>The on-device SwiftData database stores payday settings; salary names, estimated and confirmed amounts, scheduled and actual payment dates; bill names, estimated and confirmed amounts, fees, scheduled and actual payment dates, confirmation status, recurrence and the final date of a recurring bill; extra-income names, estimated and confirmed amounts, scheduled and actual receipt dates; and bank/card display names and optional last four digits. Notification status and times are also stored on the device.</p>
<p>From version 1.1, financial planning data continuously syncs through CloudKit with your private iCloud database. This sync cannot be turned off in the App. The developer cannot access the contents of your private database, and this data is not sent to the developer’s server or the advertising SDK. On devices that are not signed in to iCloud or where iCloud is restricted, the App works locally and syncs after sign-in. Notification status and times are per-device settings and do not sync.</p>
<p>PayCycle does not store full bank account numbers, card numbers, PINs, credentials or bank transaction records. It creates no separate account and does not connect to banks or card issuers.</p>

<h3>Export, import and deletion</h3>
<p>From version 1.1, only when you choose the action in Settings, the App exports all financial planning records into one JSON file. Per-device notification settings are excluded. The file is created on your device and handed to the destination you choose in the share sheet. It is not sent to the developer. The file is not encrypted, so you are responsible for where you store and share it.</p>
<p>After your confirmation, importing replaces all current financial planning data with the file’s contents. The App keeps up to three most recent copies of replaced data in its storage on the device, without sending them to iCloud. Imported data syncs like other financial planning data. When updating from 1.0 to 1.1, the App also keeps up to three copies of pre-update data in its storage on the device; these are not sent to iCloud.</p>
<p>Deleting the App removes its local app data, but data in iCloud remains. To delete iCloud data, go to iPhone Settings &gt; your name &gt; iCloud &gt; Manage Storage &gt; PayCycle. Labels may vary by iOS version. See <a href="https://support.apple.com/en-gb/guide/icloud/mm62d92d6b3e/icloud" target="_blank" rel="noopener noreferrer">Apple Support</a> for more information.</p>

<h3>Feedback</h3>
<p>From version 1.1, the App sends feedback only when you use “Send Feedback” in Settings. It sends the category (bug, request or other), your message (up to 2,000 characters), the App version and build number, iOS version, device model, and language and region settings. It does not send feedback automatically. Financial planning data, bank or card details, contacts, name, email address, device identifiers and advertising ID are not included in the sent fields. Please do not put personal information in your message.</p>
<p>Feedback passes through an intake service operated by the developer on Cloudflare Workers from Cloudflare, Inc. (United States) and is saved as an Issue in the developer’s private repository hosted by GitHub, Inc. (United States). See the <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a> and <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a>. The source IP address is used only to limit submissions within a short period and is not included in the Issue. The intake service does not log submitted content, and Cloudflare request logs are disabled. A daily limit applies to all submissions.</p>
<p>Feedback is kept only as long as needed to investigate problems and improve the App. We do not receive information that identifies the sender, so we do not reply or verify the sender’s identity. To request deletion, use the contact links below and provide the time sent and part of the message. We delete feedback we can identify. Feedback is not linked to users or used for tracking.</p>

<h3>Advertising and third-party SDKs</h3>
<p>From version 1.1, the free version displays Google AdMob anchored adaptive banners only at the bottom of the three tabs: Home, Statistics and Settings. Ads are requested only when Google UMP reports that requests are permitted; no ad is loaded if consent information cannot be obtained. PayCycle requests neither location permission nor App Tracking Transparency permission, disables Google’s publisher first-party ID and sets the publisher privacy personalization state to disabled.</p>
<p>For ad delivery, measurement, fraud prevention and service quality, Google’s SDK may process Coarse Location, Device ID, Product Interaction, Advertising Data, Crash Data, Performance Data and Other Diagnostic Data. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s Privacy Policy</a> and <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google’s use of information from partner sites and apps</a> for Google’s processing and retention practices.</p>

<h3>Purchases and Apple Offer Codes</h3>
<p>The non-consumable ad-removal purchase, purchase restoration and eligible Apple Offer Codes use Apple StoreKit 2. Apple processes payments; PayCycle does not receive independent payment or credit card information. Verified purchase entitlements obtained from Apple determine ad-free access. No new ad requests are made while an ad-free entitlement is recognized. Apple’s processing is covered by <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple’s Privacy Policy</a>.</p>

<h3>Notifications</h3>
<p>Bill reminders are scheduled locally on your device only when you enable notifications. PayCycle uses no remote push or independent background communication for notifications, and does not monitor bank transactions. The App’s main features remain available if notification permission is denied, and permission can be changed in iOS Settings.</p>

<h3>Contact and updates</h3>
<p>Please use the <a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">developer&#x27;s contact links</a> for questions. Do not include financial details, bank account numbers or card numbers in messages. This policy will be updated when the App’s features or data practices change. See the <a href="/apps/pay-cycle/terms/">PayCycle Terms of Use</a> for conditions of use.</p>
</section>
`;
