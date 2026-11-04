/**
 * The state of work items, read from the Azure DevOps server the page comes
 * from with the user's own session: a same-origin GET of the REST API, the
 * same kind of call the page itself makes. Nothing leaves that server.
 */

/** The API answers at most this many ids per call. */
export const BATCH = 200;

// The oldest version both hosts answer. Verified on Azure DevOps Server
// 2026-11-04, the cloud answers every version from 4.1 on.
const API_VERSION = '6.0';

const SPRINTS_HUB = /^(.*)\/[^/]+\/_sprints(?:\/|$)/;

/**
 * The REST root for a sprint page: the path before the project. The cloud has
 * the organization there (`/{org}/{project}/_sprints/...`), a server its
 * virtual directory and collection (`/tfs/{collection}/{project}/_sprints/...`),
 * and on `{org}.visualstudio.com` the project comes first and the root is
 * empty. Null when the path is not a sprint page.
 */
export function apiRoot(pathname: string): string | null {
  return SPRINTS_HUB.exec(pathname)?.[1] ?? null;
}

interface WorkItemsAnswer {
  value?: { id?: number; fields?: Record<string, unknown> }[];
}

export class WorkItemStates {
  private readonly states = new Map<string, string>();
  /** Asked for, no answer yet. */
  private readonly pending = new Set<string>();
  /** Asked for and not answered: no session, no access, no such item. Left alone until the next refresh. */
  private readonly failed = new Set<string>();
  private root: string | null = null;

  constructor(
    private readonly onChange: () => void,
    private readonly fetchImpl: typeof fetch = (input, init) => fetch(input, init),
  ) {}

  get(id: string): string | undefined {
    return this.states.get(id);
  }

  /**
   * Looks the ids up, in one call per 200, except those already on their way
   * and those that failed since the last refresh. Known states stay on show
   * while the answer is on its way. A page under another root is another
   * collection with ids of its own, so everything starts over.
   */
  request(root: string, ids: Iterable<string>): void {
    if (root !== this.root) {
      this.root = root;
      this.states.clear();
      this.pending.clear();
      this.failed.clear();
    }
    const wanted = [...new Set(ids)].filter((id) => !this.pending.has(id) && !this.failed.has(id));
    for (const id of wanted) this.pending.add(id);
    for (let start = 0; start < wanted.length; start += BATCH) {
      void this.load(root, wanted.slice(start, start + BATCH));
    }
  }

  /** Lets failed ids be asked for again, for when the tab comes back into view. */
  refresh(): void {
    this.failed.clear();
  }

  private async load(root: string, ids: string[]): Promise<void> {
    const answered = new Map<string, string>();
    try {
      // errorPolicy=omit leaves an id that no longer exists out of the answer
      // instead of failing the whole call. The header turns the redirect to the
      // login page that an expired session gets into a plain 401.
      const url =
        `${root}/_apis/wit/workitems?ids=${ids.join(',')}` +
        `&fields=System.Id,System.State&errorPolicy=omit&api-version=${API_VERSION}`;
      const response = await this.fetchImpl(url, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-TFS-FedAuthRedirect': 'Suppress' },
      });
      if (response.ok) {
        const { value = [] } = (await response.json()) as WorkItemsAnswer;
        for (const item of value) {
          const state = item.fields?.['System.State'];
          if (item.id !== undefined && typeof state === 'string') answered.set(String(item.id), state);
        }
      }
    } catch {
      // No network, no state: the rows stand without until the next refresh.
    }
    if (root !== this.root) return;
    let changed = false;
    for (const id of ids) {
      this.pending.delete(id);
      const state = answered.get(id);
      if (state === undefined) {
        this.failed.add(id);
        continue;
      }
      if (this.states.get(id) !== state) {
        this.states.set(id, state);
        changed = true;
      }
    }
    if (changed) this.onChange();
  }
}
