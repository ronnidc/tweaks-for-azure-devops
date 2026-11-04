/**
 * The Azure DevOps hosts. The cloud is known and in the manifest. A server of
 * the user's own has a name nobody can guess, so the user adds it on the
 * options page, one at a time, and the extension asks the browser for access
 * to that one site.
 */

/**
 * The cloud, under both of its names. Every page of it, not only the sprint
 * pages: Azure DevOps switches between its hubs without a page load, so a
 * script matched on the sprint pages alone would miss a user who came in
 * through Backlogs. The script itself does nothing off the sprint pages.
 */
export const CLOUD_MATCHES = ['https://dev.azure.com/*', 'https://*.visualstudio.com/*'];

const CLOUD_HOSTS = [/^dev\.azure\.com$/, /\.visualstudio\.com$/];

export function isCloudHost(host: string): boolean {
  return CLOUD_HOSTS.some((cloud) => cloud.test(host));
}

export interface Site {
  /** The origin pattern the browser granted, which is what gives access back. */
  pattern: string;
  /** The host, for the list on the options page. */
  host: string;
}

// Labels of letters, digits and hyphens, dotted: a host name, an IPv4 address,
// or an internationalized name as the URL parser hands it back, in punycode.
const HOST_NAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

/**
 * The origin of what the user typed: a host, or an address copied from the
 * browser, with or without a scheme. Null when it is not a web address. The
 * parser alone is not the judge: Chrome lets a space through as %20 where
 * other engines give up.
 */
export function siteOrigin(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  const address = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(address);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!HOST_NAME.test(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** The access to ask the browser for, and the content script's match once granted: the whole site, as for the cloud. */
export function sitePattern(origin: string): string {
  return `${origin}/*`;
}

/**
 * The sites the user added, from everything the browser says the extension
 * may access. The cloud is left out: it is in the manifest, and some browsers
 * report the manifest's own patterns too.
 */
export function addedSites(granted: readonly string[]): Site[] {
  const sites: Site[] = [];
  for (const pattern of granted) {
    const host = /^[^:]+:\/\/([^/]+)\//.exec(pattern)?.[1];
    if (!host || isCloudHost(host)) continue;
    sites.push({ pattern, host });
  }
  return sites;
}
