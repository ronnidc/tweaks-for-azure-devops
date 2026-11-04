/**
 * Where the collapsed story rows are and what they hold, per family of Azure
 * DevOps hosts. The cloud (dev.azure.com, *.visualstudio.com) runs the New
 * Boards Hub, Azure DevOps Server the older taskboard, and their markup has
 * nothing in common. Both profiles run on every page and the one whose rows
 * exist decides, so a server that gets the new hub one day needs no change
 * here.
 */
export interface Profile {
  name: 'cloud' | 'server';
  /** The collapsed story rows on the page. */
  rows(root: ParentNode): Element[];
  /** The row's work item id, or null for a row without one, such as Unparented. */
  idOf(row: Element): string | null;
  /** The element with the title, which the badges are placed around. */
  titleOf(row: Element): Element | null;
}

const DIGITS = /^\d+$/;

// Verified on dev.azure.com 2026-11-04. The collapsed row is one cell that
// carries the id as data-row. The title is a span without a class of its own,
// so it is the first spaced span among the children of the cell's flex row,
// after the type icon. The state rollup is a nested flex row with spaced spans
// of its own, which looking at the children alone keeps out.
export const cloud: Profile = {
  name: 'cloud',
  rows: (root) => [...root.querySelectorAll('td.taskboard-collapsed-row')],
  idOf(row) {
    const id = row.getAttribute('data-row');
    return id && DIGITS.test(id) ? id : null;
  },
  titleOf(row) {
    const flexRow = row.querySelector('.flex-row');
    return flexRow ? [...flexRow.children].find((child) => child.matches('span.margin-left-8')) ?? null : null;
  },
};

// Verified on Azure DevOps Server (azure.fiu.dk) 2026-11-04. The number in the
// summary row's own id is a row index. The work item id sits in the hidden
// content row right before it, as taskboard-table-body_p<id> on the parent
// cell. The Unparented row has a summary row too, but no id.
const SERVER_ID = /_p(\d+)$/;

export const server: Profile = {
  name: 'server',
  rows: (root) => [...root.querySelectorAll('tr.taskboard-row-summary')],
  idOf(row) {
    const content = row.previousElementSibling;
    if (!content?.matches('tr.taskboard-content-row')) return null;
    const cell = content.querySelector('td.taskboard-parent');
    return (cell && SERVER_ID.exec(cell.id)?.[1]) || null;
  },
  titleOf: (row) => row.querySelector('.witTitle'),
};

export const PROFILES: readonly Profile[] = [cloud, server];
