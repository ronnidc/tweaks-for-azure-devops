# Store listing, English

The texts the stores show to users. The short description is the manifest description and is changed in `wxt.config.ts`, not here.

## Name

Tweaks for Azure DevOps

## Short description

Chrome and Edge take it from the manifest, at most 132 characters.

> The features Azure DevOps forgot: the work item ID and state on collapsed taskboard rows, with one switch per tweak.

## Summary

Firefox Add-ons, at most 250 characters.

> The features Azure DevOps forgot. Shows the work item ID and state on collapsed story rows of the sprint taskboard, read with your own session from your own server. One switch per tweak. Works on dev.azure.com and on Azure DevOps Server.

## Description

Chrome allows 16,000 characters, Edge wants 250 to 10,000, Firefox has no limit worth knowing. The same text goes to all three, as plain paragraphs: the fields are plain text, and a dash in front of a wrapped line does not read as a list.

> The features Azure DevOps forgot. Tweaks for Azure DevOps adds the small things the product lacks, each with its own switch, so you keep the ones you want.
>
> The first tweak: the work item ID and state on collapsed taskboard rows
>
> Collapse a story row on the sprint taskboard, and Azure DevOps shows the title and a count of its tasks, nothing more. Not the ID, not the state. People have asked for this since 2020, and an Azure DevOps extension from the Marketplace cannot do it: such an extension can add hubs and widgets, but cannot change the taskboard itself. A browser extension can, and this one does. The ID stands in front of the title, muted like the ID on the cards, and the state after it in bold, on the light and the dark theme alike.
>
> Where it works
>
> On dev.azure.com and the older visualstudio.com addresses from the moment it is installed. Azure DevOps Server, the product you run yourself, has an address only you know: enter it on the options page and click Add this site, and the browser asks for access to that one site.
>
> Your session, your server, nothing else
>
> The state is read from the Azure DevOps server whose page you are on, through its own REST API, with the session you are already signed in with, so the extension sees only what you can see. It talks to no other server, has no backend, and collects nothing. The source is open, under the GPL.
>
> More tweaks come as they are missed. Ideas are welcome on GitHub or by mail, the links are at the bottom of the options page.

## Search terms

Edge allows up to 7 terms and 21 words in all.

> azure devops, taskboard, sprint, work item, user story, scrum, agile

## Category

- Chrome Web Store: Developer Tools
- Edge Add-ons: Developer tools
- Firefox Add-ons: Web Development
