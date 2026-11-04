/**
 * The tweaks, one switch each. The options page renders this list, the
 * content script reads the switches, and a new tweak is a row here plus its
 * own module under core/.
 */

export type FeatureKey = 'taskboardId' | 'taskboardState';

export interface Feature {
  key: FeatureKey;
  name: string;
  description: string;
}

export const FEATURES: readonly Feature[] = [
  {
    key: 'taskboardId',
    name: 'Work item ID on collapsed taskboard rows',
    description:
      'The ID in front of the title when a story row on the sprint taskboard is collapsed, the way the cards show it.',
  },
  {
    key: 'taskboardState',
    name: 'State on collapsed taskboard rows',
    description: 'The state after the title, read from your Azure DevOps server with your own session.',
  },
];

export type Settings = Record<FeatureKey, boolean>;

/** Every tweak is on until the user turns it off. */
export const DEFAULT_SETTINGS: Settings = { taskboardId: true, taskboardState: true };

/** What was stored, with the defaults for anything missing or unknown. */
export function parseSettings(stored: unknown): Settings {
  const settings = { ...DEFAULT_SETTINGS };
  if (typeof stored !== 'object' || stored === null) return settings;
  for (const { key } of FEATURES) {
    if (key in stored) settings[key] = (stored as Record<string, unknown>)[key] !== false;
  }
  return settings;
}
