import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cloudBoard } from '../../test/boards';
import { ID_CLASS, STATE_CLASS } from './collapsed-rows';
import { type Taskboard, watchTaskboard } from './watch';

const TASKBOARD = 'https://dev.azure.com/kudotechnologies/scrum-test/_sprints/taskboard/scrum-test-team/scrum-test/sprint-1';

function answer(items: Record<string, string>): Response {
  const value = Object.entries(items).map(([id, state]) => ({ id: Number(id), fields: { 'System.State': state } }));
  return new Response(JSON.stringify({ count: value.length, value }));
}

describe('watchTaskboard', () => {
  let board: Taskboard | undefined;

  beforeEach(() => {
    (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM.setURL(TASKBOARD);
    document.body.innerHTML = cloudBoard();
  });

  afterEach(() => {
    board?.stop();
  });

  it('decorates the rows that are there and the rows that come later', async () => {
    const fetchImpl = vi.fn(async () => answer({ 6: 'Committed', 11: 'Done' }));
    board = watchTaskboard(document, { id: true, state: true }, fetchImpl);

    expect(document.querySelector(`.${ID_CLASS}`)?.textContent).toBe('6');
    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed'));
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    // The table is redrawn, as it is on a filter change.
    document.body.innerHTML = cloudBoard().replaceAll('data-row="6"', 'data-row="11"');
    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Done'));
    expect(document.querySelector(`.${ID_CLASS}`)?.textContent).toBe('11');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('asks for every row again when the tab comes back into view', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(answer({ 6: 'Committed' })).mockResolvedValue(answer({ 6: 'Done' }));
    board = watchTaskboard(document, { id: true, state: true }, fetchImpl);
    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed'));

    document.dispatchEvent(new Event('visibilitychange'));

    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Done'));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('takes the badges off and puts them back as the switches change, without a redraw', async () => {
    const fetchImpl = vi.fn(async () => answer({ 6: 'Committed' }));
    board = watchTaskboard(document, { id: true, state: true }, fetchImpl);
    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)).not.toBeNull());

    board.setOptions({ id: false, state: false });
    expect(document.querySelector(`.${ID_CLASS}`)).toBeNull();
    expect(document.querySelector(`.${STATE_CLASS}`)).toBeNull();

    board.setOptions({ id: true, state: true });
    expect(document.querySelector(`.${ID_CLASS}`)?.textContent).toBe('6');
    expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed');
  });

  it('does nothing off the sprint pages, and starts when the page gets there without a reload', async () => {
    const happyDOM = (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM;
    happyDOM.setURL('https://dev.azure.com/kudotechnologies/scrum-test/_backlogs/backlog/scrum-test-team/Stories');
    const fetchImpl = vi.fn(async () => answer({ 6: 'Committed' }));
    board = watchTaskboard(document, { id: true, state: true }, fetchImpl);

    expect(document.querySelector(`.${ID_CLASS}`)).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchImpl).not.toHaveBeenCalled();

    happyDOM.setURL(TASKBOARD);
    document.body.innerHTML = cloudBoard();
    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed'));
  });

  it('makes no request when the state tweak is off', async () => {
    const fetchImpl = vi.fn(async () => answer({}));
    board = watchTaskboard(document, { id: true, state: false }, fetchImpl);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
