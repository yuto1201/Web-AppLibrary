# 花の島 — Flower publication — Issue #92

On 2026-10-12 the user forwarded Issue #92 (handoff `flower-legal-v1` from `yuto1201/iOS-Flower#428`) and asked for the support, privacy and terms pages. In the same conversation the user chose to also list the app in the catalog with its own product page, and decided not to show the `Status: Confirmed` line of the source files on the public pages.

## Public routes

- <https://app.yutodev.com/apps/flower/>
- <https://app.yutodev.com/apps/flower/support/>
- <https://app.yutodev.com/apps/flower/privacy/>
- <https://app.yutodev.com/apps/flower/terms/>

The app is unreleased: `status: alpha`, `releaseDate: null`, `appStoreUrl: null`, no screenshots. The App Store name 「花の島 — Flower」 is not registered yet (iOS-Flower #430); the home-screen name stays `Flower`.

## Legal text

- Source: `yuto1201/iOS-Flower` at `cb730b3bfda2a89f43b7c37f254b44b3fa8d2332`, `docs/legal/{ja,en-US}/{support,privacy,terms}.md`, approved in <https://github.com/yuto1201/iOS-Flower/issues/428#issuecomment-6117202929>.
- The six files are kept byte for byte in `src/data/legal-sources/flower/`. `tests/legal-sources.test.ts` checks their SHA-256 against the digests in Issue #92 and checks that every block appears on the page.
- `src/lib/legal-markdown.ts` renders only the syntax these files use (headings, one-line paragraphs, whole-paragraph bold, bare `https` URLs). Indented blocks, other heading forms (closing hashes, tabs, empty or deeper headings), lists, quotes, code, rules, emphasis, strikethrough, Markdown links, inline HTML, entities, escapes, `http` URLs, URLs that end in punctuation or run straight into other text (a `)` closing a preceding `(` and full-width punctuation are allowed), and files whose status is not `Confirmed` fail the build instead of being guessed. The `Status:` line is not displayed. Links to `app.yutodev.com` keep the URL text and use a relative `href` with the same query and fragment.
- Each page shows the Japanese and English text on one page with an anchor language switch, and the footer links to the other two pages. `/apps/[slug]/support/` is generated from `src/data/support/registry.ts`.
- The approved privacy text describes feedback delivered through a Cloudflare Worker. At `cb730b3` the app still only queued feedback on the device; the delivery landed on iOS-Flower `dev` afterwards in PR #446 (Issue #427, merged 2026-10-12).

## Product page

- Facts: Issue #92 and iOS-Flower `cb730b3` (`FlowerCatalog.swift`, `FlowerAccess.swift`, `SkyProfile.swift`, `FlowerLook.swift`, `ClockStyle.swift`, `IPHONEOS_DEPLOYMENT_TARGET = 27.0`). Prices of the paid flowers are not shown because the products are not registered in App Store Connect yet (iOS-Flower #367).
- Icon: `Flower/Flower/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png` (blob `c224c75d8d50fb58c3f2ba93c59d5ca3136f9b38`), resized to 512px as `public/apps/flower/icon.png`. The older icon on iOS-Flower `main` is not used.
- Flower art: `Assets.xcassets/Library/library-<id>.png` at the same commit (rose `59c63503`, camellia `dec07cfe`, dahlia `b622fd24`, anemone `3605bb08`, hibiscus `79738c07`, spider-lily `05027639`), resized to 480px WebP in `public/apps/flower/flowers/`.
- The hero is a decorative sky window. It follows the visitor's local time with the app's 5/8/17/20 o'clock boundaries and its 24-hour `HH:mm` clock, and a picker previews morning, day, dusk and night. The colours are a page interpretation, not the app's renderer output. The window text is CSS generated content inside `aria-hidden`, so it is part of the picture.
- Home: the ninth sticker uses the existing pencil-note glyphs (「今日のそら、なにいろ？」), so the Klee One subset is unchanged. The shared OGP image includes the new icon.

## Approval

Owner approval of the product copy and design, and of publication, is required before merge and is recorded in the PR. The legal text itself was approved in iOS-Flower #428; this repository only publishes it.
