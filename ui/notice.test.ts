import { beforeEach, describe, expect, it } from 'vitest';
import { NAME } from '@/core/feedback';
import { NOTICE_CLASS, unreadableNotice } from './notice';

const hosts = () => document.querySelectorAll(`.${NOTICE_CLASS}`);
/** What the notice draws, inside its shadow tree. */
const drawn = () => hosts()[0]!.shadowRoot!;

describe('unreadableNotice', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main>The taskboard</main>';
  });

  it('says who is speaking and offers the bug form and a mail, both with the version and the problem', () => {
    unreadableNotice('0.1.0').show();

    const notice = drawn().querySelector('[role="status"]')!;
    expect(notice.textContent).toContain(`${NAME} cannot read the work item ID`);
    const [issue, mail] = [...notice.querySelectorAll('a')];
    const form = new URL(issue!.href);
    expect(form.origin + form.pathname).toBe('https://github.com/ronnidc/tweaks-for-azure-devops/issues/new');
    expect(form.searchParams.get('template')).toBe('bug.yml');
    expect(form.searchParams.get('version')).toBe('0.1.0');
    expect(form.searchParams.get('what')).toMatch(/cannot be read/);
    expect(issue!.target).toBe('_blank');
    expect(decodeURIComponent(mail!.href)).toMatch(/^mailto:support@ronnidc\.com\?subject=.* 0\.1\.0&body=.*cannot be read/s);
    expect(mail!.target).toBe('');
  });

  it('keeps what it draws and its stylesheet in a shadow tree, out of the page and out of reach of its styles', () => {
    unreadableNotice('0.1.0').show();

    const host = hosts()[0]!;
    expect(host.parentElement).toBe(document.body);
    expect(host.childNodes).toHaveLength(0);
    expect(drawn().querySelector('style')).not.toBeNull();
  });

  it('is on the page once, however often it is shown, and goes when it is hidden', () => {
    const notice = unreadableNotice('0.1.0');
    notice.show();
    notice.show();
    expect(hosts()).toHaveLength(1);

    notice.hide();
    expect(hosts()).toHaveLength(0);

    notice.show();
    expect(hosts()).toHaveLength(1);
  });

  it('comes back when the page has thrown it out', () => {
    const notice = unreadableNotice('0.1.0');
    notice.show();
    document.body.innerHTML = '';

    notice.show();
    expect(hosts()).toHaveLength(1);
  });

  it('stays away once the user has closed it', () => {
    const notice = unreadableNotice('0.1.0');
    notice.show();
    drawn().querySelector('button')!.click();
    expect(hosts()).toHaveLength(0);

    notice.show();
    expect(hosts()).toHaveLength(0);
  });
});
