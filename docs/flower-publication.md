# 花島 / Flower Island: Living Sky publication — Issues #92 and #96

On 2026-10-12 the user forwarded Issue #92 (handoff `flower-legal-v1` from `yuto1201/iOS-Flower#428`) and asked for the support, privacy and terms pages. In the same conversation the user chose to also list the app in the catalog with its own product page, and decided not to show the `Status: Confirmed` line of the source files on the public pages.

## Public routes

- <https://app.yutodev.com/apps/flower/>
- <https://app.yutodev.com/apps/flower/support/>
- <https://app.yutodev.com/apps/flower/privacy/>
- <https://app.yutodev.com/apps/flower/terms/>

The app is unreleased: `status: alpha`, `releaseDate: null`, `appStoreUrl: null`, no screenshots. The home-screen name stays `Flower`.

## Rename to v2 — Issue #96

PR #93 first published handoff `flower-legal-v1` under the name 「花の島 — Flower」 / “Flower Island”. While creating the App Store Connect record (iOS-Flower #430, 2026-10-12) the user renamed the app to 「花島」 / “Flower Island: Living Sky” (Apple ID 6821803533, not yet released), because “Flower Island” was already taken. Issue #92 was switched to handoff `flower-legal-v2` at 04:27Z, before PR #93 merged at 04:43Z, but the notice on the PR was missed. Issue #96 replaces the six sources with v2 (iOS-Flower `99f660f2351e33b3ccd241ac0f9bdcb2011e43f9`; only the app name in one paragraph per file changed; rename approval <https://github.com/yuto1201/iOS-Flower/issues/428#issuecomment-6117745418>) and renames the catalog entry, legal page titles and product page. URLs are unchanged.

## Legal text

- Source: `yuto1201/iOS-Flower` at `99f660f2351e33b3ccd241ac0f9bdcb2011e43f9` (v2), `docs/legal/{ja,en-US}/{support,privacy,terms}.md`. The text was approved in <https://github.com/yuto1201/iOS-Flower/issues/428#issuecomment-6117202929> and the rename in <https://github.com/yuto1201/iOS-Flower/issues/428#issuecomment-6117745418>.
- The six files are kept byte for byte in `src/data/legal-sources/flower/`. `tests/legal-sources.test.ts` checks their SHA-256 against the v2 digests in Issue #92, checks that every block appears on the page, and checks that the old names do not. Page titles add the app name in each language, e.g. 「花島 サポート / Flower Island: Living Sky Support」.
- `src/lib/legal-markdown.ts` renders only the syntax these files use (headings, one-line paragraphs, whole-paragraph bold, bare `https` URLs). Indented blocks, other heading forms (closing hashes, tabs, empty or deeper headings), lists, quotes, code, rules, emphasis, strikethrough, Markdown links, inline HTML, entities, escapes, `http` URLs, URLs that end in punctuation or run straight into other text (a `)` closing a preceding `(` and full-width punctuation are allowed), and files whose status is not `Confirmed` fail the build instead of being guessed. The `Status:` line is not displayed. Links to `app.yutodev.com` keep the URL text and use a relative `href` with the same query and fragment.
- Each page shows the Japanese and English text on one page with an anchor language switch, and the footer links to the other two pages. `/apps/[slug]/support/` is generated from `src/data/support/registry.ts`.
- The approved privacy text describes feedback delivered through a Cloudflare Worker. At `cb730b3` the app still only queued feedback on the device; the delivery landed on iOS-Flower `dev` afterwards in PR #446 (Issue #427, merged 2026-10-12).

## Product page

- Names: `src/data/flower-name.ts`. The catalog, metadata and sticker use 「花島」; the product page shows both names in the hero and footer, and in the header from 1000px.
- Facts: Issue #92 and iOS-Flower `cb730b3` (`FlowerCatalog.swift`, `FlowerAccess.swift`, `SkyProfile.swift`, `FlowerLook.swift`, `ClockStyle.swift`, `IPHONEOS_DEPLOYMENT_TARGET = 27.0`). Prices of the paid flowers are not shown because the products are not registered in App Store Connect yet (iOS-Flower #367).
- Icon: `Flower/Flower/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png` (blob `c224c75d8d50fb58c3f2ba93c59d5ca3136f9b38`), resized to 512px as `public/apps/flower/icon.png`. The older icon on iOS-Flower `main` is not used.
- Flower art: `Assets.xcassets/Library/library-<id>.png` at the same commit (rose `59c63503`, camellia `dec07cfe`, dahlia `b622fd24`, anemone `3605bb08`, hibiscus `79738c07`, spider-lily `05027639`), resized to 480px WebP in `public/apps/flower/flowers/`.
- The hero is a decorative sky window. It follows the visitor's local time with the app's 5/8/17/20 o'clock boundaries and its 24-hour `HH:mm` clock, and a picker previews morning, day, dusk and night. The colours are a page interpretation, not the app's renderer output. The window text is CSS generated content inside `aria-hidden`, so it is part of the picture.
- Home: the ninth sticker uses the existing pencil-note glyphs (「今日のそら、なにいろ？」), so the Klee One subset is unchanged. The shared OGP image includes the new icon.

## Approval

Owner approval of the product copy and design, and of publication, is required before merge and is recorded in the PR. The legal text itself was approved in iOS-Flower #428; this repository only publishes it.
