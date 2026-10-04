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
