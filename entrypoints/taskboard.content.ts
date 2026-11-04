import '@/ui/taskboard.css';
import { CLOUD_MATCHES } from '@/core/sites';
import { rowOptions, watchTaskboard } from '@/core/taskboard/watch';
import { loadSettings, onSettingsChange } from '@/platform/settings';

export default defineContentScript({
  // The cloud from the manifest. A server the user adds gets this same script
  // registered by the background script, for that site alone.
  matches: CLOUD_MATCHES,
  runAt: 'document_idle',
  // WXT can announce a content script to the page with postMessage, which the
  // page's own message listeners may trip over.
  noScriptStartedPostMessage: true,

  async main() {
    const board = watchTaskboard(document, rowOptions(await loadSettings()));
    // A switch turned off on the options page takes its badges off without a reload.
    onSettingsChange((settings) => board.setOptions(rowOptions(settings)));
  },
});
