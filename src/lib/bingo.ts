/** Built-in streamer / chat bingo phrases. */
export const DEFAULT_PHRASES: readonly string[] = [
  'Erster!',
  'Pog',
  'LUL',
  'KEKW',
  'Mods?',
  'F in the chat',
  'Clip it',
  'Hype!',
  'Chat meltdown',
  'Technische Probleme',
  'Backseating',
  'Donation',
  'Raid!',
  'Emote-Spam',
  '„Ist das live?“',
  'Alte Memes',
  'Schlechte Witze',
  'AFK-Alarm',
  '„Wer ist das?“',
  'Sub-Hype',
  'GG',
  'Rage-Quit (fast)',
  'Uncut-Chaos',
  '„Only in chat“',
  'Bingo-Call',
  'Stream-Delay',
  '„Das war geplant“',
  'Kaffee / Energy',
  'Pet cam',
  '„Nächstes Mal besser“',
  'Random Trivia',
  'Meta-Talk',
  'Sponsor-Segway',
  '„Kurze Pause“',
  'Highlight-Moment',
  'Chat-Raid incoming',
];

export type BingoConfig = {
  title: string;
  size: number;
  freeCenter: boolean;
  phrases: string[];
  seed?: string;
};

export type BingoCell = {
  id: number;
  text: string;
  free: boolean;
};

export const DEFAULT_CONFIG: BingoConfig = {
  title: 'Stream Bingo',
  size: 5,
  freeCenter: true,
  phrases: [...DEFAULT_PHRASES],
};

export function clampSize(n: number): number {
  return Math.min(7, Math.max(3, Math.floor(n) || 5));
}

export function neededCells(size: number, freeCenter: boolean): number {
  const total = size * size;
  return freeCenter && size % 2 === 1 ? total - 1 : total;
}

export function parsePhrases(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function samePhrases(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.trim() !== b[i]!.trim()) return false;
  }
  return true;
}

/** FNV-1a-ish string hash → uint32 seed. */
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function buildBoard(config: BingoConfig): BingoCell[] {
  const size = clampSize(config.size);
  const freeCenter = config.freeCenter;
  const total = size * size;
  const need = neededCells(size, freeCenter);
  const rng = config.seed ? mulberry32(hashSeed(config.seed)) : Math.random;

  let pool = config.phrases.map((p) => p.trim()).filter(Boolean);
  if (pool.length === 0) pool = [...DEFAULT_PHRASES];

  const picked: string[] = [];
  const shuffled = shuffle(pool, rng);
  for (let i = 0; i < need; i++) {
    picked.push(shuffled[i % shuffled.length]!);
  }
  const texts = shuffle(picked, rng);

  const center = freeCenter && size % 2 === 1 ? Math.floor(total / 2) : -1;
  const cells: BingoCell[] = [];
  let ti = 0;

  for (let i = 0; i < total; i++) {
    if (i === center) {
      cells.push({ id: i, text: 'FREE', free: true });
    } else {
      cells.push({ id: i, text: texts[ti++] ?? '?', free: false });
    }
  }

  return cells;
}

/** Rows, columns, both diagonals. Returns winning indices or null. */
export function findWin(marked: readonly boolean[], size: number): number[] | null {
  for (let r = 0; r < size; r++) {
    const line = Array.from({ length: size }, (_, c) => r * size + c);
    if (line.every((i) => marked[i])) return line;
  }
  for (let c = 0; c < size; c++) {
    const line = Array.from({ length: size }, (_, r) => r * size + c);
    if (line.every((i) => marked[i])) return line;
  }
  {
    const line = Array.from({ length: size }, (_, i) => i * size + i);
    if (line.every((i) => marked[i])) return line;
  }
  {
    const line = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i));
    if (line.every((i) => marked[i])) return line;
  }
  return null;
}

// ── Share tokens ────────────────────────────────────────────────────────────
// Format:
//   3.<base64url>  deflate-raw(pack)
//   2.<base64url>  pack (no compression)
//   legacy         base64url(JSON {t,s,f,p,seed})
//
// pack = size \0 free(0|1) \0 title? \0 seed? \0 phrases(\n)?
// Defaults (title, phrases) are omitted to keep common links tiny.

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 =
    typeof btoa !== 'undefined' ? btoa(bin) : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(encoded: string): Uint8Array {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  if (typeof atob !== 'undefined') {
    const bin = atob(b64 + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64 + pad, 'base64'));
}

function utf8Encode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function packConfig(config: BingoConfig): string {
  const size = clampSize(config.size);
  const free = config.freeCenter ? '1' : '0';
  const title =
    config.title && config.title !== DEFAULT_CONFIG.title ? config.title.slice(0, 80) : '';
  const seed = config.seed?.trim() || '';
  const phrases = samePhrases(config.phrases, DEFAULT_PHRASES)
    ? ''
    : config.phrases.map((p) => p.trim()).filter(Boolean).join('\n');
  return [String(size), free, title, seed, phrases].join('\0');
}

export function unpackConfig(raw: string): BingoConfig | null {
  try {
    const parts = raw.split('\0');
    if (parts.length < 2) return null;
    const size = clampSize(Number(parts[0]) || 5);
    const freeCenter = parts[1] !== '0';
    const title = (parts[2] || DEFAULT_CONFIG.title).slice(0, 80) || DEFAULT_CONFIG.title;
    const seed = parts[3]?.trim() || undefined;
    const phraseBlock = parts[4] ?? '';
    const phrases = phraseBlock
      ? phraseBlock.split('\n').map((p) => p.trim()).filter(Boolean)
      : [...DEFAULT_PHRASES];
    return {
      title,
      size,
      freeCenter,
      phrases: phrases.length ? phrases : [...DEFAULT_PHRASES],
      seed,
    };
  } catch {
    return null;
  }
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes as BlobPart])
      .stream()
      .pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([bytes as BlobPart])
      .stream()
      .pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

/** Encode config → short share token (`3.…` or `2.…`). */
export async function encodeConfig(config: BingoConfig): Promise<string> {
  const packed = packConfig(config);
  const raw = utf8Encode(packed);
  const compressed = await deflateRaw(raw);
  if (compressed && compressed.length < raw.length) {
    return '3.' + bytesToBase64Url(compressed);
  }
  return '2.' + bytesToBase64Url(raw);
}

export function encodeConfigSync(config: BingoConfig): string {
  return '2.' + bytesToBase64Url(utf8Encode(packConfig(config)));
}

/** Decode share token (v3 / v2 / legacy JSON). */
export async function decodeConfig(encoded: string): Promise<BingoConfig | null> {
  const token = encoded.trim();
  if (!token) return null;

  try {
    if (token.startsWith('3.')) {
      const inflated = await inflateRaw(base64UrlToBytes(token.slice(2)));
      if (!inflated) return null;
      return unpackConfig(utf8Decode(inflated));
    }
    if (token.startsWith('2.')) {
      return unpackConfig(utf8Decode(base64UrlToBytes(token.slice(2))));
    }
    return decodeLegacyConfig(token);
  } catch {
    return null;
  }
}

function decodeLegacyConfig(encoded: string): BingoConfig | null {
  try {
    const json = utf8Decode(base64UrlToBytes(encoded));
    const data = JSON.parse(json) as {
      t?: string;
      s?: number;
      f?: number;
      p?: string[];
      seed?: string;
    };
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
    return {
      title: (data.t || DEFAULT_CONFIG.title).slice(0, 80),
      size: clampSize(Number(data.s) || 5),
      freeCenter: data.f !== 0,
      phrases: Array.isArray(data.p) ? data.p.map(String).filter(Boolean) : [...DEFAULT_PHRASES],
      seed: data.seed,
    };
  } catch {
    return null;
  }
}
