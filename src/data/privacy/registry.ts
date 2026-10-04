import { html as payCyclePrivacy } from "./pay-cycle";
import { html as caflogPrivacy } from "./caflog";
import { html as devToolsPrivacy } from "./dev-tools";
import { html as sublogPrivacy } from "./sublog";
import { html as simplePomoPrivacy } from "./simple-pomo";

/**
 * アプリ固有の法務本文。
 * 掲載アプリは必ずここへ同じ slug で登録し、テストで registry と完全一致させる。
 */
export const privacyDocuments: Readonly<Record<string, string>> = {
  "pay-cycle": payCyclePrivacy,
  sublog: sublogPrivacy,
  caflog: caflogPrivacy,
  "dev-tools": devToolsPrivacy,
  "simple-pomo": simplePomoPrivacy,
};
