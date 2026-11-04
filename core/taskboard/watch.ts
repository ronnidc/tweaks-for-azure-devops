import type { Settings } from '../features';
import { decorate, type RowOptions } from './collapsed-rows';
import { PROFILES } from './profiles';
import { apiRoot, WorkItemStates } from './state';

export interface Taskboard {
  setOptions(options: RowOptions): void;
  stop(): void;
}

export function rowOptions(settings: Settings): RowOptions {
  return { id: settings.taskboardId, state: settings.taskboardState };
}

/**
 * Keeps the collapsed rows decorated for the life of the page. The whole
 * table is redrawn on filter changes, Collapse all, expanding a row and sprint
 * changes, and the taskboard is reached from the other hubs without a page
 * load, so one observer stays on and runs one pass per frame, which keeps a
 * burst of mutations cheap. Off the sprint pages a pass is one look at the
 * address. A redrawn row has its state asked for again, and so has every row
 * when the tab comes back into view, because the state may have been changed
 * elsewhere in the meantime.
 */
export function watchTaskboard(doc: Document, options: RowOptions, fetchImpl?: typeof fetch): Taskboard {
  const view = doc.defaultView;
  if (!view) throw new Error('The document has no window');
  let current = options;
  let scheduled = false;
  const states = new WorkItemStates(schedule, fetchImpl);

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    view!.requestAnimationFrame(() => {
      scheduled = false;
      pass(false);
    });
  }

  function pass(everyRow: boolean) {
    const root = apiRoot(doc.location.pathname);
    if (root === null) return;
    const { shown, wanted } = decorate(doc, PROFILES, current, (id) => states.get(id));
    if (current.state) states.request(root, everyRow ? shown : wanted);
  }

  function onVisibilityChange() {
    if (doc.visibilityState !== 'visible') return;
    states.refresh();
    pass(true);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(doc.body, { childList: true, subtree: true });
  doc.addEventListener('visibilitychange', onVisibilityChange);
  pass(false);

  return {
    setOptions(next) {
      current = next;
      pass(false);
    },
    stop() {
      observer.disconnect();
      doc.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
