import { FEATURES, type Settings } from '@/core/features';
import { describeBrowser, feedbackLinks, NAME, TAGLINE } from '@/core/feedback';
import { isCloudHost, siteOrigin, type Site } from '@/core/sites';
import { browser } from '@/platform/browser';
import { loadSettings, saveSettings } from '@/platform/settings';
import { addSite, listSites, onSitesChange, removeSite } from '@/platform/sites';
import { fill, h } from './dom';

/**
 * The options page: one switch per tweak, the servers the user has added, and
 * the ways to reach the developer.
 */
export async function mountOptions(root: HTMLElement): Promise<void> {
  let settings = await loadSettings();

  const sites = h('ul', { class: 'sites' });
  const error = h('p', { class: 'error', role: 'alert', hidden: true });
  const address = h('input', {
    type: 'text',
    name: 'site',
    placeholder: 'https://azuredevops.example.com',
    autocomplete: 'off',
    spellcheck: 'false',
  });

  function toggle(key: keyof Settings) {
    return (event: Event) => {
      settings = { ...settings, [key]: (event.target as HTMLInputElement).checked };
      void saveSettings(settings);
    };
  }

  async function renderSites() {
    const added = await listSites();
    fill(
      sites,
      added.length === 0 && h('li', { class: 'muted' }, 'No server added yet.'),
      ...added.map((site) =>
        h(
          'li',
          {},
          h('span', {}, site.host),
          h('button', { type: 'button', class: 'link', onclick: () => void forget(site) }, 'Remove'),
        ),
      ),
    );
  }

  async function forget(site: Site) {
    await removeSite(site);
    await renderSites();
  }

  function complain(message: string) {
    error.textContent = message;
    error.hidden = false;
  }

  function add(event: Event) {
    event.preventDefault();
    const origin = siteOrigin(address.value);
    if (!origin) return complain('That is not a web address.');
    if (isCloudHost(new URL(origin).hostname)) {
      return complain('dev.azure.com and visualstudio.com are built in, nothing to add.');
    }
    // Directly in the handler, before any await: Firefox wants the user gesture.
    void addSite(origin).then(async (granted) => {
      if (!granted) return complain('The browser did not give access to that site.');
      address.value = '';
      error.hidden = true;
      await renderSites();
    });
  }

  const { version } = browser.runtime.getManifest();
  const links = feedbackLinks({ version, browser: describeBrowser(navigator.userAgent) });

  fill(
    root,
    h('header', { class: 'masthead' }, h('h1', {}, NAME), h('p', { class: 'tagline muted' }, TAGLINE)),
    h(
      'main',
      {},
      h(
        'section',
        {},
        h('h2', {}, 'Tweaks'),
        ...FEATURES.map((feature) =>
          h(
            'label',
            { class: 'switch' },
            h('input', { type: 'checkbox', name: feature.key, checked: settings[feature.key], onchange: toggle(feature.key) }),
            h('span', { class: 'text' }, h('span', { class: 'name' }, feature.name), h('span', { class: 'muted' }, feature.description)),
          ),
        ),
      ),
      h(
        'section',
        {},
        h('h2', {}, 'Your own Azure DevOps Server'),
        h(
          'p',
          { class: 'muted' },
          'The tweaks work on dev.azure.com and visualstudio.com from the start. A server of your own has a name only you know: add it here, and the browser asks you for access to that one site.',
        ),
        sites,
        h(
          'form',
          { class: 'add-site', onsubmit: add },
          h('label', {}, 'Server address', address),
          h('button', { type: 'submit', class: 'primary' }, 'Add this site'),
        ),
        error,
      ),
    ),
    h(
      'footer',
      {},
      h(
        'p',
        {},
        `${NAME} ${version}. Something not working, or an idea? `,
        h('a', { href: links.mail }, 'Write a mail'),
        ' or ',
        h('a', { href: links.issues, target: '_blank', rel: 'noopener' }, 'open an issue on GitHub'),
        '.',
      ),
    ),
  );
  await renderSites();
  onSitesChange(() => void renderSites());
}
