const test = require("node:test");
const assert = require("node:assert/strict");
const { runChecks, toMarkdown } = require("../checker.js");

const validHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="A sample page.">
    <title>Sample</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <h1>Sample</h1>
    <img src="images/hero.jpg" alt="A desk with a notebook">
    <a href="contact.html">Contact</a>
  </body>
</html>`;

function find(report, id) {
  return report.results.find((item) => item.id === id);
}

test("a complete static page has no warnings or errors", () => {
  const report = runChecks(validHtml);

  assert.equal(report.summary.warning, 0);
  assert.equal(report.summary.error, 0);
});

test("missing essential title and h1 are errors", () => {
  const report = runChecks("<html><head></head><body></body></html>");

  assert.equal(find(report, "title").level, "error");
  assert.equal(find(report, "h1").level, "error");
});

test("missing image alt text is an error", () => {
  const report = runChecks(validHtml.replace(' alt="A desk with a notebook"', ""));

  assert.equal(find(report, "image-alt").level, "error");
});

test("root-relative and local paths are reported", () => {
  const report = runChecks(
    validHtml
      .replace('href="styles.css"', 'href="/styles.css"')
      .replace('src="images/hero.jpg"', 'src="C:\\\\Users\\\\example\\\\hero.jpg"')
  );

  assert.equal(find(report, "root-relative").level, "warning");
  assert.equal(find(report, "local-paths").level, "error");
});

test("markdown output includes the report summary", () => {
  const markdown = toMarkdown(runChecks(validHtml));

  assert.match(markdown, /# AI Static Site Preflight Report/);
  assert.match(markdown, /- Error: 0/);
});
