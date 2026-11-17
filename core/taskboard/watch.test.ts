import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cloudBoard, serverBoard } from '../../test/boards';
import { ID_CLASS, STATE_CLASS } from './collapsed-rows';
import { type Notice, type Taskboard, watchTaskboard } from './watch';

const TASKBOARD = 'https://dev.azure.com/kudotechnologies/scrum-test/_sprints/taskboard/scrum-test-team/scrum-test/sprint-1';

function answer(items: Record<string, string>): Response {
  const value = Object.entries(items).map(([id, state]) => ({ id: Number(id), fields: { 'System.State': state } }));
  return new Response(JSON.stringify({ count: value.length, value }));
}

/** A notice that only remembers whether it is up. */
function fakeNotice(): Notice & { up: boolean } {
  return {
    up: false,
    show() {
      this.up = true;
    },
    hide() {
      this.up = false;
    },
  };
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
    board = watchTaskboard(document, { id: true, state: true }, { notice: fakeNotice(), fetch: fetchImpl });

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
    board = watchTaskboard(document, { id: true, state: true }, { notice: fakeNotice(), fetch: fetchImpl });
    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed'));

    document.dispatchEvent(new Event('visibilitychange'));

    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Done'));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('takes the badges off and puts them back as the switches change, without a redraw', async () => {
    const fetchImpl = vi.fn(async () => answer({ 6: 'Committed' }));
    board = watchTaskboard(document, { id: true, state: true }, { notice: fakeNotice(), fetch: fetchImpl });
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
    board = watchTaskboard(document, { id: true, state: true }, { notice: fakeNotice(), fetch: fetchImpl });

    expect(document.querySelector(`.${ID_CLASS}`)).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchImpl).not.toHaveBeenCalled();

    happyDOM.setURL(TASKBOARD);
    document.body.innerHTML = cloudBoard();
    await vi.waitFor(() => expect(document.querySelector(`.${STATE_CLASS}`)?.textContent).toBe('Committed'));
  });

  it('makes no request when the state tweak is off', async () => {
    const fetchImpl = vi.fn(async () => answer({}));
    board = watchTaskboard(document, { id: true, state: false }, { notice: fakeNotice(), fetch: fetchImpl });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  // The older taskboard with no page-world script to answer: the story that
  // was never expanded, taskboard-summary-row-18, has no id to be found.
  describe('with a row whose id cannot be read', () => {
    const DELAY = 30;
    const pause = () => new Promise((resolve) => setTimeout(resolve, DELAY * 3));
    let notice: ReturnType<typeof fakeNotice>;
    const surroundings = () => ({
      notice,
      fetch: vi.fn(async () => answer({ 687: 'Active' })),
      noticeDelay: DELAY,
    });

    beforeEach(() => {
      document.body.innerHTML = serverBoard();
      notice = fakeNotice();
    });

    it('waits, then puts the notice up, and takes it down when the row is gone', async () => {
      board = watchTaskboard(document, { id: true, state: true }, surroundings());
      expect(notice.up).toBe(false);
      await vi.waitFor(() => expect(notice.up).toBe(true));

      document.getElementById('taskboard-summary-row-18')!.remove();
      await vi.waitFor(() => expect(notice.up).toBe(false));
    });

    it('puts the notice up for a cloud row whose cell lost its key', async () => {
      document.body.innerHTML = cloudBoard();
      document.querySelector('td[data-row="6"]')!.removeAttribute('data-row');
      board = watchTaskboard(document, { id: true, state: true }, surroundings());
      await vi.waitFor(() => expect(notice.up).toBe(true));
    });

    it('says nothing when the row can be read before the wait is over', async () => {
      board = watchTaskboard(document, { id: true, state: true }, surroundings());
      document.getElementById('taskboard-summary-row-18')!.remove();
      await pause();
      expect(notice.up).toBe(false);
    });

    it('says nothing while no tweak that needs the id is on', async () => {
      board = watchTaskboard(document, { id: false, state: false }, surroundings());
      await pause();
      expect(notice.up).toBe(false);

      board.setOptions({ id: false, state: true });
      await vi.waitFor(() => expect(notice.up).toBe(true));
    });

    it('says nothing off the sprint pages', async () => {
      const happyDOM = (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM;
      happyDOM.setURL('https://dev.azure.com/kudotechnologies/scrum-test/_backlogs/backlog/scrum-test-team/Stories');
      board = watchTaskboard(document, { id: true, state: true }, surroundings());
      await pause();
      expect(notice.up).toBe(false);
    });

    it('takes the notice down when it stops', async () => {
      board = watchTaskboard(document, { id: true, state: true }, surroundings());
      await vi.waitFor(() => expect(notice.up).toBe(true));

      board.stop();
      expect(notice.up).toBe(false);
    });
  });
});
