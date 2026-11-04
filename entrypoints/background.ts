import { browser } from '@/platform/browser';
import { listSites, onSitesChange } from '@/platform/sites';

// The content script's files as WXT names them. The background script does
// nothing but register them for the servers the user has added.
const SCRIPT_ID = 'taskboard-sites';
const SCRIPT_JS = 'content-scripts/taskboard.js';
const SCRIPT_CSS = 'content-scripts/taskboard.css';

export default defineBackground(() => {
  // Also on update, in case the file names above changed with the version.
  browser.runtime.onInstalled.addListener(() => inTurn(syncSiteScripts));
  onSitesChange(() => inTurn(syncSiteScripts));
});

// Several events can ask for the same sync at once, and two overlapping runs
// would both try to create the same script.
let queue: Promise<unknown> = Promise.resolve();
function inTurn(task: () => Promise<unknown>) {
  queue = queue.then(task).catch((error) => console.error(error));
}

/** The taskboard script runs on every site the user added, and nowhere else. */
async function syncSiteScripts() {
  const matches = (await listSites()).map((site) => site.pattern);
  const registered = await browser.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
  if (matches.length === 0) {
    if (registered.length > 0) await browser.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
    return;
  }
  const script = {
    id: SCRIPT_ID,
    matches,
    js: [SCRIPT_JS],
    css: [SCRIPT_CSS],
    runAt: 'document_idle' as const,
    persistAcrossSessions: true,
  };
  if (registered.length > 0) await browser.scripting.updateContentScripts([script]);
  else await browser.scripting.registerContentScripts([script]);
}
