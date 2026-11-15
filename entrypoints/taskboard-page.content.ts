import { CLOUD_MATCHES } from '@/core/sites';
import { answerRowKeys } from '@/core/taskboard/row-keys';

export default defineContentScript({
  // Wherever the taskboard script runs: the cloud from the manifest, and the
  // servers the user adds through the background script.
  matches: CLOUD_MATCHES,
  // The page's own world, the only place the older taskboard's script data can
  // be read from. There is no extension API here, and none is needed.
  world: 'MAIN',
  // Before the taskboard script, which runs at document_idle and asks at once.
  runAt: 'document_start',

  main() {
    answerRowKeys(window);
  },
});
