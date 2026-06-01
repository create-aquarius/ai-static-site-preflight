# AI Static Site Preflight

A local-first browser tool for checking AI-generated HTML before publishing a
small static site to GitHub Pages.

Paste or select an HTML file, run the checks, and review common publishing,
accessibility, and metadata issues. The initial version runs entirely in your
browser: your HTML is not uploaded, stored, or sent to an external service.

## Why this exists

AI tools can produce a usable static page quickly, but generated HTML often
contains small mistakes that become visible only after publishing. This project
provides a lightweight preflight step for people who want to publish a landing
page, business page, portfolio, or event page with GitHub Pages.

This is a technical quality checker. It does not score marketing copy, provide
conversion advice, or include prompts for generating sales pages.

## Checks included in v0.1

- HTML doctype
- Page language
- UTF-8 charset metadata
- Mobile viewport metadata
- Non-empty page title
- Meta description
- Top-level `h1`
- Image `alt` attributes
- Empty and placeholder links
- Root-relative asset paths that often fail on GitHub project pages
- Local computer paths such as `file://` and `C:\...`
- Obvious server-side syntax that GitHub Pages cannot execute
- Forms without a configured submission action

## Try it locally

No installation is required. Open `index.html` in your browser.

You can also serve the folder locally:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Run the tests

The automated tests use Node.js and do not require third-party packages.

```bash
npm test
```

## Publish the checker with GitHub Pages

1. Create a public GitHub repository.
2. Add these files to the default branch.
3. Open the repository settings.
4. Under **Pages**, choose **Deploy from a branch**.
5. Select the default branch and the root folder.
6. Save the settings and wait for the published URL.

## Project scope

The first release checks one HTML document in the browser. It does not crawl a
deployed website or verify that every referenced asset exists.

Planned improvements are tracked in [ROADMAP.md](ROADMAP.md). Contributions that
improve static-site safety, accessibility, documentation, and GitHub Pages
compatibility are welcome.

The initial rule reference is available in [docs/RULES.md](docs/RULES.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Bug
reports and focused rule proposals are welcome through the issue templates.

## Security

The browser version is intentionally local-first. Please report security issues
according to [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).

---

## 日本語概要

`AI Static Site Preflight` は、AIで生成したHTMLをGitHub Pagesなどで公開する前に、
最低限の問題を確認するためのローカル実行ツールです。

ブラウザ内で動作し、貼り付けたHTMLや選択したファイルを外部へ送信しません。
マーケティング評価、売れるLPの判断、セールス文章生成は対象外です。
