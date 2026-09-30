/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages のドメインルートで配信する静的サイト。
  output: "export",
  // 静的出力では Next.js の画像最適化サーバーが動かないため無効化する。
  images: { unoptimized: true },
  // ディレクトリ URL を index.html へ解決させる。
  trailingSlash: true,
  reactStrictMode: true,
  // 親ディレクトリに他プロジェクトがあるため、root 推論を明示して警告を防ぐ。
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
