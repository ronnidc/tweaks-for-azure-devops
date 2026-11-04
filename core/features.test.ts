import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, FEATURES, parseSettings } from './features';

describe('parseSettings', () => {
  it('turns every tweak on when nothing is stored', () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('junk')).toEqual(DEFAULT_SETTINGS);
    expect(Object.values(DEFAULT_SETTINGS).every(Boolean)).toBe(true);
  });

  it('reads what was stored and ignores what it does not know', () => {
    expect(parseSettings({ taskboardId: false, somethingElse: false })).toEqual({ taskboardId: false, taskboardState: true });
  });

  it('has a default for every feature on the list', () => {
    expect(Object.keys(DEFAULT_SETTINGS).sort()).toEqual(FEATURES.map((feature) => feature.key).sort());
  });
});
