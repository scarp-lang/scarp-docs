# Search and navigate Scarp Docs

Find an implemented feature, an exact CLI command or a release-specific example without leaving the official documentation. Scarp Docs provides **local Scarp Docs search** for both English and Hindi pages; it does **not** send search terms to an external search provider.

## Open search

1. Click **Search** in the navigation bar, or press **Ctrl+K** on Windows/Linux or **⌘+K** on macOS.
2. Enter a term such as `funcra`, `Scarp.project`, `inspect ast`, `RMS` or an error code such as `E0034`.
3. Use the arrow keys to move through results and **Enter** to open one. Press **Esc** to close search.
4. Choose the **English / हिन्दी** language switcher to search the other translated set of pages.

The keyboard shortcut shown in the search trigger is part of its accessible name, so its text remains consistent for keyboard and screen-reader users. The search dialog follows the current documentation locale. The **Hindi** interface includes translated search buttons, results messages and keyboard hints. It indexes Hindi documents directly; it is not automatic translation of English answers. Code identifiers and release tags remain written as in the published compiler.

## Find the right version

A search result may come from a **historical** tutorial. Start with the [seven-stage learning path](/guide/learning-path), [latest published compiler downloads](/releases/v0.0.6-alpha.6) or [published feature status](/reference/status) to determine the correct compiler version before running an example. The core language reference remains pinned to alpha.1, while newer guides identify their own prereleases.

For exact commands, compare the [alpha.6 CLI](/tooling/cli-alpha6), [AST inspection](/tooling/inspect-ast-alpha6) and [troubleshooting](/tooling/troubleshooting). Use the [Hindi search help](/hi/guide/search-and-navigation) to read these instructions in हिन्दी.

## When search shows no results

Check the spelling of Scarp keywords, use a shorter term, or switch locale using the language menu. Search is provided by Scarp Docs' generated static full-text index and needs JavaScript enabled to display results. The offline Chromium suite also checks the no-results message and that **Esc** returns focus to the search trigger when opened from that button. A failed local index load is not evidence that a compiler feature does not exist: use the [page navigation](/guide/learning-path) or the [compiler's published release notes](/releases/v0.0.6-alpha.6) instead.

## Keyboard and clipboard accessibility

After results load, press **↓** to focus the first search link or **↑** to focus the last. Use Up/Down to move between links, **Enter** to open one, and **Esc** to close the dialog. Normal **Tab** navigation remains available. Closing a search opened from its trigger restores focus to that trigger.

Use the [version-aware Command Finder](/tooling/command-finder) with the keyboard to select the installed compiler. Older versions explicitly indicate unavailable commands. If **Copy commands** fails or the browser denies clipboard permission, the command block remains keyboard-focusable and can be selected manually. The real Chromium suite tests keyboard navigation, permission denial, 320px layouts and reduced motion. **Automated testing does not replace a manual screen-reader review or constitute WCAG certification.**
