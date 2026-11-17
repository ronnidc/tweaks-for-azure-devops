import { describe, expect, it } from 'vitest';
import { describeBrowser, feedbackLinks } from './feedback';

const CHROME_ON_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

describe('describeBrowser', () => {
  it('names the browser, its version and the system', () => {
    expect(describeBrowser(CHROME_ON_MAC)).toBe('Chrome 141 on macOS');
    expect(describeBrowser('something else')).toBe('');
  });
});

describe('feedbackLinks', () => {
  const sender = { version: '0.1.0', browser: 'Chrome 141 on macOS' };

  it('opens a mail and the choice between the issue forms, with the version and the browser', () => {
    const links = feedbackLinks(sender);
    expect(decodeURIComponent(links.mail)).toBe(
      'mailto:support@ronnidc.com?subject=Tweaks for Azure DevOps 0.1.0&body=Browser: Chrome 141 on macOS\r\n\r\n',
    );
    expect(links.issues).toBe(
      'https://github.com/ronnidc/tweaks-for-azure-devops/issues/new/choose?version=0.1.0&browser=Chrome+141+on+macOS',
    );
  });

  it('leaves the browser out when it is not known', () => {
    const links = feedbackLinks({ version: '0.1.0', browser: '' });
    expect(links.mail).not.toContain('body=');
    expect(links.issues).toMatch(/choose\?version=0\.1\.0$/);
  });

  it('writes a problem into the mail and opens the bug form with it', () => {
    const links = feedbackLinks({ ...sender, problem: 'The ids cannot be read' });
    expect(decodeURIComponent(links.mail)).toContain('&body=Browser: Chrome 141 on macOS\r\nThe ids cannot be read\r\n\r\n');

    const form = new URL(links.issues);
    expect(form.pathname).toBe('/ronnidc/tweaks-for-azure-devops/issues/new');
    expect(Object.fromEntries(form.searchParams)).toEqual({
      version: '0.1.0',
      browser: 'Chrome 141 on macOS',
      template: 'bug.yml',
      title: 'The ids cannot be read',
      what: 'The ids cannot be read',
    });
  });
});
