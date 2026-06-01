# Rule Reference

The initial checker uses a deliberately small set of explainable rules. Each
rule should help someone prevent a technical publishing issue without making a
marketing judgment about the page.

| Rule | Level | Why it matters |
| --- | --- | --- |
| HTML doctype | Warning | Helps browsers render the document in standards mode. |
| Page language | Warning | Helps assistive technology interpret the page. |
| UTF-8 charset | Warning | Prevents common text-encoding issues. |
| Mobile viewport | Warning | Helps pages render correctly on mobile devices. |
| Non-empty title | Error | Required for a usable browser tab and search-result title. |
| Meta description | Warning | Provides a basic page summary for search and sharing contexts. |
| Top-level `h1` | Error or warning | Helps clarify the primary document heading. |
| Image `alt` attributes | Error or warning | Supports accessible image interpretation. |
| Placeholder links | Warning | Prevents publishing links that do nothing. |
| Root-relative paths | Warning | These often break under GitHub project-page subpaths. |
| Local computer paths | Error | Local file paths do not work after publishing. |
| Server-side syntax | Warning | GitHub Pages serves static files and cannot execute server code. |
| Empty form action | Warning | GitHub Pages does not process form submissions by itself. |

## Proposing a rule

Open a rule-proposal issue with a minimal, non-sensitive HTML example. New rules
should be deterministic, technically explainable, and testable without sending
HTML to a remote service.
