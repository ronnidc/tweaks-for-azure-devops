import type { Profile } from './profiles';

export interface RowOptions {
  /** Show the work item id in front of the title. */
  id: boolean;
  /** Show the state after the title. */
  state: boolean;
}

export interface Pass {
  /** The ids of every collapsed row on the page, in order. */
  shown: string[];
  /** The ids to ask the server about now: rows drawn since the last pass, and rows whose state is not known. */
  wanted: string[];
}

export const ID_CLASS = 'tfad-id';
export const STATE_CLASS = 'tfad-state';
/** On a row the pass has been over. The page draws rows whole, so a redrawn row comes back without it. */
export const SEEN_CLASS = 'tfad-seen';

/**
 * Puts the id and the state on every collapsed row, and takes them off where
 * the tweak is turned off. The badges themselves say what is on a row: a
 * redrawn row has none and gets new ones, an untouched row keeps its own, so
 * the pass can run on every mutation without doubling anything.
 */
export function decorate(
  root: ParentNode,
  profiles: readonly Profile[],
  options: RowOptions,
  stateOf: (id: string) => string | undefined,
): Pass {
  const shown: string[] = [];
  const wanted: string[] = [];
  for (const profile of profiles) {
    for (const row of profile.rows(root)) {
      const id = profile.idOf(row);
      const title = profile.titleOf(row);
      if (!id || !title) continue;
      shown.push(id);
      const fresh = !row.classList.contains(SEEN_CLASS);
      row.classList.add(SEEN_CLASS);

      const idBadge = badgeNextTo(title, ID_CLASS);
      if (!options.id) removeBadge(idBadge, 'after');
      else if (!idBadge) title.before(badge(ID_CLASS, id), ' ');
      else if (idBadge.textContent !== id) idBadge.textContent = id;

      const stateBadge = badgeNextTo(title, STATE_CLASS);
      if (!options.state) {
        removeBadge(stateBadge, 'before');
        continue;
      }
      const state = stateOf(id);
      if (fresh || !state) wanted.push(id);
      if (!state) removeBadge(stateBadge, 'before');
      else if (!stateBadge) title.after(' ', badge(STATE_CLASS, state));
      else if (stateBadge.textContent !== state) stateBadge.textContent = state;
    }
  }
  return { shown, wanted };
}

function badge(className: string, text: string): HTMLSpanElement {
  const element = document.createElement('span');
  element.className = className;
  element.textContent = text;
  return element;
}

function badgeNextTo(title: Element, className: string): Element | null {
  const siblings = title.parentElement?.children ?? [];
  return [...siblings].find((element) => element.classList.contains(className)) ?? null;
}

/** Takes the badge and the space that came with it out again. */
function removeBadge(element: Element | null, space: 'before' | 'after'): void {
  if (!element) return;
  const text = space === 'before' ? element.previousSibling : element.nextSibling;
  if (text?.nodeType === Node.TEXT_NODE && !text.textContent?.trim()) text.remove();
  element.remove();
}
