import { describe, expect, it, type Mock, vi } from 'vitest';
import { apiRoot, BATCH, WorkItemStates } from './state';

describe('apiRoot', () => {
  it.each([
    ['/kudotechnologies/scrum-test/_sprints/taskboard/scrum-test-team/scrum-test/sprint-1', '/kudotechnologies'],
    ['/scrum-test/_sprints/taskboard/scrum-test-team/scrum-test/sprint-1', ''],
    ['/tfs/FiuCollection/flp/_sprints/taskboard/flp%20Team/flp/november%202026', '/tfs/FiuCollection'],
    ['/tfs/FiuCollection/flp/_sprints', '/tfs/FiuCollection'],
  ])('%s → %s', (pathname, root) => {
    expect(apiRoot(pathname)).toBe(root);
  });

  it('is null off the sprint pages', () => {
    expect(apiRoot('/kudotechnologies/scrum-test/_backlogs/backlog')).toBeNull();
    expect(apiRoot('/_sprints/x')).toBeNull();
  });
});

function answer(items: Record<string, string>, status = 200): Response {
  const value = Object.entries(items).map(([id, state]) => ({ id: Number(id), fields: { 'System.State': state } }));
  return new Response(JSON.stringify({ count: value.length, value }), { status });
}

const ROOT = '/kudotechnologies';

/** What the nth call asked for. */
function call(fetchImpl: Mock<typeof fetch>, index: number): { url: string; init: RequestInit | undefined } {
  const args = fetchImpl.mock.calls[index];
  if (!args) throw new Error(`fetch was called ${fetchImpl.mock.calls.length} times, not ${index + 1}`);
  return { url: String(args[0]), init: args[1] };
}

describe('WorkItemStates', () => {
  it('asks the server once for the ids, with the user session, and says when the answer is in', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => answer({ 6: 'Committed', 7: 'Done' }));
    const onChange = vi.fn();
    const states = new WorkItemStates(onChange, fetchImpl);

    states.request(ROOT, ['6', '7', '6']);
    expect(states.get('6')).toBeUndefined();
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

    expect(states.get('6')).toBe('Committed');
    expect(states.get('7')).toBe('Done');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const { url, init } = call(fetchImpl, 0);
    expect(url).toBe(
      '/kudotechnologies/_apis/wit/workitems?ids=6,7&fields=System.Id,System.State&errorPolicy=omit&api-version=6.0',
    );
    expect(init?.credentials).toBe('same-origin');
    expect(init?.headers).toEqual({ Accept: 'application/json', 'X-TFS-FedAuthRedirect': 'Suppress' });
  });

  it('asks again for an id it already knows, and keeps quiet when nothing changed', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => answer({ 6: 'Committed' }));
    const onChange = vi.fn();
    const states = new WorkItemStates(onChange, fetchImpl);

    states.request(ROOT, ['6']);
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    states.request(ROOT, ['6']);
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(states.get('6')).toBe('Committed');
  });

  it('does not ask twice while an answer is on its way', async () => {
    let release!: (response: Response) => void;
    const fetchImpl = vi.fn<typeof fetch>(() => new Promise<Response>((resolve) => (release = resolve)));
    const states = new WorkItemStates(vi.fn(), fetchImpl);

    states.request(ROOT, ['6']);
    states.request(ROOT, ['6', '7']);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(call(fetchImpl, 1).url).toContain('ids=7&');
    release(answer({}));
  });

  it('splits more than 200 ids over several calls', () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => answer({}));
    const states = new WorkItemStates(vi.fn(), fetchImpl);
    const ids = Array.from({ length: BATCH + 1 }, (_, index) => String(index + 1));

    states.request(ROOT, ids);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(call(fetchImpl, 1).url).toContain(`ids=${BATCH + 1}&`);
  });

  it('leaves ids alone that got no answer, until the next refresh', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(answer({ 6: 'Committed' }))
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValue(answer({ 7: 'Done', 9: 'New' }));
    const states = new WorkItemStates(vi.fn(), fetchImpl);

    // 7 is omitted from the first answer, 9 gets a 401.
    states.request(ROOT, ['6', '7']);
    await vi.waitFor(() => expect(states.get('6')).toBe('Committed'));
    states.request(ROOT, ['9']);
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
    await Promise.resolve();

    states.request(ROOT, ['7', '9']);
    expect(fetchImpl).toHaveBeenCalledTimes(2);

    states.refresh();
    states.request(ROOT, ['7', '9']);
    await vi.waitFor(() => expect(states.get('9')).toBe('New'));
    expect(states.get('7')).toBe('Done');
  });

  it('survives a network error', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new TypeError('Failed to fetch');
    });
    const onChange = vi.fn();
    const states = new WorkItemStates(onChange, fetchImpl);

    states.request(ROOT, ['6']);
    await Promise.resolve();
    await Promise.resolve();

    expect(states.get('6')).toBeUndefined();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('starts over on a page under another root', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => answer({ 6: 'Committed' }));
    const states = new WorkItemStates(vi.fn(), fetchImpl);

    states.request(ROOT, ['6']);
    await vi.waitFor(() => expect(states.get('6')).toBe('Committed'));
    states.request('/tfs/Other', []);

    expect(states.get('6')).toBeUndefined();
  });
});
