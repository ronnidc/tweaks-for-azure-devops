import { addedSites, sitePattern, type Site } from '@/core/sites';
import { browser } from './browser';

// The extension has access to the cloud from the manifest and to nothing else.
// A server of the user's own gets access when the user adds it, and the
// background script then registers the content script for it.

/**
 * Asks for access to the site. Must be called directly in a click or key
 * handler, before any await: Firefox rejects the request once the user
 * gesture is gone. Resolves false when the user declines.
 */
export function addSite(origin: string): Promise<boolean> {
  return browser.permissions.request({ origins: [sitePattern(origin)] }).catch(() => false);
}

export function removeSite(site: Site): Promise<boolean> {
  return browser.permissions.remove({ origins: [site.pattern] }).catch(() => false);
}

export async function listSites(): Promise<Site[]> {
  const { origins = [] } = await browser.permissions.getAll();
  return addedSites(origins);
}

export function onSitesChange(listener: () => void): void {
  browser.permissions.onAdded.addListener(listener);
  browser.permissions.onRemoved.addListener(listener);
}
