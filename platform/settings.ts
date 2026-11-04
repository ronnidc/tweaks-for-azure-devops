import { parseSettings, type Settings } from '@/core/features';
import { browser } from './browser';

// The switches live in the browser's sync storage, so they follow the user's
// browser account, under one key: a handful of booleans is one write.

const KEY = 'settings';

export async function loadSettings(): Promise<Settings> {
  const items = await browser.storage.sync.get(KEY);
  return parseSettings(items[KEY]);
}

export function saveSettings(settings: Settings): Promise<void> {
  return browser.storage.sync.set({ [KEY]: settings });
}

/** Also fires for changes that arrive from another computer through sync. */
export function onSettingsChange(listener: (settings: Settings) => void): void {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !(KEY in changes)) return;
    listener(parseSettings(changes[KEY]?.newValue));
  });
}
