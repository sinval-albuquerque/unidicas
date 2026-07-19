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
  // Redirects 301 — preservam SEO e mandam tráfego órfão para a index.
  // Adicione aqui matérias removidas para que links antigos não virem 404.
  async redirects() {
    return [
      {
        source: "/materias/fone-bluetooth-anc-e-bom",
        destination: "/materias",
        permanent: true,
      },
      {
        source: "/materias/melhor-notebook-home-office-2026",
        destination: "/materias",
        permanent: true,
      },
      {
        source: "/materias/air-fryer-vale-a-pena",
        destination: "/materias",
        permanent: true,
      },
      {
        source: "/materias/fone-para-ansiedade-foco",
        destination: "/materias",
        permanent: true,
      },
      {
        source: "/materias/air-fryer-entrega-rapida-frete-gratis",
        destination: "/materias",
        permanent: true,
      },
      {
        source: "/materias/notebook-para-estudantes",
        destination: "/materias",
        permanent: true,
      },
    ];
  },
  // Hosts remotos permitidos para <Image>. Imagens em /public são servidas
  // automaticamente e não precisam entrar aqui.
  // Regra: o projeto NÃO usa Unsplash — toda imagem deve ser real
  // (foto do produto no marketplace) ou arquivo local em /public.
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
    ],
  },
};

export default nextConfig;
