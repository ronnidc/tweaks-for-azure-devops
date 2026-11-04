import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // WXT builds Manifest V2 for Firefox by default. One version everywhere keeps
  // all three browsers on the same APIs.
  manifestVersion: 3,
  webExt: {
    binaries: {
      // The script explains why Firefox cannot be started directly on macOS.
      ...(process.platform === 'darwin' && {
        firefox: resolve('scripts/firefox-via-open.sh'),
      }),
    },
  },
  zip: {
    // Mozilla's reviewers rebuild the extension from the sources zip, so it
    // carries the Node version and leaves out the store material.
    includeSources: ['**/*', '.nvmrc'],
    excludeSources: ['store/**'],
  },
  manifest: ({ browser }) => ({
    name: 'Tweaks for Azure DevOps',
    // For the places a browser has room for 12 characters only.
    short_name: 'AzDO Tweaks',
    description:
      'The features Azure DevOps forgot: the work item ID and state on collapsed taskboard rows, with one switch per tweak.',
    homepage_url: 'https://github.com/ronnidc/tweaks-for-azure-devops',
    // storage for the switches, scripting to register the taskboard script on
    // the servers the user adds.
    permissions: ['storage', 'scripting'],
    // The cloud is in the content script's own matches. A server of the user's
    // own has a name nobody can guess, so access to it is asked for when the
    // user adds it on the options page, one site at a time.
    optional_host_permissions: ['*://*/*'],
    // Chrome and Edge warn about manifest keys they do not know.
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          // Permanent once the first version is uploaded to AMO.
          id: 'tweaks-for-azure-devops@ronnidc',
          // Desktop reads data_collection_permissions from 140, Android from
          // 142, and the linter holds Android to this minimum when there is
          // no gecko_android key, so 142 keeps the lint clean.
          strict_min_version: '142.0',
          data_collection_permissions: {
            required: ['none'],
          },
        },
        // No gecko_android key: AMO would list the extension for Firefox for
        // Android, where it has not been tried.
      },
    }),
  }),
});
