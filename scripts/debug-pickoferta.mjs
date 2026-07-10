// Testa a lógica do pickOfertaPrincipal pra ver o que está retornando
// pra matéria kit-mini-band-beneficios

const materia = {
  categoria: "fitness-acessorios",
  titulo: "Kit de 5 Faixas Elásticas Mini Band: Benefícios, Como Usar e Vale a Pena Comprar?",
  slug: "kit-mini-band-beneficios",
};

const reviews = [
  { slug: "bicicleta-ergometrica-sevenfit", titulo: "Bicicleta Ergométrica Sevenfit 6kg — 49% OFF para treinar em casa", produto: "Bicicleta Ergométrica Fitness Sevenfit Cardio e Musculação", categoria: "fitness-acessorios", emDestaque: true, preco: 549 },
  { slug: "bicicleta-spinning-mzy-15kg", titulo: "Bicicleta Spinning MZY 15kg com App — 24% OFF, qualidade profissional", produto: "Bicicleta Ergométrica Spinning MZY Inércia 15kg com App", categoria: "fitness-acessorios", emDestaque: false, preco: 670 },
];
const ofertas = []; // nenhuma oferta de fitness-acessorios

const chave = `${materia.titulo} ${materia.slug}`.toLowerCase();
const keywords = chave
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .split(/[^a-z0-9]+/)
  .filter((k) => k.length >= 4);
console.log("Keywords da materia:", keywords);

const candidates = [
  ...ofertas.map((o) => ({ kind: "oferta", item: o })),
  ...reviews.map((r) => ({ kind: "review", item: r })),
].filter((c) =>
  materia.categoria ? c.item.categoria === materia.categoria : true,
);
console.log("\nCandidates:", candidates.map((c) => `${c.kind}/${c.item.slug} (emDestaque=${c.item.emDestaque})`));

for (const c of candidates) {
  const tituloItem = `${c.item.titulo} ${c.item.produto ?? ""} ${c.item.slug}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const matched = keywords.filter((k) => tituloItem.includes(k));
  console.log(`  ${c.item.slug}: matched keywords = [${matched.join(", ")}]`);
  if (matched.length > 0) {
    console.log(`  -> MATCH (retornaria este item)`);
  }
}
