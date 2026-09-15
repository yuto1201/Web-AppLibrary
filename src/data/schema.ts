import { z } from "zod";

/**
 * 掲載対象のプラットフォーム。
 * iOS 限定だった旧 registry.js から拡張し、Xcode 製以外のアプリも扱えるようにする。
 */
export const PLATFORMS = ["iOS", "iPadOS", "macOS", "watchOS", "visionOS", "Web", "CLI"] as const;
export const platformSchema = z.enum(PLATFORMS);
export type Platform = (typeof PLATFORMS)[number];

export const STATUSES = ["alpha", "beta", "release", "archived"] as const;
export const statusSchema = z.enum(STATUSES);
export type Status = (typeof STATUSES)[number];

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/u, "16 進 6 桁の色コードで指定する");

const releaseDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, "YYYY-MM-DD 形式で指定する")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    if (year === undefined || month === undefined || day === undefined) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day;
  }, "実在する日付を指定する");

export const featureSchema = z.object({
  icon: z.string().min(1).max(16),
  title: z.string().min(1),
  description: z.string().min(1),
});

const featuresSchema = z
  .array(featureSchema)
  .min(1)
  .refine(
    (features) => new Set(features.map((feature) => feature.title)).size === features.length,
    { message: "同じアプリ内で feature の title が重複している" },
  );

export const appSchema = z.object({
  /** URL に使う識別子。public/apps/<slug>/ と対応する。 */
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, "lowercase kebab-case で指定する"),
  name: z.string().min(1),
  tagline: z.string().min(1),
  /** シールをつまんだときに出す短い鉛筆メモ。アプリ本文と同じく日本語固定。 */
  stickerNote: z.string().min(1).max(24),

  /** 複数プラットフォーム対応のため配列。少なくとも 1 つ必要。 */
  platforms: z.array(platformSchema).min(1),
  status: statusSchema,
  /** 'YYYY-MM-DD'。未確定なら null にして year を使う。 */
  releaseDate: releaseDateSchema.nullable(),
  year: z.number().int().min(2000).max(2100),

  /** public/apps/<slug>/ からの相対ファイル名。無い場合は iconGlyph を表示する。 */
  icon: z.string().nullable(),
  iconGlyph: z.string().min(1).max(2),
  color: hexColor,
  accent: hexColor,
  featured: z.boolean().default(false),

  category: z.string().min(1),
  description: z.string().min(1),
  features: featuresSchema,
  price: z.string().min(1),
  version: z.string().min(1),

  /** public/apps/<slug>/screenshots/ 配下のファイル名。順序が表示順になる。 */
  screenshots: z.array(z.string().min(1)).default([]),

  appStoreUrl: z.url().nullable(),
  /** 外部サイトで公開しているアプリ用。App Store 以外の導線。 */
  siteUrl: z.url().nullable().default(null),
});

export type App = z.infer<typeof appSchema>;

export const registrySchema = z
  .array(appSchema)
  .refine(
    (apps) => new Set(apps.map((a) => a.slug)).size === apps.length,
    { message: "slug が重複している" },
  );
