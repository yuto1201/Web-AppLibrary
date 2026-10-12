# SimplePomo publication — Issue #79

The user approved the animated black-and-white direction inspired by the supplied Refero page, then requested orange to match the actual app icon. They explicitly requested production publication in `yuto1201/Web-AppLibrary` on 2026-10-04. The dedicated React page uses the approved `#FD841B` accent, a moving clock, an animated rhythm indicator, and an accessible pause control. Reduced motion disables the animations.

## Public routes

- <https://app.yutodev.com/apps/simple-pomo/>
- <https://app.yutodev.com/apps/simple-pomo/privacy/>
- <https://app.yutodev.com/apps/simple-pomo/terms/>

The app remains unreleased: `status: alpha`, `releaseDate: null`, `appStoreUrl: null`. No screenshots were supplied; the home catalog and spotlight use the actual icon. Legal pages include the full Japanese and English text, language anchors, shared navigation and AppLibrary contact links.

## Source and content decisions

- Facts: [Issue #79](https://github.com/yuto1201/Web-AppLibrary/issues/79), which cites iOS-SimplePomo main `b3ca5f1` and the planned feedback Issue #102.
- Icon: `SimplePomo/Assets.xcassets/AppIcon.appiconset/AppIcon.png` at that pinned commit. Its Git blob is `57a32494c971559fdb79e57a3ace1325d26fa009`; the imported local source matched it.
- Operator and current contact: `uesugiyuuto` and <https://app.yutodev.com/#contact>, consistent with the supplied app facts and existing owner-facing site. No email address is introduced.
- Feedback is explicitly planned and not yet implemented. Its retention, deletion procedure and message limit are not invented; the policy requires those conditions to be added before the feature is released. This publication does not activate a feedback service.
- The app page says free with one-time Pro, without a numeric price. Terms describe JPY 500 as the planned Japanese price and defer to the actual App Store purchase display.
- Policy update, Terms effective and revision dates: `2026-10-04`.
- Owner approval of the completed bilingual legal copy is required before this PR is merged, as specified in Issue #79. Record that approval in the PR's publication evidence; CI is not owner approval.

## Verification scope

Run the repository's full `npm run verify`. New checks cover the three exported routes, icon loading, lack of an invented download link or screenshots, legal language anchors, route navigation and theme restoration, motion pause/resume and reduced motion, 320/390/768/1280px widths, runtime errors and actual color contrast. Existing home checks include every sticker and verify the icon fallback for apps without screenshots. Production checks must confirm all three public URLs after the reviewed PR is merged and Cloudflare Pages deploys `main`.

## Feedback legal update and app-matched page — Issue #89

On 2026-10-11 the user asked to update the legal pages for the implemented in-app feedback and to bring the product page closer to the finished app.

- Facts: [Issue #89](https://github.com/yuto1201/Web-AppLibrary/issues/89), checked against iOS-SimplePomo main `0b9d6ed` (`FeedbackClient.swift`, `FeedbackSheet.swift`, `Services/feedback-worker/wrangler.jsonc` and its README, deployed 2026-10-05).
- Privacy Policy section 7 now describes the released feedback: the six sent fields, excluded data, the Cloudflare Workers intake and private GitHub repository, the 60-second per-sender and 100-per-UTC-day limits, retention while needed, and deletion by time sent and part of the message without identity verification. The in-app label is 「フィードバックを送る」 / “Send feedback”.
- Terms of Use section 5 describes the feature as available and refers to Privacy Policy section 7. URLs are unchanged.
- Policy update and Terms revision dates: `2026-10-11` (Terms effective date stays `2026-10-04`). Owner approval of the bilingual copy is required before merge.
- The page now follows the app's neumorphic surfaces from `NeuStyle.swift` (`#E9EDF0` light, `#2A2D3E` dark) and the default Classic phase colors from `Theme.swift` (focus `#F28C33`, break `#80CC99`, long break `#338C66`). The hero reproduces the timer screen, where the phase color drains clockwise around the central disc. It follows the site's saved light/dark theme; the pause control and reduced motion still stop the animation.

## Terms Pro list — Issue #91

On 2026-10-12 the user asked to bring the Pro list in Terms of Use section 2 in line with the current app.

- Facts: [Issue #91](https://github.com/yuto1201/Web-AppLibrary/issues/91), checked against iOS-SimplePomo main `be62b71` (`SimplePomo/StoreKit/ProPaywallView.swift`, `specs/features/storekit.md` §3, decisions D-112, D-113 and D-115). English names follow the app's `Localizable.xcstrings`.
- The second paragraph of section 2 now lists five ambient sounds, focus up to 180 minutes and long breaks up to 90 minutes, full-screen AlarmKit alarms, six color themes, five timer fonts, interactive widgets, the Focus Heatmap widget, and adding, editing, deleting and selecting added presets. It also names what stays free: the Classic and Ocean themes, the Standard and Monospaced fonts and the Standard preset. The planned Apple Watch support is not listed because the app shows it as planned, not as an available feature (D-112).
- The Family Sharing and restoration sentences, the price, the Privacy Policy and the URL are unchanged.
- Terms revision date: `2026-10-12` (effective date stays `2026-10-04`). Owner approval of the bilingual copy is required before merge.
