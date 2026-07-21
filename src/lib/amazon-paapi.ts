/**
 * Cliente Amazon Product Advertising API (PA-API) v5.
 *
 * Busca preços ao vivo de produtos Amazon usando a API oficial.
 * Requer AWS Signature v4 para autenticação.
 *
 * Uso (SSR, não client):
 *   import { obterPrecosAmazon } from "@/lib/amazon-paapi";
 *   const precos = await obterPrecosAmazon(["B0CCZ26B5K", "B0B1C2D3E4"]);
 *   // precos.get("B0CCZ26B5K") → { preco: 279, precoOriginal: 465 }
 *
 * Docs: https://webservices.amazon.com/paapi5/documentation/
 */

export interface PrecoAmazon {
  preco: number;
  precoOriginal: number | null;
}

// =====================================================================
// CONSTANTES
// =====================================================================

const AMAZON_ENDPOINT = "webservices.amazon.com.br";
const AMAZON_REGION = "us-east-1";
const SERVICE = "ProductAdvertisingAPI";
const CONTENT_TYPE = "application/json; charset=UTF-8";

// =====================================================================
// HELPER: HMAC / SHA256 (Node.js 18+ Web Crypto)
// =====================================================================

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(str: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str),
  );
  return bytesToHex(new Uint8Array(hash));
}

async function hmacSha256(key: Uint8Array, str: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(str)),
  );
}

async function hmacSha256Hex(key: Uint8Array, str: string): Promise<string> {
  return bytesToHex(await hmacSha256(key, str));
}

async function getSignatureKey(
  key: string,
  date: string,
  region: string,
  service: string,
): Promise<Uint8Array> {
  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${key}`), date);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return await hmacSha256(kService, "aws4_request");
}

// =====================================================================
// AWS SIGNATURE v4
// =====================================================================

async function buildHeaders(
  method: string,
  host: string,
  path: string,
  payload: string,
  accessKey: string,
  secretKey: string,
): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);

  const payloadHash = await sha256(payload);

  const canonicalHeaders = [
    `content-type:${CONTENT_TYPE}`,
    `host:${host}`,
    `x-amz-date:${amzDate}`,
  ].join("\n");

  const signedHeaders = "content-type;host;x-amz-date";

  const canonicalRequest = [
    method,
    path,
    "",
    canonicalHeaders,
    "",
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${date}/${AMAZON_REGION}/${SERVICE}/aws4_request`;

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  const signingKey = await getSignatureKey(
    secretKey,
    date,
    AMAZON_REGION,
    SERVICE,
  );
  const signature = await hmacSha256Hex(signingKey, stringToSign);

  const authorizationHeader = [
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  return {
    "content-type": CONTENT_TYPE,
    "x-amz-date": amzDate,
    authorization: authorizationHeader,
  };
}

// =====================================================================
// PAYLOAD
// =====================================================================

function buildPayload(asins: string[], tag: string): string {
  return JSON.stringify({
    ItemIds: asins,
    Resources: [
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
    ],
    PartnerTag: tag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.com.br",
  });
}

// =====================================================================
// PARSER
// =====================================================================

interface ItemResult {
  ItemsResult?: {
    Items?: Array<{
      ASIN: string;
      Offers?: {
        Listings?: Array<{
          Price?: { Amount?: number };
          SavingBasis?: { Amount?: number };
        }>;
      };
    }>;
  };
}

function parsePrecos(
  data: ItemResult,
  asins: string[],
): Map<string, PrecoAmazon> {
  const resultado = new Map<string, PrecoAmazon>();

  if (!data?.ItemsResult?.Items) return resultado;

  for (const item of data.ItemsResult.Items) {
    const asin = item.ASIN;
    if (!asin || !asins.includes(asin)) continue;

    const listings = item.Offers?.Listings;
    if (!listings || listings.length === 0) continue;

    const listing = listings[0];
    const priceAmount = listing.Price?.Amount;
    const savingAmount = listing.SavingBasis?.Amount;

    if (priceAmount == null) continue;

    const preco = Math.round(Number(priceAmount));
    const precoOriginal =
      savingAmount != null
        ? Math.round(preco + Number(savingAmount))
        : null;

    resultado.set(asin, { preco, precoOriginal });
  }

  return resultado;
}

// =====================================================================
// FUNÇÃO PRINCIPAL
// =====================================================================

/**
 * Busca preços atualizados de ASINs via Amazon PA-API.
 *
 * Requer env vars:
 *  - AMAZON_ACCESS_KEY
 *  - AMAZON_SECRET_KEY
 *  - AMAZON_ASSOCIATE_TAG
 *
 * Se as env vars não existirem, retorna Map vazio (fallback silencioso).
 *
 * @param asins Lista de ASINs para buscar (máx. 10 por chamada — limite da PA-API)
 * @returns Map<asin, PrecoAmazon>
 */
export async function obterPrecosAmazon(
  asins: string[],
): Promise<Map<string, PrecoAmazon>> {
  const resultado = new Map<string, PrecoAmazon>();
  if (asins.length === 0) return resultado;

  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const tag = process.env.AMAZON_ASSOCIATE_TAG;

  if (!accessKey || !secretKey || !tag) {
    console.warn(
      "[amazon-paapi] Env vars AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY e/ou AMAZON_ASSOCIATE_TAG não configuradas — pulando verificação de preços Amazon.",
    );
    return resultado;
  }

  // PA-API aceita até 10 ASINs por chamada
  const batches: string[][] = [];
  for (let i = 0; i < asins.length; i += 10) {
    batches.push(asins.slice(i, i + 10));
  }

  for (const batch of batches) {
    const payload = buildPayload(batch, tag);
    const path = "/paapi5/getitems";

    try {
      const headers = await buildHeaders(
        "POST",
        AMAZON_ENDPOINT,
        path,
        payload,
        accessKey,
        secretKey,
      );

      const res = await fetch(`https://${AMAZON_ENDPOINT}${path}`, {
        method: "POST",
        headers,
        body: payload,
        next: { revalidate: 600 },
      });

      if (!res.ok) {
        const text = await res.text();
        console.debug(
          `[amazon-paapi] HTTP ${res.status} para batch ${batch.join(",")}: ${text.slice(0, 200)}`,
        );
        continue;
      }

      const data = await res.json();
      const parsed = parsePrecos(data, batch);
      for (const [asin, preco] of parsed) {
        resultado.set(asin, preco);
      }

      // Rate limit: 1 request por segundo
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    } catch (err) {
      console.warn(
        `[amazon-paapi] Erro ao buscar batch ${batch.join(",")}:`,
        err,
      );
    }
  }

  return resultado;
}
