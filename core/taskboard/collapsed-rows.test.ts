import { describe, expect, it } from 'vitest';
import { cloudBoard, serverBoard } from '../../test/boards';
import { decorate, ID_CLASS, STATE_CLASS } from './collapsed-rows';
import { PROFILES } from './profiles';

const BOTH = { id: true, state: true };
const states: Record<string, string> = { '6': 'Committed', '687': 'Active' };
const stateOf = (id: string) => states[id];

/** The texts around the title: what a user reads on the row. */
function rowText(title: Element): string {
  return (title.parentElement?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('decorate', () => {
  it.each([
    ['cloud', cloudBoard, '6', 'Committed', 'Make a test case for DevOps'],
    ['server', serverBoard, '687', 'Active', 'KYOTO tools behind prod Authentik'],
  ])('puts the id in front of the title and the state after it, on the %s board', (_, board, id, state, title) => {
    document.body.innerHTML = board();
    const pass = decorate(document, PROFILES, BOTH, stateOf);

    expect(pass).toMatchObject({ shown: [id], wanted: [id] });
    const idBadge = document.querySelector(`.${ID_CLASS}`)!;
    const stateBadge = document.querySelector(`.${STATE_CLASS}`)!;
    expect(idBadge.textContent).toBe(id);
    expect(stateBadge.textContent).toBe(state);
    const titleElement = idBadge.nextElementSibling!;
    expect(titleElement.textContent).toBe(title);
    expect(titleElement.nextElementSibling).toBe(stateBadge);
    expect(rowText(titleElement)).toContain(`${id} ${title} ${state}`);
  });

  it('leaves the row without a work item alone', () => {
    document.body.innerHTML = cloudBoard() + serverBoard();
    decorate(document, PROFILES, BOTH, stateOf);
    for (const title of document.querySelectorAll('span.margin-left-8, .witTitle')) {
      if (title.textContent === 'Unparented') expect(rowText(title)).not.toMatch(/tfad|Committed|Active/);
    }
    expect(document.querySelectorAll(`.${ID_CLASS}`)).toHaveLength(2);
  });

  it('runs again without doubling anything, and wants nothing the second time', () => {
    document.body.innerHTML = cloudBoard();
    decorate(document, PROFILES, BOTH, stateOf);
    const pass = decorate(document, PROFILES, BOTH, stateOf);

    expect(pass).toEqual({ shown: ['6'], wanted: [], unreadable: 0 });
    expect(document.querySelectorAll(`.${ID_CLASS}`)).toHaveLength(1);
    expect(document.querySelectorAll(`.${STATE_CLASS}`)).toHaveLength(1);
  });

  it('shows no state until it is known, and keeps wanting it until then', () => {
    document.body.innerHTML = cloudBoard();
    expect(decorate(document, PROFILES, BOTH, () => undefined).wanted).toEqual(['6']);
    expect(document.querySelector(`.${STATE_CLASS}`)).toBeNull();
    expect(document.querySelector(`.${ID_CLASS}`)?.textContent).toBe('6');

    expect(decorate(document, PROFILES, BOTH, () => undefined).wanted).toEqual(['6']);
    expect(decorate(document, PROFILES, BOTH, stateOf).wanted).toEqual([]);
    expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed');
  });

  it('wants a redrawn row again, known state or not', () => {
    document.body.innerHTML = cloudBoard();
    decorate(document, PROFILES, BOTH, stateOf);
    document.body.innerHTML = cloudBoard();
    expect(decorate(document, PROFILES, BOTH, stateOf).wanted).toEqual(['6']);
    expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed');
  });

  it('updates a state that changed', () => {
    document.body.innerHTML = cloudBoard();
    decorate(document, PROFILES, BOTH, stateOf);
    decorate(document, PROFILES, BOTH, () => 'Done');
    expect(document.querySelectorAll(`.${STATE_CLASS}`)).toHaveLength(1);
    expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Done');
  });

  it('takes the badges off again when a tweak is turned off, spaces included', () => {
    document.body.innerHTML = serverBoard();
    const before = document.querySelector('.witTitle')!.parentElement!.innerHTML;
    decorate(document, PROFILES, BOTH, stateOf);
    decorate(document, PROFILES, { id: false, state: true }, stateOf);
    expect(document.querySelector(`.${ID_CLASS}`)).toBeNull();
    expect(document.querySelector(`.${STATE_CLASS}`)).not.toBeNull();

    decorate(document, PROFILES, { id: false, state: false }, stateOf);
    expect(document.querySelector(`.${STATE_CLASS}`)).toBeNull();
    expect(document.querySelector('.witTitle')!.parentElement!.innerHTML).toBe(before);
  });

  it('takes the badges off an element the page hands to a row without a work item', () => {
    document.body.innerHTML = cloudBoard();
    const title = document.querySelector('td[data-row="6"] span.margin-left-8:not(.work-item-type-icon)')!;
    const before = rowText(title);
    decorate(document, PROFILES, BOTH, stateOf);
    expect(rowText(title)).not.toBe(before);

    document.querySelector('td[data-row="6"]')!.setAttribute('data-row', 'unparented');
    expect(decorate(document, PROFILES, BOTH, stateOf)).toEqual({ shown: [], wanted: [], unreadable: 0 });
    expect(document.querySelector(`.${ID_CLASS}`)).toBeNull();
    expect(document.querySelector(`.${STATE_CLASS}`)).toBeNull();
    expect(rowText(title)).toBe(before);
  });

  it('asks for no state when that tweak is off', () => {
    document.body.innerHTML = cloudBoard();
    const pass = decorate(document, PROFILES, { id: true, state: false }, stateOf);
    expect(pass).toEqual({ shown: ['6'], wanted: [], unreadable: 0 });
  });

  it('counts the rows whose id the page does not give, and puts nothing on them', () => {
    // No page-world script here, so the story that was never expanded has no id to be found.
    document.body.innerHTML = serverBoard();
    expect(decorate(document, PROFILES, BOTH, stateOf)).toEqual({ shown: ['687'], wanted: ['687'], unreadable: 1 });
    expect(document.getElementById('taskboard-summary-row-18')!.querySelector(`.${ID_CLASS}, .${STATE_CLASS}`)).toBeNull();
  });
});
