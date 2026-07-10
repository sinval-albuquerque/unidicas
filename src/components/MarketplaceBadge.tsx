"use client";

/**
 * Badge visual do marketplace com logo + cor característica.
 * Detecta automaticamente pelo nome (Mercado Livre, Amazon, Shopee, Magalu, AliExpress)
 * ou pelo host do linkAfiliado (mercadolivre.com.br, amazon.com.br, etc).
 */

export type MarketplaceSlug =
  | "mercadolivre"
  | "amazon"
  | "shopee"
  | "magalu"
  | "aliexpress";

interface MarketplaceInfo {
  slug: MarketplaceSlug;
  nome: string;
  cor: string;
  /** SVG inline em string (path/shape). */
  logo: React.ReactNode;
  /** URL para a home do marketplace (link externo opcional). */
  url: string;
}

const SVG_PROPS = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
} as const;

function LogoMercadoLivre() {
  return (
    <svg {...SVG_PROPS} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z" />
    </svg>
  );
}

function LogoAmazon() {
  return (
    <svg {...SVG_PROPS} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.5 16.5c.4.5 1 .9 1.7 1 .2 0 .4 0 .6-.1-.2-.4-.3-.8-.3-1.3 0-.3 0-.6.1-.8-.4-.1-.8-.3-1.1-.5-1.5-1.2-1.7-3.1-1-4.5 0 .1.1.1.1.2.4 1.1 1.4 2 2.4 2.4 0 0 .1 0 .1.1.1.1.1.2.2.2v.1c-.1.2-.2.4-.3.6-.3.5-.5 1.1-.2 1.6.2.4.6.5.9.4 0 .1 0 .1.1.2zm8-2.4c-.7 0-1.4.1-2 .4-.6.3-1 .6-1.2 1.1l1.2.5c.2-.3.5-.5.9-.6.4-.1.8 0 1 .2.3.2.4.5.4.9v.2c-.2 0-.5-.1-.9-.1-.9 0-1.7.2-2.3.7-.6.5-.9 1.1-.9 1.8 0 1 .3 1.8 1 2.2.5.3 1.1.4 1.8.4.7 0 1.4-.1 1.9-.5.5-.3.9-.8 1-1.5.1-.6.1-1.1.1-1.7V17c0-.7 0-1.4-.2-1.9-.1-.5-.4-.9-.8-1.1-.4-.1-.9-.2-1.5-.2-.1.1-.3.1-.5.1zm-.2 4.5c-.5 0-.9-.1-1.1-.4-.2-.2-.3-.6-.3-1 0-.4.1-.7.4-.9.2-.2.6-.3 1-.3.4 0 .7 0 1 .1v2.4c-.3.1-.7.1-1 .1zm-4.5-1.4c0 .7-.2 1.3-.7 1.6-.5.3-1.2.5-2 .5-.4 0-.8 0-1.1-.1-.3-.1-.7-.2-1-.4l.2-1c.3.1.6.2 1 .3.4.1.7.1 1.1.1.3 0 .6-.1.7-.2.2-.1.3-.3.3-.6 0-.3-.1-.5-.4-.6-.2-.1-.6-.3-1.1-.4-.6-.1-1-.3-1.4-.5-.4-.2-.7-.4-.9-.7-.2-.3-.3-.6-.3-1 0-.4.1-.7.3-1 .2-.3.5-.5.8-.7.4-.2.8-.2 1.3-.2.4 0 .7 0 1.1.1.3.1.6.1.9.2l-.2 1c-.2-.1-.5-.1-.8-.2-.3 0-.6-.1-.9-.1-.3 0-.5.1-.7.2-.2.1-.2.3-.2.5 0 .3.1.5.4.6.2.1.6.3 1.1.4.5.2 1 .3 1.3.5.4.2.6.4.8.6.2.3.3.6.3 1zm13.6-3.4c-.5 0-1 .2-1.4.5-.4.3-.6.7-.6 1.3v3.6h-1.4v-5.7h1.4v.9c.2-.3.5-.6.8-.8.3-.2.7-.3 1.1-.3.5 0 1 .1 1.3.4.3.3.5.7.5 1.3v4.2h-1.4v-3.9c0-.5-.1-.8-.3-1-.2-.2-.5-.3-.9-.3zm-5.5 0c-.4 0-.8.1-1.1.3-.3.2-.5.4-.7.7v-.9h-1.4v5.7h1.4v-3c0-.3.1-.6.2-.9.1-.3.3-.5.5-.6.2-.2.5-.2.8-.2.2 0 .3 0 .5.1l.1-1.1c-.1-.1-.2-.1-.3-.1z" />
    </svg>
  );
}

function LogoShopee() {
  return (
    <svg {...SVG_PROPS} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 6.5c-.2-1.4-1-2.4-2.3-2.7-.6-.2-1.4-.2-2.2-.1-.1-.9-.6-1.7-1.3-2.1C15.5 1.2 14.6 1 13.7 1c-.9 0-1.7.2-2.4.5-.5.2-1 .6-1.3 1-.2-.1-.5-.2-.7-.2-.6-.1-1.2 0-1.7.3-.5.3-.8.7-.9 1.3 0 .2 0 .4.1.6 0 .1 0 .1.1.2 0 .1.1.2.1.2 0 .1 0 .1.1.2-.3.1-.5.3-.7.5-.4.4-.6.9-.6 1.5 0 .4.1.8.2 1.1.2.4.4.7.7 1 .3.3.6.5 1 .6.1 0 .2.1.3.1-.1.1-.2.2-.3.4-.2.2-.3.5-.4.7 0 .1-.1.2-.1.3v.1c0 .1 0 .1.1.2 0 .1.1.1.1.2 0 0 .1.1.1.1 0 .1.1.1.2.2 0 0 .1 0 .1.1.1 0 .1.1.2.1h.1c.1 0 .1 0 .2.1.1 0 .2.1.2.1h.4c.1 0 .2 0 .3.1.1 0 .2 0 .3.1h.2c.1 0 .2 0 .3-.1.1 0 .2-.1.3-.1.1 0 .2-.1.3-.2.1-.1.2-.1.3-.2.1-.1.2-.2.3-.3l.3-.3.2-.2.1-.1.1-.1c0-.1.1-.1.1-.2.1-.1.1-.2.2-.3.1-.1.1-.2.2-.4 0-.1.1-.2.1-.3.1-.1.1-.2.1-.3 0-.1.1-.2.1-.3v-2.6c.5-.1.9-.2 1.3-.5.5-.4.8-.9.9-1.5.1-.3.1-.6.1-.9zm-12.2-.7c0-.4.2-.8.5-1 .3-.2.7-.3 1.1-.3.4 0 .8.1 1.1.3.3.2.5.5.5.9 0 .4-.2.7-.5 1-.3.2-.7.3-1.1.3-.4 0-.8-.1-1.1-.3-.3-.3-.5-.6-.5-.9zm7.1 5.5c-.5.5-1.2.8-2.1.8-.5 0-1-.1-1.4-.3-.4-.2-.7-.5-1-.8-.2-.3-.4-.7-.5-1.1 0-.1 0-.2-.1-.3v-.2c0-.2.1-.4.2-.6.1-.2.3-.4.4-.5.4-.3.8-.5 1.3-.6.4-.1.7-.1 1.1-.1.4 0 .7.1 1.1.2.3.1.6.3.8.5.2.2.3.4.4.7.1.2.1.5.1.7 0 .4-.1.8-.3 1.1-.2.3-.5.5-.9.5z" />
    </svg>
  );
}

function LogoMagalu() {
  return (
    <svg {...SVG_PROPS} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 4v16h18V4H3zm2 2h14v12H5V6zm2 2v8h2V8H7zm4 0v8h2V8h-2zm4 0v8h2V8h-2z" />
    </svg>
  );
}

function LogoAliExpress() {
  return (
    <svg {...SVG_PROPS} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 2c1.3 0 2.5.4 3.6 1H8.4c1.1-.6 2.3-1 3.6-1zM6 7h12v1H6V7zm0 3h12v1H6v-1zm0 3h12v1H6v-1zm0 3h12v1H6v-1z" />
    </svg>
  );
}

const MARKETPLACES: Record<string, MarketplaceInfo> = {
  mercadolivre: {
    slug: "mercadolivre",
    nome: "Mercado Livre",
    cor: "#FFE600",
    logo: <LogoMercadoLivre />,
    url: "https://www.mercadolivre.com.br",
  },
  amazon: {
    slug: "amazon",
    nome: "Amazon",
    cor: "#FF9900",
    logo: <LogoAmazon />,
    url: "https://www.amazon.com.br",
  },
  shopee: {
    slug: "shopee",
    nome: "Shopee",
    cor: "#EE4D2D",
    logo: <LogoShopee />,
    url: "https://shopee.com.br",
  },
  magalu: {
    slug: "magalu",
    nome: "Magazine Luiza",
    cor: "#0050E0",
    logo: <LogoMagalu />,
    url: "https://www.magazineluiza.com.br",
  },
  aliexpress: {
    slug: "aliexpress",
    nome: "AliExpress",
    cor: "#FF4747",
    logo: <LogoAliExpress />,
    url: "https://pt.aliexpress.com",
  },
};

/** Detecta marketplace pelo nome (frontmatter) ou pelo host do link. */
export function detectarMarketplace(
  nome: string | undefined,
  link: string | undefined,
): MarketplaceInfo {
  const lower = (nome ?? "").toLowerCase();
  if (lower.includes("mercado livre") || lower.includes("mercadolivre") || lower === "ml") {
    return MARKETPLACES.mercadolivre;
  }
  if (lower.includes("amazon")) {
    return MARKETPLACES.amazon;
  }
  if (lower.includes("shopee")) {
    return MARKETPLACES.shopee;
  }
  if (lower.includes("magazine") || lower.includes("magalu") || lower.includes("luiza")) {
    return MARKETPLACES.magalu;
  }
  if (lower.includes("aliexpress") || lower.includes("ali express")) {
    return MARKETPLACES.aliexpress;
  }
  // tenta pelo host do link
  if (link) {
    if (link.includes("mercadolivre.com")) return MARKETPLACES.mercadolivre;
    if (link.includes("amazon.")) return MARKETPLACES.amazon;
    if (link.includes("shopee.")) return MARKETPLACES.shopee;
    if (link.includes("magazineluiza.") || link.includes("magalu.")) return MARKETPLACES.magalu;
    if (link.includes("aliexpress.")) return MARKETPLACES.aliexpress;
  }
  // fallback
  return {
    slug: "mercadolivre",
    nome: nome ?? "Mercado Livre",
    cor: "#FFE600",
    logo: <LogoMercadoLivre />,
    url: "https://www.mercadolivre.com.br",
  };
}

interface MarketplaceBadgeProps {
  nome: string;
  link?: string;
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md";
  showName?: boolean;
  asLink?: boolean;
}

/** Badge visual de marketplace (logo + nome + cor característica). */
export function MarketplaceBadge({
  nome,
  link,
  variant = "soft",
  size = "sm",
  showName = true,
  asLink = false,
}: MarketplaceBadgeProps) {
  const info = detectarMarketplace(nome, link);

  const sizes = {
    sm: { padding: "px-2 py-0.5", text: "text-[0.65rem]", icon: 12 },
    md: { padding: "px-2.5 py-1", text: "text-xs", icon: 14 },
  } as const;
  const s = sizes[size];

  const variants = {
    solid: {
      backgroundColor: info.cor,
      color: info.slug === "mercadolivre" ? "#000" : "#fff",
    },
    soft: {
      backgroundColor: info.cor + "1A",
      color: info.slug === "mercadolivre" ? "#997a00" : info.cor,
    },
    outline: {
      backgroundColor: "transparent",
      color: info.slug === "mercadolivre" ? "#997a00" : info.cor,
      borderColor: info.cor,
    },
  } as const;
  const v = variants[variant];

  const Tag = asLink ? "a" : "span";
  const tagProps = asLink
    ? {
        href: link ?? info.url,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Tag
      {...tagProps}
      className={`inline-flex items-center gap-1 ${s.padding} ${s.text} font-bold rounded uppercase tracking-wider ${
        asLink ? "no-underline hover:opacity-80 transition cursor-pointer" : ""
      }`}
      style={{
        ...v,
        borderWidth: variant === "outline" ? "1px" : 0,
        borderStyle: variant === "outline" ? "solid" : "none",
      }}
      title={info.nome}
      aria-label={info.nome}
    >
      <span style={{ display: "inline-flex", width: s.icon, height: s.icon }}>
        {info.logo}
      </span>
      {showName && <span>{info.nome}</span>}
    </Tag>
  );
}
