# Poster paper and sticker footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the home page as a cream/voltage-blue poster (#30), then move stickers into a footer pile that can be dragged across the paper (#31).

**Architecture:** Keep token names. Change values and type. Lift hover/focus slug into a thin client provider when stickers leave the list. Drag clamp uses the page stage, not the old band. No new libraries.

**Tech Stack:** Next.js static export, CSS tokens, React pointer events, Vitest, Playwright.

## Global Constraints

- `--paper` light `#fff8f1`; `--ink` light `#000000`; `--rule` `#e2e8f0`; `--accent` light `#006eff` (dark: lighter blue if 16px fails 4.5:1)
- Display Latin: Newsreader 400 via `next/font/google`. No Bricolage. Inter 300/400 for UI. No weight 600+ on home UI.
- CTA: outlined pill, 60px radius, 1.5px accent border, transparent fill
- Stickers: existing icons as vinyl; no names on stickers; pile at footer; clamp to page stage; not `position: fixed`
- `page.tsx` stays a Server Component
- No search/filter/modal, no drag library, no new illustrations
- `npm run verify` must pass; axe color-contrast on real colors
- 1 Issue / 1 branch / 1 PR: `claude/30-poster-paper` then `claude/31-sticker-footer-pile`

---

## File map

**#30:** `src/styles/tokens.css`, `src/app/layout.tsx`, `src/styles/standard.css`, `src/styles/legal.css` (token follow), `tests/e2e/site.spec.ts`, `docs/design/top.md`

**#31:** `src/lib/activate.tsx` (provider), `src/app/page.tsx`, `src/components/AppLibrarySection.tsx` (removed), `src/components/AppsSection.tsx`, `src/components/Stickers.tsx`, `src/lib/drag.ts` (comments), `src/styles/standard.css`, `tests/drag.test.ts`, `tests/e2e/site.spec.ts`, `docs/design/top.md`

### Task 1: Poster tokens, type, home chrome (#30)

- [x] Plan recorded
- [ ] Failing E2E for cream paper, Newsreader, no Bricolage, outlined CTA
- [ ] Tokens + layout fonts + standard.css poster chrome
- [ ] `npm run verify`
- [ ] Commit, PR, merge #30

### Task 2: Footer vinyl pile + page-wide drag (#31)

- [x] Failing tests for pile placement, drag onto hero, no sticker name, page clamp
- [x] Activate provider + stickers on page stage
- [x] `npm run verify`
- [x] Commit, PR, merge #31
