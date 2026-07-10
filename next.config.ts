import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Necessário para Turbopack compilar next-mdx-remote (workaround oficial).
  // Ver: https://github.com/vercel/next.js/issues/64525
  transpilePackages: ["next-mdx-remote"],
  // Força o Turbopack a usar este diretório como raiz — ignora o
  // `package.json`/`package-lock.json` que existam em diretórios pai
  // (ex.: $HOME) e evita o aviso "inferred your workspace root".
  turbopack: {
    root: path.resolve("."),
  },
  // Permite que <Image> aceite URLs externas (placeholders Unsplash e
  // futuras hospedagens). Imagens em /public são servidas pelo Next
  // automaticamente e não precisam entrar aqui.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
