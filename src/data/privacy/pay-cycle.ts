export const html = String.raw`
<h1>PayCycle プライバシーポリシー / Privacy Policy</h1>
<p class="legal-meta">最終更新日 / Last updated: <time datetime="2026-09-15">2026-09-15</time></p>
<p class="legal-language">本ページは日本語と英語で提供しています。 <span lang="en">This page is available in Japanese and English.</span></p>
<nav class="legal-language-switch" aria-label="言語 / Language"><a href="#paycycle-privacy-ja">日本語</a><span> · </span><a href="#paycycle-privacy-en" lang="en">English</a></nav>

<section lang="ja">
<h2 id="paycycle-privacy-ja">日本語</h2>
<p>PayCycleは、uesugiyuutoが提供する給料日サイクル単位の支払い管理アプリです。</p>

<h3>端末内に保存する情報</h3>
<p>給料日、給料の表示名・見込み額・確定額・予定日・実際の入金日、支払いの表示名・見込み額・確定額・手数料・予定日・実際の支払日・確認状態・繰り返し設定、銀行口座とカードの表示名および任意の下4桁、通知の有効状態と通知時刻を端末内データベースに保存します。</p>
<p>完全な口座番号、カード番号、暗証番号、認証情報、銀行取引明細は保存しません。PayCycleはアカウントを作成せず、CloudKitや独自サーバーを使用しません。同期、エクスポート、バックアップ、端末間移行は提供せず、入力した家計情報を広告SDKへ渡しません。アプリを削除すると、アプリのローカルデータも削除されます。</p>

<h3>広告と第三者SDK</h3>
<p>無料利用時はGoogle AdMobのアンカー型アダプティブバナーをホーム、カレンダー、一覧、統計の下部だけに表示します。Google UMPの同意状態が広告要求を許可した場合にだけ広告を読み込み、同意情報を取得できない場合は読み込みません。PayCycleは位置情報の権限やApp Tracking Transparencyの許可を要求せず、Googleのpublisher first-party IDを無効にし、publisher privacy personalization stateをdisabledに設定します。</p>
<p>広告の配信・測定、不正防止、品質改善のため、GoogleのSDKはCoarse Location、Device ID、Product Interaction、Advertising Data、Crash Data、Performance Data、Other Diagnostic Dataを取り扱う場合があります。Googleが取り扱う情報と保持期間については<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleのプライバシーポリシー</a>および<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Googleのサービスを使用するサイトやアプリから収集した情報の利用</a>をご確認ください。</p>

<h3>購入とApple Offer Code</h3>
<p>広告非表示の非消費型アプリ内課金、購入の復元、対象となるApple Offer CodeにはApple StoreKit 2を使用します。決済はAppleが処理し、PayCycleは決済情報やクレジットカード情報を受け取りません。Appleから取得して検証した購入権利だけを広告非表示の判定に使い、権利を確認できた状態では新しい広告要求を行いません。Appleによる情報の取り扱いには<a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Appleのプライバシーポリシー</a>が適用されます。</p>

<h3>通知</h3>
<p>利用者が通知を有効にした場合だけ、支払い予定に基づくローカル通知を端末上で登録します。リモートPush、バックグラウンド通信、銀行取引の監視は行いません。通知権限を拒否しても主要機能を利用でき、許可はiOS設定から変更できます。</p>

<h3>お問い合わせと変更</h3>
<p>ご質問は<a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">開発者の連絡先</a>からお寄せください。お問い合わせに家計情報、口座番号、カード番号などの機微な情報を含めないでください。機能や情報の取り扱いが変わる場合は本ページを更新します。利用条件は<a href="/apps/pay-cycle/terms/">PayCycle利用規約</a>をご確認ください。</p>
</section>

<section lang="en">
<h2 id="paycycle-privacy-en">English</h2>
<p>PayCycle is a payday-based bill planning app provided by uesugiyuuto.</p>

<h3>Information stored on your device</h3>
<p>The on-device database stores payday settings; salary names, estimates, confirmed amounts and dates; bill names, estimates, confirmed amounts, fees, dates, status and recurrence; bank/card display names and optional last four digits; and notification settings.</p>
<p>PayCycle does not store full bank account numbers, card numbers, PINs, credentials or bank transaction records. It creates no account and uses neither CloudKit nor a proprietary server. It provides no sync, export, backup or device-to-device transfer, and it does not pass your financial planning data to the advertising SDK. Deleting the App removes its local app data.</p>

<h3>Advertising and third-party SDKs</h3>
<p>The free version displays Google AdMob anchored adaptive banners only at the bottom of Home, Calendar, List and Statistics. Ads are requested only when Google UMP reports that requests are permitted; no ad is loaded if consent information cannot be obtained. PayCycle requests neither location permission nor App Tracking Transparency permission, disables Google’s publisher first-party ID and sets the publisher privacy personalization state to disabled.</p>
<p>For ad delivery, measurement, fraud prevention and service quality, Google’s SDK may process Coarse Location, Device ID, Product Interaction, Advertising Data, Crash Data, Performance Data and Other Diagnostic Data. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s Privacy Policy</a> and <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google’s use of information from partner sites and apps</a> for Google’s processing and retention practices.</p>

<h3>Purchases and Apple Offer Codes</h3>
<p>The non-consumable ad-removal purchase, purchase restoration and eligible Apple Offer Codes use Apple StoreKit 2. Apple processes payments; PayCycle does not receive independent payment or credit card information. Verified purchase entitlements obtained from Apple determine ad-free access. No new ad requests are made while an ad-free entitlement is recognized. Apple’s processing is covered by <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple’s Privacy Policy</a>.</p>

<h3>Notifications</h3>
<p>Bill reminders are scheduled locally on your device only when you enable notifications. PayCycle uses no remote push, background communication or bank transaction monitoring. The App’s main features remain available if notification permission is denied, and permission can be changed in iOS Settings.</p>

<h3>Contact and updates</h3>
<p>Please use the <a href="https://app.yutodev.com/#contact" target="_blank" rel="noopener noreferrer">developer’s contact links</a> for questions. Do not include financial details, bank account numbers or card numbers in messages. This policy will be updated when the App’s features or data practices change. See the <a href="/apps/pay-cycle/terms/">PayCycle Terms of Use</a> for conditions of use.</p>
</section>
`;
