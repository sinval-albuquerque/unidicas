import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { CATEGORIAS } from "@/lib/categorias";
import { obterTodasReviews } from "@/lib/reviews";
import { obterTodasMaterias } from "@/lib/materias";

/** Sitemap.xml gerado dinamicamente com todas as rotas do site. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();

  const estaticas: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${base}/materias`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${base}/reviews`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${base}/categorias`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.4, lastModified: now },
    { url: `${base}/contato`, changeFrequency: "monthly", priority: 0.3, lastModified: now },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
    { url: `${base}/termos`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
  ];

  const categorias: MetadataRoute.Sitemap = CATEGORIAS.map((c) => ({
    url: `${base}/categorias/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: now,
  }));

  const comparacoes: MetadataRoute.Sitemap = CATEGORIAS.map((c) => ({
    url: `${base}/categorias/${c.slug}/comparar`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: now,
  }));

  const reviews: MetadataRoute.Sitemap = obterTodasReviews().map((r) => ({
    url: `${base}/reviews/${r.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: now,
  }));

  const materias: MetadataRoute.Sitemap = obterTodasMaterias().map((m) => ({
    url: `${base}/materias/${m.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: now,
  }));

  return [
    ...estaticas,
    ...categorias,
    ...comparacoes,
    ...reviews,
    ...materias,
  ];
}
