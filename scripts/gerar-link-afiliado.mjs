#!/usr/bin/env node
/**
 * Gera link de afiliado do Mercado Livre automaticamente.
 *
 * Aceita tanto URL canônica quanto meli.la encurtado.
 * Se for meli.la, resolve o redirect automaticamente.
 *
 * Uso:
 *   node scripts/gerar-link-afiliado.mjs "https://www.mercadolivre.com.br/.../p/MLB..."
 *   node scripts/gerar-link-afiliado.mjs "https://meli.la/2EHukNx"
 *   node scripts/gerar-link-afiliado.mjs    # modo interativo
 */

const MATT_WORD = "unidicasofertas";
const PID = "unidicasofertas";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function resolverMeliLa(url) {
  // Faz uma requisição HEAD (ou GET) e segue o redirect
  const res = await fetch(url, {
    method: "HEAD",
    redirect: "manual",
    headers: { "User-Agent": UA },
  });
  // O meli.la redireciona com 302 e Location
  const location = res.headers.get("location");
  if (location) {
    // Pode ser relativo ou absoluto
    try {
      return new URL(location, url).toString();
    } catch {
      return location;
    }
  }
  // Se não veio location, tenta GET normal (pode ter redirecionado automático)
  const res2 = await fetch(url, {
    headers: { "User-Agent": UA },
    redirect: "follow",
  });
  return res2.url;
}

function limparTracking(url) {
  // Remove params de tracking que o ML injeta (pdp_filters, polycard_*, etc.)
  try {
    const u = new URL(url);
    const TRACKING = [
      "pdp_filters", "polycard_client", "polycard_client_id", "polycard_position",
      "c_element_order", "c_id", "c_label", "c_container_id", "c_global_position",
      "c_element_id", "c_tracking_id", "c_campaign", "c_uid", "deal_print_id",
      "tracking_id", "position", "wid", "sid", "V", "L", "matt_tool",
      "forceInApp", "ref", "ar", "s", "matt_word", "pid",
    ];
    for (const k of TRACKING) u.searchParams.delete(k);
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

function gerarLinkAfiliado(url) {
  // Primeiro limpa qualquer tracking existente
  const limpa = limparTracking(url);
  const u = new URL(limpa);
  u.searchParams.set("matt_word", MATT_WORD);
  u.searchParams.set("pid", PID);
  return u.toString();
}

async function main() {
  let urlInput = process.argv[2];

  if (!urlInput) {
    // Modo interativo
    const readline = await import("node:readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    urlInput = await new Promise((resolve) => {
      rl.question("📎  Cole a URL do produto no ML: ", resolve);
    });
    rl.close();
  }

  urlInput = urlInput.trim();

  try {
    let urlCanonica;

    if (urlInput.includes("meli.la")) {
      process.stdout.write("🔍  Resolvendo meli.la... ");
      urlCanonica = await resolverMeliLa(urlInput);
      console.log("OK");
    } else if (
      urlInput.includes("mercadolivre") &&
      urlInput.includes("/p/MLB")
    ) {
      urlCanonica = urlInput;
    } else {
      console.log(
        "⚠️  URL não reconhecida. Tenta mesmo assim? Pode não funcionar.",
      );
      urlCanonica = urlInput;
    }

    const link = gerarLinkAfiliado(urlCanonica);

    console.log("\n📋  Link de afiliado:\n");
    console.log(`  ${link}`);
    console.log("\n✅  Copiado para a área de transferência!");

    // Tenta copiar pra clipboard (Windows)
    try {
      const { execSync } = await import("node:child_process");
      execSync(`Set-Clipboard -Value '${link.replace(/'/g, "''")}'`, {
        shell: "powershell",
      });
      console.log("📋  Copiado para a área de transferência!");
    } catch {
      // clipboard não disponível
    }
  } catch (err) {
    console.error(`\n❌  Erro: ${err.message}`);
    process.exit(1);
  }
}

main();
