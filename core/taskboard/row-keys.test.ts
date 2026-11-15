import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pageQuery, serverBoard } from '../../test/boards';
import { answerRowKeys, KEY_ATTRIBUTE, rowKey } from './row-keys';

const page = window as Window & { jQuery?: unknown };
const ROW = 'taskboard-summary-row-18';

function drawnRow(): Element {
  document.body.innerHTML = serverBoard();
  return document.getElementById(ROW)!;
}

describe('row keys', () => {
  beforeAll(() => answerRowKeys(window));
  afterEach(() => {
    delete page.jQuery;
  });

  it('gets the key the page keeps for the row, and asks once', () => {
    const keys: Record<string, unknown> = { [ROW]: 655 };
    page.jQuery = pageQuery(keys);
    const row = drawnRow();
    expect(rowKey(row)).toBe('655');

    keys[ROW] = 656;
    expect(rowKey(row)).toBe('655');
  });

  it('asks again about a row that is drawn again', () => {
    const keys: Record<string, unknown> = { [ROW]: 655 };
    page.jQuery = pageQuery(keys);
    expect(rowKey(drawnRow())).toBe('655');

    keys[ROW] = 656;
    expect(rowKey(drawnRow())).toBe('656');
  });

  it('hands a key that is not a number on as it is', () => {
    page.jQuery = pageQuery({ [ROW]: '__null' });
    expect(rowKey(drawnRow())).toBe('__null');
  });

  it('gets an empty answer for a row the page keeps no key for', () => {
    page.jQuery = pageQuery({});
    const row = drawnRow();
    expect(rowKey(row)).toBe('');
    expect(row.getAttribute(KEY_ATTRIBUTE)).toBe('');
  });

  it('gets no answer on a page without jQuery, and asks again the next time', () => {
    const row = drawnRow();
    expect(rowKey(row)).toBeNull();

    page.jQuery = pageQuery({ [ROW]: 655 });
    expect(rowKey(row)).toBe('655');
  });
});
