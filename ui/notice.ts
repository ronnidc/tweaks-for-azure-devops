import { describeBrowser, feedbackLinks, NAME } from '@/core/feedback';
import type { Notice } from '@/core/taskboard/watch';
import { h } from './dom';
import styles from './notice.css?inline';

/** On the element that holds the notice in the page. */
export const NOTICE_CLASS = 'tfad-notice';

// What a report sent from the notice opens with, in the mail and in the bug form.
const PROBLEM = 'The taskboard notice says the work item IDs cannot be read';

/**
 * A line at the top of the page for when rows that have a work item do not
 * give up its id, which is what a change in Azure DevOps looks like from
 * here. It says who is speaking and what is missing, and offers the two ways
 * to report it. Closed by the user, it stays away for the life of the page.
 *
 * It is drawn in a shadow tree that brings its own stylesheet, and not from
 * the content script's stylesheet. Without its styles the notice is a block of
 * text in the page's own layout that pushes the page aside, and a browser
 * loads a content script and its stylesheet separately: Firefox keeps the
 * stylesheet for as long as a tab uses it, while it reads the script again
 * after five minutes. In a shadow tree the styles come with the script, and
 * the page's own styles for links and buttons stay out.
 */
export function unreadableNotice(version: string): Notice {
  let host: HTMLElement | undefined;
  let closed = false;

  function build(): HTMLElement {
    const links = feedbackLinks({ version, browser: describeBrowser(navigator.userAgent), problem: PROBLEM });
    const element = h('div', { class: NOTICE_CLASS });
    element.attachShadow({ mode: 'open' }).append(
      h('style', {}, styles),
      h(
        'div',
        { class: 'notice', role: 'status' },
        h(
          'span',
          {},
          h('strong', {}, NAME),
          ' cannot read the work item ID on some rows of this taskboard. If it keeps happening after a reload, ',
          h('a', { href: links.issues, target: '_blank', rel: 'noopener' }, 'open an issue on GitHub'),
          ' or ',
          h('a', { href: links.mail }, 'write a mail'),
          '.',
        ),
        h('button', { type: 'button', class: 'close', 'aria-label': 'Close', onclick: close }, '×'),
      ),
    );
    return element;
  }

  function close() {
    closed = true;
    host?.remove();
  }

  return {
    show() {
      if (closed || host?.isConnected) return;
      host ??= build();
      document.body.append(host);
    },
    hide() {
      host?.remove();
    },
  };
}
