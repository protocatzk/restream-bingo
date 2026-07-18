/** Default streamer / chat bingo phrases (German-friendly for Restream). */
export const DEFAULT_PHRASES = [
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
  phrases: DEFAULT_PHRASES,
};

/** Simple string hash → 32-bit seed for mulberry32. */
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32). */
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

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function neededCells(size: number, freeCenter: boolean): number {
  const total = size * size;
  return freeCenter && size % 2 === 1 ? total - 1 : total;
}

export function buildBoard(config: BingoConfig): BingoCell[] {
  const { size, freeCenter, phrases, seed } = config;
  const total = size * size;
  const need = neededCells(size, freeCenter);
  const rng = seed ? mulberry32(hashSeed(seed)) : Math.random;

  let pool = phrases.map((p) => p.trim()).filter(Boolean);
  if (pool.length === 0) {
    pool = [...DEFAULT_PHRASES];
  }

  // If not enough phrases, cycle through them.
  const picked: string[] = [];
  const shuffled = shuffle(pool, rng);
  for (let i = 0; i < need; i++) {
    picked.push(shuffled[i % shuffled.length]);
  }
  // Reshuffle so repeats aren't clustered when cycling.
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

/** Check rows, columns, both diagonals. Returns winning cell indices or null. */
export function findWin(marked: boolean[], size: number): number[] | null {
  // Rows
  for (let r = 0; r < size; r++) {
    const line: number[] = [];
    for (let c = 0; c < size; c++) line.push(r * size + c);
    if (line.every((i) => marked[i])) return line;
  }
  // Columns
  for (let c = 0; c < size; c++) {
    const line: number[] = [];
    for (let r = 0; r < size; r++) line.push(r * size + c);
    if (line.every((i) => marked[i])) return line;
  }
  // Main diagonal
  {
    const line: number[] = [];
    for (let i = 0; i < size; i++) line.push(i * size + i);
    if (line.every((i) => marked[i])) return line;
  }
  // Anti diagonal
  {
    const line: number[] = [];
    for (let i = 0; i < size; i++) line.push(i * size + (size - 1 - i));
    if (line.every((i) => marked[i])) return line;
  }
  return null;
}

/** Encode config for shareable URL (compact base64url JSON). */
export function encodeConfig(config: BingoConfig): string {
  const payload = {
    t: config.title,
    s: config.size,
    f: config.freeCenter ? 1 : 0,
    p: config.phrases,
    seed: config.seed || undefined,
  };
  const json = JSON.stringify(payload);
  const b64 =
    typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeConfig(encoded: string): BingoConfig | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const json =
      typeof atob !== 'undefined'
        ? decodeURIComponent(escape(atob(b64 + pad)))
        : Buffer.from(b64 + pad, 'base64').toString('utf8');
    const data = JSON.parse(json) as {
      t?: string;
      s?: number;
      f?: number;
      p?: string[];
      seed?: string;
    };
    const size = Math.min(7, Math.max(3, Number(data.s) || 5));
    return {
      title: (data.t || DEFAULT_CONFIG.title).slice(0, 80),
      size,
      freeCenter: data.f !== 0,
      phrases: Array.isArray(data.p) ? data.p.map(String).filter(Boolean) : DEFAULT_PHRASES,
      seed: data.seed,
    };
  } catch {
    return null;
  }
}
