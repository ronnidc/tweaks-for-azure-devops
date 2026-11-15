import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cloudBoard, pageQuery, serverBoard } from '../../test/boards';
import { cloud, server } from './profiles';
import { answerRowKeys } from './row-keys';

const page = window as Window & { jQuery?: unknown };

describe('cloud profile', () => {
  it('finds the collapsed rows, their ids and their titles, and nothing on the expanded ones', () => {
    document.body.innerHTML = cloudBoard();
    const rows = cloud.rows(document);
    expect(rows.map((row) => cloud.idOf(row))).toEqual(['6', null]);
    expect(rows.map((row) => cloud.titleOf(row)?.textContent)).toEqual(['Make a test case for DevOps', 'Unparented']);
  });

  it('finds no rows on a server board', () => {
    document.body.innerHTML = serverBoard();
    expect(cloud.rows(document)).toEqual([]);
  });
});

describe('server profile', () => {
  // The page-world script, which answers from the page's jQuery when there is one.
  beforeAll(() => answerRowKeys(window));
  afterEach(() => {
    delete page.jQuery;
  });

  it('finds the collapsed rows, their ids and their titles', () => {
    page.jQuery = pageQuery({ 'taskboard-summary-row-16': '__null', 'taskboard-summary-row-18': 655 });
    document.body.innerHTML = serverBoard();
    const rows = server.rows(document);
    expect(rows.map((row) => server.idOf(row))).toEqual(['687', null, '655']);
    expect(rows.map((row) => server.titleOf(row)?.textContent)).toEqual([
      'KYOTO tools behind prod Authentik',
      'Unparented',
      'Story that was never expanded',
    ]);
  });

  it('does not give a row the id of the story above, whose content row stands right before it', () => {
    document.body.innerHTML = serverBoard();
    const row = document.getElementById('taskboard-summary-row-18')!;
    expect(row.previousElementSibling?.querySelector('td.taskboard-parent')?.id).toBe('taskboard-table-body_p701');
    expect(server.idOf(row)).toBeNull();
  });

  it('reads the id of a row with a content row of its own without asking the page', () => {
    page.jQuery = pageQuery({ 'taskboard-summary-row-15': 1 });
    document.body.innerHTML = serverBoard();
    expect(server.idOf(document.getElementById('taskboard-summary-row-15')!)).toBe('687');
  });

  it('has no id for the Unparented row, which is story 0 on its content row', () => {
    document.body.innerHTML = serverBoard();
    const row = document.getElementById('taskboard-summary-row-16')!;
    expect(row.previousElementSibling?.querySelector('td.taskboard-parent')?.id).toBe('taskboard-table-body_p0');
    expect(server.idOf(row)).toBeNull();
  });

  it('has no id for a row that is a person, where the number on the content row is a task', () => {
    document.body.innerHTML = serverBoard();
    const row = document.getElementById('taskboard-summary-row-15')!;
    row.querySelector('.witTitle')!.classList.add('peopleClassification');
    expect(server.idOf(row)).toBeNull();
  });

  it('finds no rows on a cloud board', () => {
    document.body.innerHTML = cloudBoard();
    expect(server.rows(document)).toEqual([]);
  });
});
