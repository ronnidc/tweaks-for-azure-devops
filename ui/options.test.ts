import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { loadSettings } from '@/platform/settings';
import { mountOptions } from './options';

function checkbox(name: string): HTMLInputElement {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
}

describe('options page', () => {
  beforeEach(async () => {
    document.body.innerHTML = '';
    await mountOptions(document.body);
  });

  it('shows a switch per tweak, all on, and saves a change', async () => {
    expect(document.querySelectorAll('.switch')).toHaveLength(2);
    expect(checkbox('taskboardId').checked).toBe(true);
    expect(checkbox('taskboardState').checked).toBe(true);

    checkbox('taskboardState').click();

    await vi.waitFor(async () => expect(await loadSettings()).toEqual({ taskboardId: true, taskboardState: false }));
  });

  it('asks the browser for access to a server the user adds, and lists it', async () => {
    const address = document.querySelector<HTMLInputElement>('input[name="site"]')!;
    const granted = ['https://azure.example.com/*'];
    fakeBrowser.permissions.request = vi.fn(async () => {
      fakeBrowser.permissions.getAll = vi.fn(async () => ({ origins: granted, permissions: [] }));
      return true;
    });

    expect(document.querySelector('.sites')?.textContent).toContain('No server added yet');
    address.value = 'azure.example.com/tfs/DefaultCollection';
    document.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(fakeBrowser.permissions.request).toHaveBeenCalledWith({ origins: ['https://azure.example.com/*'] });
    await vi.waitFor(() => expect(document.querySelector('.sites')?.textContent).toContain('azure.example.com'));
    expect(address.value).toBe('');

    document.querySelector<HTMLButtonElement>('.sites button')!.click();
    expect(fakeBrowser.permissions.remove).toHaveBeenCalledWith({ origins: ['https://azure.example.com/*'] });
  });

  it('explains what it cannot add', () => {
    const address = document.querySelector<HTMLInputElement>('input[name="site"]')!;
    const error = document.querySelector<HTMLElement>('.error')!;
    expect(error.hidden).toBe(true);

    address.value = 'not a host';
    document.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(error.hidden).toBe(false);
    expect(error.textContent).toContain('not a web address');

    address.value = 'https://dev.azure.com/kudotechnologies';
    document.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(error.textContent).toContain('built in');
    expect(fakeBrowser.permissions.request).not.toHaveBeenCalled();
  });

  it('shows the version and the two ways to send feedback', () => {
    const footer = document.querySelector('footer')!;
    expect(footer.textContent).toContain('Tweaks for Azure DevOps 0.1.0');
    const links = [...footer.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links[0]).toMatch(/^mailto:support@ronnidc\.com\?subject=/);
    expect(links[1]).toMatch(/^https:\/\/github\.com\/ronnidc\/tweaks-for-azure-devops\/issues\/new\/choose\?version=0\.1\.0/);
  });
});
