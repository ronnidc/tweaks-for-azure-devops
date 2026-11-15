import { browser } from '@/platform/browser';
import { listSites, onSitesChange } from '@/platform/sites';

// The content scripts under the names WXT gives their files: the taskboard
// script, and the script that answers it from the page's own world. The
// manifest has both for the cloud. The background script registers them for
// the servers the user has added, and opens the options page from the toolbar
// button.
function siteScripts(matches: string[]) {
  const shared = { matches, persistAcrossSessions: true };
  return [
    {
      ...shared,
      id: 'taskboard-sites',
      js: ['content-scripts/taskboard.js'],
      css: ['content-scripts/taskboard.css'],
      runAt: 'document_idle' as const,
    },
    {
      ...shared,
      id: 'taskboard-page-sites',
      js: ['content-scripts/taskboard-page.js'],
      runAt: 'document_start' as const,
      world: 'MAIN' as const,
    },
  ];
}

export default defineBackground(() => {
  // Also on update, in case the file names above changed with the version.
  browser.runtime.onInstalled.addListener(() => inTurn(syncSiteScripts));
  onSitesChange(() => inTurn(syncSiteScripts));
  browser.action.onClicked.addListener(() => {
    browser.runtime.openOptionsPage().catch((error) => console.error(error));
  });
});

// Several events can ask for the same sync at once, and two overlapping runs
// would both try to create the same scripts.
let queue: Promise<unknown> = Promise.resolve();
function inTurn(task: () => Promise<unknown>) {
  queue = queue.then(task).catch((error) => console.error(error));
}

/** The scripts run on every site the user added, and nowhere else. */
async function syncSiteScripts() {
  const matches = (await listSites()).map((site) => site.pattern);
  const scripts = matches.length > 0 ? siteScripts(matches) : [];
  const registered = (await browser.scripting.getRegisteredContentScripts()).map((script) => script.id);
  const gone = registered.filter((id) => !scripts.some((script) => script.id === id));
  const known = scripts.filter((script) => registered.includes(script.id));
  const added = scripts.filter((script) => !registered.includes(script.id));
  if (gone.length > 0) await browser.scripting.unregisterContentScripts({ ids: gone });
  if (known.length > 0) await browser.scripting.updateContentScripts(known);
  if (added.length > 0) await browser.scripting.registerContentScripts(added);
}
