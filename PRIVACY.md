# Privacy policy for Tweaks for Azure DevOps

Last updated: 2026-11-04

Tweaks for Azure DevOps is a browser extension that adds small features to the Azure DevOps web pages you already use. This page says what it does with data. The short version: it talks only to the Azure DevOps server whose page you are on, with the session you are already signed in with, and nothing is sent to anyone else.

## What the extension stores

- Your settings: which tweaks are on.

That is all. The servers you add on the options page are permissions the browser holds, not data the extension stores.

## Where it is stored

Settings are kept in the browser's extension sync storage. If you are signed in to your browser with sync turned on, the browser copies them between your devices under your browser account, under the browser vendor's own privacy terms (Google for Chrome, Microsoft for Edge, Mozilla for Firefox). If not, they stay on this computer.

## What the extension reads

- On the sprint taskboard pages of Azure DevOps: the collapsed rows on the page, to find the work item IDs they stand for.
- From the Azure DevOps server the page comes from: the state of those work items, through the server's own REST API, requesting only the ID and the state fields. The request is made with the session your browser already has on that server, exactly as the page's own requests are, so the extension sees only what you can see.
- Nothing else on the pages you visit, and nothing on any other page.

## What the extension sends

Nothing to anyone but the Azure DevOps server whose page you are on. The extension has no server of its own, and the developer never receives your work items, your browsing, or anything else. There is no analytics, no crash reporting and no advertising.

The feedback links at the bottom of the options page open your mail program or GitHub with the extension's version and your browser's name and version written in, which you see and can change before you send anything. Nothing is sent until you do.

## Site access

The extension runs on the Azure DevOps cloud, dev.azure.com and `*.visualstudio.com`, from the moment it is installed. It has to be on every page of the site, because Azure DevOps moves between its pages without reloading, but it does nothing until a sprint taskboard is on the screen. A server of your own gets access only when you add it on the options page, which is when the browser asks you. Remove the site on the same page, or in the browser's own extension settings, to take the access back.

## Deleting your data

Remove the extension, and the settings are gone from the browser's storage. If sync is on, the browser removes them from your other devices too.

## Children

The extension is not directed at children and collects no data from anyone.

## Changes

Changes to this policy are published on this page with a new date.

## Contact

Questions about privacy go to support@ronnidc.com, or to the issue tracker at https://github.com/ronnidc/tweaks-for-azure-devops/issues.
