/**
 * The older taskboard keeps the key of a row, which is the work item id when
 * the board is grouped by story, in its own script data and not in the DOM. A
 * row that has never been expanded has it nowhere else. A content script
 * cannot see a page's script data, so a second script runs in the page's own
 * world with one job: when asked about a row, it writes the row's key on the
 * row. The two talk through the DOM alone, an event one way and an attribute
 * the other.
 */

/** Dispatched on a summary row to ask for its key. */
export const KEY_REQUEST = 'tfad-row-key';
/** Where the answer lands, on the row. Empty when the page keeps no key for it. */
export const KEY_ATTRIBUTE = 'data-tfad-row-key';

// The name the taskboard stores the key under, as data on the row.
const PAGE_DATA_NAME = 'pivotKey';

/** The page's jQuery, as much of it as is used here. */
type PageQuery = (element: Element) => { data(name: string): unknown };

/**
 * The content script's side: the row's key, or null as long as the page has
 * not answered. The answer stays on the row, and a row keeps its key for as
 * long as it lives, so a row is asked about once.
 */
export function rowKey(row: Element): string | null {
  if (!row.hasAttribute(KEY_ATTRIBUTE)) row.dispatchEvent(new Event(KEY_REQUEST, { bubbles: true }));
  return row.getAttribute(KEY_ATTRIBUTE);
}

/** The page's side: answers the requests, for the life of the page. */
export function answerRowKeys(view: Window): void {
  view.document.addEventListener(KEY_REQUEST, (event) => {
    const query = (view as Window & { jQuery?: PageQuery }).jQuery;
    if (!(event.target instanceof Element) || typeof query !== 'function') return;
    const key = query(event.target).data(PAGE_DATA_NAME);
    const known = typeof key === 'number' || typeof key === 'string';
    event.target.setAttribute(KEY_ATTRIBUTE, known ? String(key) : '');
  });
}
