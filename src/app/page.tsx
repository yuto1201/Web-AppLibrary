import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "yutodev.com",
};

/** yutodev.com の入口。個人サイトを作るまでは、アプリの一覧（/apps/）へのリンクだけを置く。 */
export default function RootPage() {
  return (
    <main className="door">
      <a className="door-link" href="/apps/">
        <span lang="ja">アプリの一覧へ</span>
        <span className="door-link-en" lang="en">Apps</span>
        <span aria-hidden="true"> →</span>
      </a>
    </main>
  );
}
