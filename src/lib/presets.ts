import type { BingoConfig } from './bingo';
import { DEFAULT_PHRASES } from './bingo';

/**
 * Named boards with fixed seeds – served under short paths like `/dkm`.
 * Everyone who opens the path gets the same layout.
 */
export type BoardPreset = {
  /** URL slug → `/dkm` */
  slug: string;
  /** Header brand title */
  brand: string;
  subtitle: string;
  pageTitle: string;
  config: BingoConfig;
};

/** DKM-specific phrase pool (enough for 5×5 + free). */
export const DKM_PHRASES: readonly string[] = [
  'DKM Intro',
  'Technik-Check',
  '„Könnt ihr mich hören?“',
  'Chat begrüßen',
  'Erster!',
  'Pog',
  'LUL',
  'KEKW',
  'Hype-Train',
  'Donation-Alert',
  'Raid incoming',
  'Backseating',
  '„Das war geplant“',
  'Technische Probleme',
  'Stream-Delay',
  'Clip it',
  'Emote-Spam',
  'Mods?',
  'Sub-Hype',
  'GG',
  'AFK-Alarm',
  'Pet cam',
  'Kaffee / Energy',
  'Meta-Talk',
  'Highlight-Moment',
  '„Kurze Pause“',
  'Uncut-Chaos',
  'Bingo-Call',
  'F in the chat',
  'Nächstes Mal besser',
];

export const DKM_PRESET: BoardPreset = {
  slug: 'dkm',
  brand: 'DKM Bingo',
  subtitle: 'Spezial-Board · fester Seed für alle Zuschauer',
  pageTitle: 'DKM Bingo',
  config: {
    title: 'DKM Bingo',
    size: 5,
    freeCenter: true,
    seed: 'dkm',
    phrases: [...DKM_PHRASES],
  },
};

export const PRESETS: Record<string, BoardPreset> = {
  dkm: DKM_PRESET,
};

export function getPreset(slug: string): BoardPreset | undefined {
  return PRESETS[slug];
}

/** Storage key so preset boards don’t overwrite the home board. */
export function presetStorageKey(slug: string): string {
  return `bingo-preset:${slug}`;
}
