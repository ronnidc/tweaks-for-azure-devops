import { beforeEach, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

beforeEach(() => {
  fakeBrowser.reset();

  // The in-memory browser covers storage. Permissions and the manifest are
  // filled in here: no site given access yet, a user who says yes when asked,
  // and the version the options page shows.
  fakeBrowser.runtime.getManifest = (() => ({ version: '0.1.0' })) as typeof fakeBrowser.runtime.getManifest;
  fakeBrowser.permissions.contains = vi.fn(async () => false);
  fakeBrowser.permissions.request = vi.fn(async () => true);
  fakeBrowser.permissions.remove = vi.fn(async () => true);
  fakeBrowser.permissions.getAll = vi.fn(async () => ({ origins: [], permissions: [] }));
  fakeBrowser.permissions.onAdded.addListener = vi.fn();
  fakeBrowser.permissions.onRemoved.addListener = vi.fn();
});
