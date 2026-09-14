import { describe, expect, it } from "vitest";
import { readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { apps, getApp } from "@/data/registry";
import { privacyDocuments } from "@/data/privacy/registry";
import { appSchema } from "@/data/schema";

describe("apps registry", () => {
  it("PayCycle はストア公開前の状態を保持する", () => {
    expect(getApp("pay-cycle")).toMatchObject({
      status: "alpha", releaseDate: null, appStoreUrl: null,
    });
  });

  it("PayCycle の日英ポリシーが広告と購入権利の扱いを保持する", () => {
    const document = privacyDocuments["pay-cycle"]!;
    const japanese = document.match(/<section lang="ja">([\s\S]*?)<\/section>/u)?.[1] ?? "";
    const english = document.match(/<section lang="en">([\s\S]*?)<\/section>/u)?.[1] ?? "";
    for (const disclosure of ["端末内データベース", "Google AdMob", "Google UMP", "App Tracking Transparency", "publisher first-party ID", "検証した購入権利", "新しい広告要求を行いません", "ローカル通知"]) {
      expect(japanese).toContain(disclosure);
    }
    for (const disclosure of ["on-device database", "Google AdMob", "Google UMP", "App Tracking Transparency", "publisher first-party ID", "Verified purchase entitlements", "No new ad requests", "scheduled locally"]) {
      expect(english).toContain(disclosure);
    }
  });

  it("登録された画像が各アプリの公開ディレクトリ内に実在する", () => {
    for (const app of apps) {
      const directory = realpathSync(path.resolve("public/apps", app.slug));
      const images = [app.icon, ...app.screenshots.map((file) => `screenshots/${file}`)];
      for (const file of images) {
        if (file === null) continue;
        const resolved = realpathSync(path.resolve(directory, file));
        const relative = path.relative(directory, resolved);
        expect(relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)).toBe(true);
        expect(statSync(resolved).isFile()).toBe(true);
      }
    }
  });
  it("全エントリがスキーマを満たす", () => {
    for (const app of apps) {
      expect(() => appSchema.parse(app)).not.toThrow();
    }
  });

  it("slug が一意である", () => {
    const slugs = apps.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("全掲載アプリに同じ slug のプライバシー本文がある", () => {
    expect(Object.keys(privacyDocuments).sort()).toEqual(apps.map((app) => app.slug).sort());
    for (const app of apps) expect(privacyDocuments[app.slug]).toContain("プライバシーポリシー");
  });

  it("公開するプライバシー本文に仮文言や架空の連絡先がない", () => {
    for (const app of apps) {
      const document = privacyDocuments[app.slug]!;
      expect(document).toContain("お問い合わせ");
      expect(document).not.toMatch(/example\.(?:com|org)|TODO|FIXME|雛形|⚠️|記入してください/u);
    }
  });

  it("すべてのアプリが 1 つ以上のプラットフォームを持つ", () => {
    for (const app of apps) {
      expect(app.platforms.length).toBeGreaterThan(0);
    }
  });

  it("機能カードはアイコン・見出し・説明を持つ", () => {
    for (const app of apps) {
      expect(app.features.length).toBeGreaterThan(0);
      expect(new Set(app.features.map((feature) => feature.title)).size).toBe(app.features.length);
      for (const feature of app.features) {
        expect(feature.icon).not.toBe("");
        expect(feature.title).not.toBe("");
        expect(feature.description).not.toBe("");
      }
    }
  });

  it("同じアプリ内の機能見出しは一意である", () => {
    const source = apps[0]!;
    const duplicate = source.features[0]!;
    expect(() => appSchema.parse({ ...source, features: [duplicate, duplicate] })).toThrow(/title が重複/u);
  });

  it("公開済みアプリの初回公開日を保持する", () => {
    expect(getApp("sublog")?.releaseDate).toBe("2026-04-14");
    expect(getApp("caflog")?.releaseDate).toBe("2026-04-10");
    expect(getApp("dev-tools")?.releaseDate).toBe("2026-03-30");
  });

  it("実在しない公開日を拒否する", () => {
    const source = apps[0]!;
    for (const releaseDate of ["2026-02-31", "2026-13-01", "2026-00-10"]) {
      expect(() => appSchema.parse({ ...source, releaseDate })).toThrow(/実在する日付/u);
    }
  });

  it("CafLog 1.0 の公開機能数を App Store の配布情報と一致させる", () => {
    const caflog = getApp("caflog")!;
    expect(caflog.version).toBe("1.0");
    expect(caflog.features.find(({ title }) => title === "10 秒で記録")?.description).toContain("18 種類");
    expect(caflog.features.find(({ title }) => title === "13 種類の分析")).toBeDefined();
    expect(caflog.features.find(({ title }) => title === "21 種類の称号")).toBeDefined();
  });

  it("SubLog の公開ポリシーが StoreKit 検出とリセット範囲を明示する", () => {
    const document = privacyDocuments.sublog!;
    expect(document).toContain("検証済み取引履歴");
    expect(document).toContain("商品 ID、価格、通貨、期限");
    expect(document).toContain("通知履歴、表示や同期などの設定");
    expect(document).toContain("通常の請求日前通知");
    expect(document).toContain("無料トライアル終了、契約記念日、月次レポートの保留中通知");
    expect(document).toContain("iOS のカレンダーへのフルアクセス");
    expect(document).toContain("登録内容と一致しない予定を削除");
    expect(document).toContain("本アプリと無関係な予定を保存しないでください");
    expect(document).toContain("カレンダーへ同期済みの予定");
    expect(document).toContain("Spotlight の検索インデックス");
    expect(document).toContain("アプリをアンインストールすると削除されます");
    expect(document).toContain("App Store の取引履歴は、この操作の対象ではありません");
  });

  it("SubLog 1.0 のサービス候補数を App Store の配布情報と一致させる", () => {
    const sublog = getApp("sublog")!;
    expect(sublog.version).toBe("1.0");
    expect(sublog.features.find(({ title }) => title === "かんたん登録")?.description).toContain("85 以上");
  });

  it("Dev-Tools を公開中の Web アプリとして保持する", () => {
    const devTools = getApp("dev-tools")!;
    expect(devTools.platforms).toEqual(["Web"]);
    expect(devTools.status).toBe("beta");
    expect(devTools.version).toBe("0.8");
    expect(devTools.appStoreUrl).toBeNull();
    expect(devTools.siteUrl).toBe("https://yuto1201.github.io/Dev-Tools/");
    expect(devTools.screenshots).toHaveLength(3);
    expect(devTools.features.map(({ title }) => title)).toEqual([
      "ER Diagram",
      "App Store Preview",
      "Design Pocket",
      "Text Counter",
      "Icon Gallery",
      "端末内保存と任意の同期",
    ]);
  });

  it("Dev-Tools の公開ポリシーが保存・同期・配信主体と削除導線を明示する", () => {
    const document = privacyDocuments["dev-tools"]!;
    expect(document).toContain("localStorage");
    expect(document).toContain("drive.appdata");
    expect(document).toContain("userinfo.email");
    expect(document).toContain("appDataFolder");
    expect(document).toContain("アクセストークン");
    expect(document).toContain("GitHub Pages");
    expect(document).toContain("非表示のアプリデータ");
    expect(document).toContain("https://github.com/yuto1201/Dev-Tools/issues");
  });

  it("OGP 画像は 1200 x 630 の PNG", () => {
    const image = readFileSync("public/ogp.png");
    expect([...image.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });

  it("getApp は slug で引ける / 無い slug は undefined", () => {
    expect(getApp("sublog")?.name).toBe("SubLog");
    expect(getApp("does-not-exist")).toBeUndefined();
  });
});
