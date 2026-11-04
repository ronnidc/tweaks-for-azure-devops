import { describe, expect, it } from 'vitest';
import { cloudBoard, serverBoard } from '../../test/boards';
import { cloud, server } from './profiles';

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
  it('finds the collapsed rows, their ids and their titles', () => {
    document.body.innerHTML = serverBoard();
    const rows = server.rows(document);
    expect(rows.map((row) => server.idOf(row))).toEqual(['687', null]);
    expect(rows.map((row) => server.titleOf(row)?.textContent)).toEqual(['KYOTO tools behind prod Authentik', 'Unparented']);
  });

  it('gives a summary row without a content row before it no id', () => {
    document.body.innerHTML = serverBoard();
    const row = server.rows(document)[0]!;
    row.previousElementSibling?.remove();
    expect(server.idOf(row)).toBeNull();
  });

  it('finds no rows on a cloud board', () => {
    document.body.innerHTML = cloudBoard();
    expect(server.rows(document)).toEqual([]);
  });
});
