import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

interface LogoProps {
  /** Altura do logo em pixels. Largura é proporcional (2.15:1). */
  size?: number;
  /** Prioridade de carregamento (true para header — LCP). */
  priority?: boolean;
  /** Classes extras para o container. */
  className?: string;
}

/**
 * Logo oficial do Unidicas — usa /brand/logo.png (com fundo transparente e
 * proporção ~2.15:1) via next/image.
 * - Versão WebP em /brand/logo.webp (~164 KB) e PNG em /brand/logo.png
 *  (~799 KB) ficam disponíveis; next/image escolhe o melhor formato.
 * - Lazy load por padrão; priority=true no Header para LCP.
 *
 * Para trocar a logo: salve um PNG em public/brand/logo.png.
 *  Recomendado: imagem com fundo transparente, proporção 2.15:1 e
 *  ~280px de altura para qualidade retina sem inflar o bundle.
 */
export function Logo({ size = 28, priority = false, className = "" }: LogoProps) {
  // Proporção aproximada do logo (~2.15:1)
  const width = Math.round(size * 2.15);

  return (
    <Link
      href="/"
      className={`inline-flex items-center no-underline shrink-0 ${className}`}
      aria-label={SITE_NAME}
      style={{ height: size }}
    >
      <Image
        src="/brand/logo.png"
        alt={SITE_NAME}
        width={width}
        height={size}
        priority={priority}
        quality={90}
        className="block h-full w-auto"
        style={{ height: size, width: "auto" }}
        sizes={`${width}px`}
      />
    </Link>
  );
}
