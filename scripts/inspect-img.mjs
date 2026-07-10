// Lê dimensões de webp via parsing manual do header
import fs from "node:fs";
import path from "node:path";

const dir = "c:\\Users\\Sinval\\Projetos\\unidicas\\public\\reviews";
const files = fs.readdirSync(dir).filter((f) =>
  f.startsWith("kit-mini-band-") ||
  ["bicicleta-ergometrica-sevenfit.webp", "bicicleta-spinning-mzy-15kg.webp", "fone-soundcore-p30i-anker-anc.webp", "fone-xiaomi-redmi-buds-6-play.webp", "fone-dapon-h02d-bluetooth.webp", "smartphone-galaxy-a17-5g-128gb.webp", "furadeira-parafusadeira-the-black-tools.webp", "samsung-galaxy-a36-5g-256gb-oferta.webp", "samsung-galaxy-a56-5g-256gb-oferta.webp"].includes(f)
);

for (const f of files.sort()) {
  const buf = fs.readFileSync(path.join(dir, f));
  // RIFF header: 12 bytes (RIFF + size + WEBP)
  // Then VP8 / VP8L / VP8X / ALPH chunk
  const riff = buf.subarray(0, 4).toString("ascii");
  const size = buf.readUInt32LE(4);
  const webp = buf.subarray(8, 12).toString("ascii");
  if (riff !== "RIFF" || webp !== "WEBP") {
    console.log(`${f.padEnd(50)}  NOT WEBP`);
    continue;
  }
  const chunkType = buf.subarray(12, 16).toString("ascii");
  let w = 0, h = 0;
  if (chunkType === "VP8 ") {
    // lossy: width/height at offset 26/28
    w = buf.readUInt16LE(26) & 0x3fff;
    h = buf.readUInt16LE(28) & 0x3fff;
  } else if (chunkType === "VP8L") {
    // lossless: bits 0..13 of bytes 21..24
    const b1 = buf[21], b2 = buf[22], b3 = buf[23], b4 = buf[24];
    w = 1 + (((b2 & 0x3f) << 8) | b1);
    h = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
  } else if (chunkType === "VP8X") {
    // extended: 24-bit width/height at offset 24/27
    w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
  }
  const ratio = w && h ? (w / h).toFixed(3) : "?";
  const sizeKb = (buf.length / 1024).toFixed(1);
  console.log(`${f.padEnd(50)}  ${String(w).padStart(5)}x${String(h).padEnd(5)}  ratio=${ratio}  (${sizeKb} KB)`);
}
