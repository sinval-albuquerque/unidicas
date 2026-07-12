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
  // Hosts remotos permitidos para <Image>. Imagens em /public são servidas
  // automaticamente e não precisam entrar aqui.
  // Regra: o projeto NÃO usa Unsplash — toda imagem deve ser real
  // (foto do produto no marketplace) ou arquivo local em /public.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
