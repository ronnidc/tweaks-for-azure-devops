/**
 * Where the collapsed story rows are and what they hold, per family of Azure
 * DevOps hosts. The cloud (dev.azure.com, *.visualstudio.com) runs the New
 * Boards Hub, Azure DevOps Server the older taskboard, and their markup has
 * nothing in common. Both profiles run on every page and the one whose rows
 * exist decides, so a server that gets the new hub one day needs no change
 * here.
 */

import { rowKey } from './row-keys';

/**
 * What idOf answers when the page has no key at all for a row: the page is no
 * longer built the way it was when the profile was written.
 */
export const UNREADABLE = Symbol('unreadable');

export interface Profile {
  name: 'cloud' | 'server';
  /** The collapsed story rows on the page. */
  rows(root: ParentNode): Element[];
  /** The row's work item id, null for a row without one, such as Unparented, or UNREADABLE. */
  idOf(row: Element): string | null | typeof UNREADABLE;
  /** The element with the title, which the badges are placed around. */
  titleOf(row: Element): Element | null;
}

// Zero is what both taskboards call the row of tasks without a story.
const WORK_ITEM_ID = /^[1-9]\d*$/;

// Verified on dev.azure.com 2026-11-04 and 2026-11-17, in the page and in the
// board's own script. The collapsed row is one cell that carries the board's
// key for the row as data-row: a story's id, 0 for the tasks without a story,
// and with the board grouped by people a display name, or a word for the
// tasks nobody has. A person's row has an identity where a story has its
// title, and a name can be all digits, so those rows are told by the identity
// and not by the key. The board makes the key from an id or a name before it
// draws the row, so a cell without the attribute is one the board no longer
// builds this way, and the only case that is UNREADABLE. The title is a span
// without a class of its own, so it is the first spaced span among the
// children of the cell's flex row, after the type icon. The state rollup is a
// nested flex row with spaced spans of its own, which looking at the children
// alone keeps out.
export const cloud: Profile = {
  name: 'cloud',
  rows: (root) => [...root.querySelectorAll('td.taskboard-collapsed-row')],
  idOf(row) {
    if (row.querySelector('.identity-view')) return null;
    const key = row.getAttribute('data-row');
    if (key === null) return UNREADABLE;
    return WORK_ITEM_ID.test(key) ? key : null;
  },
  titleOf(row) {
    const flexRow = row.querySelector('.flex-row');
    return flexRow ? [...flexRow.children].find((child) => child.matches('span.margin-left-8')) ?? null : null;
  },
};

// Verified on Azure DevOps Server (azure.fiu.dk) 2026-11-15, in the page and in
// the server's own script. A story has a content row, a summary row or both:
// the board builds the one it shows, and the other when the row is first
// collapsed or expanded. With a person filter on, the stories without tasks
// for that person start out as a summary row alone. Both rows carry the
// board's number for the row in their id, and the content row stands right
// before its summary row, so the row before a summary row is its own only when
// the numbers match: it may be the content row of the story above. The work
// item id is on the content row's parent cell as taskboard-table-body_p<id>,
// and for a row without a content row in the page's script data alone, which
// rowKey asks for. The row of tasks without a story is _p0 on the cell and no
// number in the script data. Grouped by people the rows are people, and the
// number on the cell is one of the person's tasks. The board gives every row a
// key before it puts the row in the page, a person's name and the word it uses
// for no story included, so a row without any key is one the board no longer
// builds this way, and the only case that is UNREADABLE.
const SERVER_ROW = /^taskboard-summary-row-(\d+)$/;
const SERVER_ID = /_p(\d+)$/;

export const server: Profile = {
  name: 'server',
  rows: (root) => [...root.querySelectorAll('tr.taskboard-row-summary')],
  idOf(row) {
    if (row.querySelector('.peopleClassification')) return null;
    const number = SERVER_ROW.exec(row.id)?.[1];
    const content = row.previousElementSibling;
    const onCell =
      number && content?.id === `taskboard-row-${number}`
        ? SERVER_ID.exec(content.querySelector('td.taskboard-parent')?.id ?? '')?.[1]
        : undefined;
    const key = onCell ?? rowKey(row);
    if (!key) return UNREADABLE;
    return WORK_ITEM_ID.test(key) ? key : null;
  },
  titleOf: (row) => row.querySelector('.witTitle'),
};

export const PROFILES: readonly Profile[] = [cloud, server];
