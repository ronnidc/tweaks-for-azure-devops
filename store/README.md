# Publishing Tweaks for Azure DevOps

Everything the three stores ask for, so a release is uploads and form filling. The texts are in `listing.en.md`, the images in `images/`, and this file has the answers to the forms. The procedure is the one Shop Again? uses, kept here in full so this repository stands on its own.

## What is in this folder

| File | Is |
|---|---|
| `listing.en.md` | Name, short description, summary, description and search terms |
| `images/` | What gets uploaded: the Edge logo, the screenshots and the promotional tiles |

The icon and the screenshots are not made yet. Screenshots are taken in a test organization with made-up stories, never from a customer's board.

## Images the stores take

| Image | Chrome Web Store | Edge Add-ons | Firefox Add-ons |
|---|---|---|---|
| Store icon or logo | 128 x 128, `public/icon/128.png`, uploaded on the listing | 300 x 300, `images/logo-300.png` | 128 x 128, `public/icon/128.png`, uploaded under Manage Listing, Images, or the listing shows a puzzle piece |
| Screenshots | 1280 x 800, at least 1, at most 5 | 1280 x 800, at most 6 | Any size, optional |
| Small promotional tile | 440 x 280, listings without one are ranked after those with one | 440 x 280, optional | Not used |
| Marquee or large tile | 1400 x 560, optional | 1400 x 560, optional | Not used |

Screenshots are full bleed, no padding, no rounded corners. The icon has an alpha channel, otherwise Chrome frames it.

## A release

1. Set the version in `package.json` and move the changes in `CHANGELOG.md` from Unreleased to a release section with today's date.
2. `npm test && npm run compile && npm run build:firefox && npm run lint:firefox`.
3. `npm run zip && npm run zip:firefox`, which leaves three files in `.output/`: `tweaks-for-azure-devops-X.Y.Z-chrome.zip` for Chrome and Edge, `tweaks-for-azure-devops-X.Y.Z-firefox.zip` for Firefox, and `tweaks-for-azure-devops-X.Y.Z-sources.zip` for Mozilla's reviewers.
4. Commit, tag `vX.Y.Z`, push, and make the GitHub release from the tag with the changelog section as its notes: `gh release create vX.Y.Z --title X.Y.Z --notes-file <notes>`. Notes only, no packages: the stores are the distribution, and the Firefox zip is unsigned anyway.
5. Upload to the three stores as below. A release only reaches users when each store has reviewed it, which takes from hours (Firefox, usually) to days (Chrome, up to a week for the first version, Edge up to seven business days).

## Answers the forms ask for

The same answers go to Chrome and Edge, and Firefox asks for a subset.

**Single purpose.** Adds small missing features to the Azure DevOps web pages the user is on, starting with the work item ID and state on collapsed rows of the sprint taskboard.

**Permission justifications.**

- `storage`: The settings, which tweaks are on, are kept in the browser's sync storage so they follow the user's browser account.
- `scripting`: To register the taskboard content script for exactly the Azure DevOps Server sites the user has added and given access to, with `scripting.registerContentScripts`. The cloud sites are in the manifest. No script runs anywhere else.
- Host permissions (`optional_host_permissions`, `*://*/*`): Not requested at install. Azure DevOps Server, the on-premises product, runs under an address only its users know. When the user adds their server on the options page, the extension asks for access to that one site, which is what lets the tweaks run there. Access is given back when the user removes the site.
- Content script matches (`https://dev.azure.com/*`, `https://*.visualstudio.com/*`): The Azure DevOps cloud under both of its names. Azure DevOps moves between its pages without a page load, so the script has to be on every page of the site to be there when the sprint taskboard appears. Off the taskboard it does nothing.

**Remote code.** No.

**Data usage.** The extension collects no user data. It reads the IDs of the collapsed rows from the page and the state of those work items from the same Azure DevOps server, with the user's own session, and shows them on the page. Nothing is sent anywhere else: no server of the developer's, no analytics. Certify the limited use disclosures.

**Privacy policy URL.** https://github.com/ronnidc/tweaks-for-azure-devops/blob/main/PRIVACY.md. The repository has to be public for the URL to work, and the stores check it.

**Homepage, support site and support email.** https://github.com/ronnidc/tweaks-for-azure-devops, https://github.com/ronnidc/tweaks-for-azure-devops/issues and support@ronnidc.com. Chrome has no support email field: the listing shows the developer account's verified contact email, which is set to the same address on the account page.

**Notes to the reviewers.** Paste as is:

> Tweaks for Azure DevOps adds small features to Azure DevOps web pages. To test you need an Azure DevOps account (free at https://dev.azure.com) with a project that has a sprint and a user story with a task. Open Boards, Sprints, Taskboard and collapse the story row with the arrow in front of it: the extension puts the work item ID in front of the title and the state after it. The state comes from a same-origin GET to the Azure DevOps REST API with the user's own session. The options page has a switch per tweak and a form to add an Azure DevOps Server of one's own, which asks for access to that one site. There is no server of ours, no network request to anyone but the Azure DevOps server the page is on, and no remote code. The source builds with Node 24 and npm: `npm ci` and `npm run build:firefox` (or `npm run build` for Chrome), see "Building from source" in the README.

Chrome's test instructions field (under Access) takes 500 characters, so Chrome gets this one:

> Adds small features to Azure DevOps pages. To test: sign in at dev.azure.com (free), open a project's Boards, Sprints, Taskboard, and collapse a story row with the arrow in front of it. The extension puts the work item ID in front of the title and the state after it, read with a same-origin GET to the Azure DevOps REST API with the user's own session. Options: a switch per tweak, and a form to add one's own Azure DevOps Server. No server of ours, no remote code. Source: github.com/ronnidc/tweaks-for-azure-devops

## Chrome Web Store

- Account: https://chrome.google.com/webstore/devconsole, already registered for Shop Again?.
- New item, upload `tweaks-for-azure-devops-X.Y.Z-chrome.zip`.
- Store listing: the description from `listing.en.md`, category Developer Tools, language English. Upload the screenshots and the promotional tiles from `images/`. The store icon is `public/icon/128.png`, which the listing asks for although the package carries it.
- Privacy practices: single purpose, permission justifications, remote code and data usage from above, and the privacy policy URL and the contact email under the account's settings.
- Distribution: public, all regions, free.
- Submit for review. New items with a broad optional host permission can take longer.

## Edge Add-ons

- Account: https://partner.microsoft.com/dashboard/microsoftedge, already registered.
- Create new extension, upload `tweaks-for-azure-devops-X.Y.Z-chrome.zip`.
- Availability: public, all markets.
- Properties: category Developer tools, website and support contact from above.
- Privacy: the same answers as Chrome.
- Store listings: one row, English. It needs the description and the logo (`images/logo-300.png`). The name and the short description come from the manifest.
- Publish asks whether a tester needs credentials or other info. Answer yes, although there are no credentials: no disables the notes field, and the tweak is conditional on an Azure DevOps account and a collapsed row, which is what the notes explain. Paste the reviewer notes above, up to 2,000 characters, and publish.

## Firefox Add-ons

- Account: https://addons.mozilla.org/developers/, already registered.
- Submit a new add-on, listed on this site, upload `tweaks-for-azure-devops-X.Y.Z-firefox.zip`.
- The build is bundled and minified, so answer yes to "Do you need to submit source code?" and upload `tweaks-for-azure-devops-X.Y.Z-sources.zip`. The README in it has the build instructions. Mozilla rebuilds the package and diffs it against the upload, and the build is deterministic, so they match.
- Listing: name, summary and description from `listing.en.md`, category Web Development, support site and support email, license GNU General Public License v3.0 from the menu, privacy policy pasted in full (AMO wants the text, not a link). Screenshots are optional and take any size, and they are uploaded after the submission under Manage Listing, Images.
- Notes to reviewer: the reviewer notes above.
- The add-on ID `tweaks-for-azure-devops@ronnidc` in `wxt.config.ts` is permanent from the first upload.
- Firefox for Android is out until a version has been tried on a phone. The manifest decides this, not AMO: AMO reads Android compatibility from the `gecko_android` key alone, so the key stays out until Android is meant.

## Before the first upload

- The name is "Tweaks for Azure DevOps", decided 2026-11-04. Microsoft's trademark guidelines forbid their mark at the front of a product name and allow the descriptive "for" form, which is what the stores look at too. No Microsoft logo in the icon or the listing, and the README says the extension is not affiliated with Microsoft. Searches of the Chrome Web Store and AMO on 2026-11-04 found no extension with the name.
- The publisher is `ronnidc` on the personal accounts the stores already have from Shop Again?, a non-trader under the EU Digital Services Act, because nothing is sold behind the extension.
- The repository has to be public, or the privacy policy and the homepage need another address.
- The public contact is support@ronnidc.com, the same as for Shop Again?.
- The license is GPL-3.0: `LICENSE` in the repository, `GPL-3.0-only` in `package.json`, and the README says that the name is not licensed, as section 7 of the GPL allows.
