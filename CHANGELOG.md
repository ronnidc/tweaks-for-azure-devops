# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The work item ID in front of the title on collapsed story rows of the sprint taskboard, muted like the ID on the cards.
- The work item state after the title on the same rows, read from the Azure DevOps server the page comes from with the user's own session, and read again when a row is redrawn or the tab comes back into view.
- An options page with a switch per tweak, applied to open pages without a reload.
- Azure DevOps Server: the user adds a server by its address on the options page, and the browser asks for access to that one site.
- Chrome, Edge and Firefox from one build, on dev.azure.com and `*.visualstudio.com` out of the box.
- A footer on the options page with the version and the two ways to send feedback, by mail or as a GitHub issue, with the version and the browser filled in.

[Unreleased]: https://github.com/ronnidc/tweaks-for-azure-devops/commits/main
