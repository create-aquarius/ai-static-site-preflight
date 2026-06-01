(function () {
  "use strict";

  const input = document.querySelector("#html-input");
  const fileInput = document.querySelector("#html-file");
  const runButton = document.querySelector("#run-checks");
  const demoButton = document.querySelector("#load-demo");
  const downloadButton = document.querySelector("#download-report");
  const summary = document.querySelector("#summary");
  const reportContainer = document.querySelector("#report");
  let latestReport = null;

  const demoHtml = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title></title>
  </head>
  <body>
    <h1>Sample AI-generated page</h1>
    <img src="C:\\Users\\example\\Desktop\\hero.jpg">
    <a href="#">Contact us</a>
  </body>
</html>`;

  function render(report) {
    latestReport = report;
    downloadButton.disabled = false;
    summary.textContent =
      "Pass: " +
      report.summary.pass +
      " | Warning: " +
      report.summary.warning +
      " | Error: " +
      report.summary.error;
    reportContainer.replaceChildren();

    report.results.forEach((item) => {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      const details = document.createElement("p");

      article.className = "check check-" + item.level;
      title.textContent = "[" + item.level.toUpperCase() + "] " + item.title;
      details.textContent = item.details;
      article.append(title, details);
      reportContainer.append(article);
    });
  }

  fileInput.addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    input.value = await file.text();
  });

  demoButton.addEventListener("click", function () {
    input.value = demoHtml;
    render(window.StaticSitePreflight.runChecks(input.value));
  });

  runButton.addEventListener("click", function () {
    render(window.StaticSitePreflight.runChecks(input.value));
  });

  downloadButton.addEventListener("click", function () {
    if (!latestReport) return;

    const content = window.StaticSitePreflight.toMarkdown(latestReport);
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "static-site-preflight-report.md";
    link.click();
    URL.revokeObjectURL(url);
  });
})();
