import { describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { loadSettings, onSettingsChange, saveSettings } from './settings';

describe('settings', () => {
  it('has every tweak on until told otherwise', async () => {
    expect(await loadSettings()).toEqual({ taskboardId: true, taskboardState: true });
    await saveSettings({ taskboardId: true, taskboardState: false });
    expect(await loadSettings()).toEqual({ taskboardId: true, taskboardState: false });
  });

  it('tells the listener what the settings are now', async () => {
    const listener = vi.fn();
    onSettingsChange(listener);

    await saveSettings({ taskboardId: false, taskboardState: true });
    expect(listener).toHaveBeenLastCalledWith({ taskboardId: false, taskboardState: true });

    await fakeBrowser.storage.sync.set({ other: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
