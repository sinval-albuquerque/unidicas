import type { Categoria, CategoriaSlug } from "@/types/review";

/**
 * Definição central de categorias + atributos comparáveis de cada uma.
 * Adicionar uma categoria aqui a torna disponível em todo o site.
 */
export const CATEGORIAS: Categoria[] = [
  {
    slug: "notebooks",
    nome: "Notebooks",
    descricao: "Notebooks para trabalho, estudo e games.",
    secao: "tecnologia",
    atributos: [
      { id: "memoria", label: "Memória RAM", unidade: "GB", maiorMelhor: true, icone: "💾" },
      { id: "bateria", label: "Bateria", unidade: "h", maiorMelhor: true, icone: "🔋" },
      { id: "processador", label: "Processador (score)", unidade: "pts", maiorMelhor: true, icone: "⚡" },
      { id: "armazenamento", label: "Armazenamento", unidade: "GB", maiorMelhor: true, icone: "💽" },
      { id: "tela", label: "Tela", unidade: "pol", maiorMelhor: true, icone: "🖥️" },
      { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false, icone: "💰" },
    ],
  },
  {
    slug: "celulares",
    nome: "Celulares",
    descricao: "Smartphones Android e iPhone.",
    secao: "tecnologia",
    atributos: [
      { id: "camera", label: "Câmera", unidade: "Mpx", maiorMelhor: true, icone: "📷" },
      { id: "bateria", label: "Bateria", unidade: "mAh", maiorMelhor: true, icone: "🔋" },
      { id: "processador", label: "Processador (score)", unidade: "pts", maiorMelhor: true, icone: "⚡" },
      { id: "tela", label: "Tela", unidade: "pol", maiorMelhor: true, icone: "📱" },
      { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false, icone: "💰" },
    ],
  },
  {
    slug: "fones",
    nome: "Fones de Ouvido",
    descricao: "Fones bluetooth e com fio.",
    secao: "tecnologia",
    atributos: [
      { id: "bateria", label: "Bateria", unidade: "h", maiorMelhor: true, icone: "🔋" },
      { id: "anc", label: "Cancelamento de ruído", unidade: "pts", maiorMelhor: true, icone: "🔇" },
      { id: "som", label: "Qualidade de som", unidade: "pts", maiorMelhor: true, icone: "🎵" },
      { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false, icone: "💰" },
    ],
  },
  {
    slug: "air-fryers",
    nome: "Air Fryers",
    descricao: "Fritadeiras sem óleo.",
    secao: "kits",
    atributos: [
      { id: "capacidade", label: "Capacidade", unidade: "L", maiorMelhor: true, icone: "🛢️" },
      { id: "potencia", label: "Potência", unidade: "W", maiorMelhor: true, icone: "⚡" },
      { id: "funcoes", label: "Funções pré-programadas", unidade: "qtd", maiorMelhor: true, icone: "🎛️" },
      { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false, icone: "💰" },
    ],
  },
  {
    slug: "smartwatches",
    nome: "Smartwatches",
    descricao: "Relógios inteligentes e esportivos.",
    secao: "tecnologia",
    atributos: [
      { id: "bateria", label: "Bateria", unidade: "dias", maiorMelhor: true, icone: "🔋" },
      { id: "gps", label: "Precisão GPS", unidade: "pts", maiorMelhor: true, icone: "🛰️" },
      { id: "resistencia", label: "Resistência à água", unidade: "pts", maiorMelhor: true, icone: "💧" },
      { id: "tela", label: "Tela", unidade: "pol", maiorMelhor: true, icone: "⌚" },
      { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false, icone: "💰" },
    ],
  },
  {
    slug: "fitness-acessorios",
    nome: "Acessórios de Fitness",
    descricao: "Faixas elásticas, mini bands, halteres, colchonetes e acessórios para treino em casa e na academia.",
    secao: "esportes-e-fitness",
    atributos: [
      { id: "resistencia", label: "Níveis de resistência", unidade: "qtd", maiorMelhor: true, icone: "💪" },
      { id: "material", label: "Qualidade do material", unidade: "pts", maiorMelhor: true, icone: "🧱" },
      { id: "versatilidade", label: "Versatilidade de uso", unidade: "pts", maiorMelhor: true, icone: "🔄" },
      { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false, icone: "💰" },
    ],
  },
  {
    slug: "ferramentas",
    nome: "Ferramentas",
    descricao: "Furadeiras, parafusadeiras, serras, chaves e ferramentas elétricas e manuais para obra, reforma e trabalho.",
    secao: "ferramentas-de-construcao",
    atributos: [
      { id: "potencia", label: "Potência", unidade: "W", maiorMelhor: true, icone: "⚡" },
      { id: "velocidade", label: "Velocidade", unidade: "rpm", maiorMelhor: true, icone: "🔄" },
      { id: "torque", label: "Torque", unidade: "Nm", maiorMelhor: true, icone: "💪" },
      { id: "peso", label: "Peso", unidade: "kg", maiorMelhor: false, icone: "⚖️" },
      { id: "preco", label: "Preço", unidade: "R$", maiorMelhor: false, icone: "💰" },
    ],
  },
];

/** Mapa slug -> Categoria para acesso O(1). */
export const CATEGORIA_POR_SLUG: Record<CategoriaSlug, Categoria> =
  Object.fromEntries(CATEGORIAS.map((c) => [c.slug, c]));

/** Retorna a categoria pelo slug ou undefined. */
export function obterCategoria(slug: CategoriaSlug): Categoria | undefined {
  return CATEGORIA_POR_SLUG[slug];
}

/** Lista de slugs válidos (para validação de rotas dinâmicas). */
export const SLUGS_VALIDOS: CategoriaSlug[] = CATEGORIAS.map((c) => c.slug);