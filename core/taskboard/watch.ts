import type { Settings } from '../features';
import { decorate, type RowOptions } from './collapsed-rows';
import { PROFILES } from './profiles';
import { apiRoot, WorkItemStates } from './state';

export interface Taskboard {
  setOptions(options: RowOptions): void;
  stop(): void;
}

/** What tells the user, in the page, that ids cannot be read. Shown twice it is there once. */
export interface Notice {
  show(): void;
  hide(): void;
}

/** What the watch is handed from outside. Only the notice is needed, the rest is for the tests. */
export interface Surroundings {
  notice: Notice;
  fetch?: typeof fetch;
  noticeDelay?: number;
}

// How long ids have to stay unreadable before the notice says so, in
// milliseconds: long enough for a page that is still getting ready, short
// enough that the notice is there while the user still looks for the ids.
const NOTICE_DELAY = 2000;

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
 * elsewhere in the meantime. When the page does not give the id of a row, a
 * notice at the top of the page says so, for as long as there is such a row
 * and a tweak that needs the id is on.
 */
export function watchTaskboard(doc: Document, options: RowOptions, surroundings: Surroundings): Taskboard {
  const view = doc.defaultView;
  if (!view) throw new Error('The document has no window');
  let current = options;
  let scheduled = false;
  let waiting: number | undefined;
  let overdue = false;
  const states = new WorkItemStates(schedule, surroundings.fetch);
  const { notice } = surroundings;

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
    if (root === null) return tell(false);
    const { shown, wanted, unreadable } = decorate(doc, PROFILES, current, (id) => states.get(id));
    tell(unreadable > 0 && (current.id || current.state));
    if (current.state) states.request(root, everyRow ? shown : wanted);
  }

  // The notice waits and looks once more before it speaks. A row can be asked
  // about a moment before the page-world script is there to answer, and a
  // notice that flashes by on a board with nothing wrong would be a bug of its
  // own.
  function tell(unreadable: boolean) {
    if (!unreadable) {
      view!.clearTimeout(waiting);
      waiting = undefined;
      overdue = false;
      notice.hide();
    } else if (overdue) {
      notice.show();
    } else {
      waiting ??= view!.setTimeout(() => {
        overdue = true;
        pass(false);
      }, surroundings.noticeDelay ?? NOTICE_DELAY);
    }
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
      view.clearTimeout(waiting);
      notice.hide();
    },
  };
}
