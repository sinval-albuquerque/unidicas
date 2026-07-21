import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

interface LogoProps {
  /** Altura do logo em pixels. Largura é proporcional. */
  size?: number;
  /** Prioridade de carregamento (true para header — LCP). */
  priority?: boolean;
  /** Classes extras para o container. */
  className?: string;
  /**
   * Proporção do logo. Default: 1 (quadrado — Logotipo unidicas.png é
   * 2000x2000). Para o wordmark horizontal (mais raro), usar 2.15.
   */
  aspectRatio?: number;
}

/**
 * Logo oficial do Unidicas — usa /brand/logo.png via next/image.
 *
 * - Lazy load por padrão; priority=true no Header para LCP.
 * - Para trocar a logo: salve um PNG em public/brand/logo.png.
 *  Recomendado: imagem quadrada (1:1) com fundo transparente,
 *  ~2000px de lado para qualidade retina.
 */
export function Logo({
  size = 48,
  priority = false,
  className = "",
  aspectRatio = 1,
}: LogoProps) {
  const width = Math.round(size * aspectRatio);

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
