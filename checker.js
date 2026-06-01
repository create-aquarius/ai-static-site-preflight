(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.StaticSitePreflight = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function getTags(html, name) {
    const pattern = new RegExp("<" + name + "\\b[^>]*>", "gi");
    return html.match(pattern) || [];
  }

  function getAttribute(tag, name) {
    const pattern = new RegExp(
      "\\s" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
      "i"
    );
    const match = tag.match(pattern);
    return match ? match[1] ?? match[2] ?? match[3] ?? "" : null;
  }

  function hasAttribute(tag, name) {
    const pattern = new RegExp("\\s" + name + "(?:\\s*=|\\s|>)", "i");
    return pattern.test(tag);
  }

  function findMeta(html, name) {
    return getTags(html, "meta").find(
      (tag) => (getAttribute(tag, "name") || "").toLowerCase() === name
    );
  }

  function result(id, level, title, details) {
    return { id, level, title, details };
  }

  function plural(count, noun) {
    return count + " " + noun + (count === 1 ? "" : "s");
  }

  function runChecks(source) {
    const html = String(source || "");
    const results = [];
    const tags = {
      html: getTags(html, "html"),
      meta: getTags(html, "meta"),
      title: getTags(html, "title"),
      h1: getTags(html, "h1"),
      img: getTags(html, "img"),
      a: getTags(html, "a"),
      link: getTags(html, "link"),
      script: getTags(html, "script"),
      form: getTags(html, "form"),
    };

    if (!html.trim()) {
      return {
        results: [
          result("input", "error", "No HTML provided", "Paste or select an HTML document first."),
        ],
        summary: { pass: 0, warning: 0, error: 1 },
      };
    }

    results.push(
      /<!doctype\s+html/i.test(html)
        ? result("doctype", "pass", "HTML doctype is present", "The document declares an HTML doctype.")
        : result("doctype", "warning", "Add an HTML doctype", "Start the document with <!doctype html>.")
    );

    const htmlTag = tags.html[0];
    const lang = htmlTag ? getAttribute(htmlTag, "lang") : null;
    results.push(
      lang
        ? result("lang", "pass", "Page language is declared", 'The html element uses lang="' + lang + '".')
        : result("lang", "warning", "Declare the page language", 'Add a lang attribute such as <html lang="en">.')
    );

    const charsetMeta = tags.meta.find((tag) => hasAttribute(tag, "charset"));
    results.push(
      charsetMeta
        ? result("charset", "pass", "Character encoding is declared", "A charset meta tag is present.")
        : result("charset", "warning", "Declare the character encoding", 'Add <meta charset="UTF-8"> near the top of <head>.')
    );

    const viewport = findMeta(html, "viewport");
    results.push(
      viewport
        ? result("viewport", "pass", "Mobile viewport is configured", "A viewport meta tag is present.")
        : result("viewport", "warning", "Add a mobile viewport", 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.')
    );

    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].trim() : "";
    results.push(
      titleText
        ? result("title", "pass", "Page title is present", "The title tag contains text.")
        : result("title", "error", "Add a page title", "Include a non-empty <title> tag for browser tabs and search results.")
    );

    const description = findMeta(html, "description");
    const descriptionText = description ? getAttribute(description, "content") : "";
    results.push(
      descriptionText && descriptionText.trim()
        ? result("description", "pass", "Meta description is present", "The description meta tag contains text.")
        : result("description", "warning", "Add a meta description", "Include a non-empty meta description that summarizes the page.")
    );

    if (tags.h1.length === 1) {
      results.push(result("h1", "pass", "One h1 heading is present", "The page has a clear top-level heading."));
    } else if (tags.h1.length === 0) {
      results.push(result("h1", "error", "Add an h1 heading", "The page does not contain a top-level h1 heading."));
    } else {
      results.push(result("h1", "warning", "Review multiple h1 headings", "Found " + plural(tags.h1.length, "h1 heading") + ". Confirm the heading structure is intentional."));
    }

    const missingAlt = tags.img.filter((tag) => !hasAttribute(tag, "alt"));
    const emptyAlt = tags.img.filter((tag) => getAttribute(tag, "alt") === "");
    if (missingAlt.length) {
      results.push(result("image-alt", "error", "Add missing image alt text", plural(missingAlt.length, "image") + " missing an alt attribute. Use alt=\"\" only for decorative images."));
    } else if (emptyAlt.length) {
      results.push(result("image-alt", "warning", "Review empty image alt text", plural(emptyAlt.length, "image") + " use alt=\"\". Confirm each one is decorative."));
    } else {
      results.push(result("image-alt", "pass", "Image alt attributes are present", tags.img.length ? "All images have alt attributes." : "No images were found."));
    }

    const badLinks = tags.a.filter((tag) => {
      const href = getAttribute(tag, "href");
      return href === null || !href.trim() || href.trim() === "#" || /^javascript:/i.test(href);
    });
    results.push(
      badLinks.length
        ? result("links", "warning", "Replace placeholder links", plural(badLinks.length, "link") + " use an empty, #, missing, or javascript: href.")
        : result("links", "pass", "No placeholder links found", tags.a.length ? "All anchor tags have usable href values." : "No links were found.")
    );

    const assetTags = tags.img.concat(tags.link, tags.script);
    const referencedPaths = assetTags
      .map((tag) => getAttribute(tag, "src") ?? getAttribute(tag, "href"))
      .filter(Boolean);
    const rootRelative = referencedPaths.filter((path) => /^\/(?!\/)/.test(path));
    results.push(
      rootRelative.length
        ? result("root-relative", "warning", "Review root-relative asset paths", plural(rootRelative.length, "asset path") + " start with /. These often break when a site is published under a GitHub project-page subpath.")
        : result("root-relative", "pass", "No root-relative asset paths found", "Referenced assets avoid leading-slash paths.")
    );

    const localPaths = referencedPaths.filter((path) => /^(?:file:\/\/|[a-z]:\\|[a-z]:\/)/i.test(path));
    results.push(
      localPaths.length
        ? result("local-paths", "error", "Remove local computer paths", plural(localPaths.length, "asset path") + " point to a local computer and will not work after publishing.")
        : result("local-paths", "pass", "No local computer paths found", "Referenced assets do not use file:// or drive-letter paths.")
    );

    const serverOnly = [];
    if (/<\?(?:php|=)?/i.test(html)) serverOnly.push("PHP tags");
    if (/<%[\s\S]*?%>/i.test(html)) serverOnly.push("server template tags");
    results.push(
      serverOnly.length
        ? result("static-hosting", "warning", "Review server-side syntax", "GitHub Pages serves static files. Found: " + serverOnly.join(", ") + ".")
        : result("static-hosting", "pass", "No obvious server-side syntax found", "The document looks compatible with static hosting.")
    );

    const placeholderForms = tags.form.filter((tag) => {
      const action = getAttribute(tag, "action");
      return action === null || !action.trim() || action.trim() === "#";
    });
    if (tags.form.length) {
      results.push(
        placeholderForms.length
          ? result("forms", "warning", "Configure form submission", plural(placeholderForms.length, "form") + " do not have a working action. GitHub Pages does not process form submissions by itself.")
          : result("forms", "pass", "Form actions are configured", "Form action attributes are present. Confirm the external endpoints before publishing.")
      );
    }

    const summary = results.reduce(
      (counts, item) => {
        counts[item.level] += 1;
        return counts;
      },
      { pass: 0, warning: 0, error: 0 }
    );

    return { results, summary };
  }

  function toMarkdown(report) {
    const lines = [
      "# AI Static Site Preflight Report",
      "",
      "- Pass: " + report.summary.pass,
      "- Warning: " + report.summary.warning,
      "- Error: " + report.summary.error,
      "",
      "## Checks",
      "",
    ];

    report.results.forEach((item) => {
      lines.push("### [" + item.level.toUpperCase() + "] " + item.title);
      lines.push("");
      lines.push(item.details);
      lines.push("");
    });

    return lines.join("\n");
  }

  return { runChecks, toMarkdown };
});
