import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pages, site } from "../src/site-data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const pagesBasePath = (process.env.PAGES_BASE_PATH || "").replace(/\/$/, "");
const htmlFiles = [];
const problems = [];
const titles = new Map();
const descriptions = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}

function localTarget(url) {
  const withoutBasePath = pagesBasePath && url.startsWith(`${pagesBasePath}/`)
    ? url.slice(pagesBasePath.length)
    : url;
  const clean = withoutBasePath.split(/[?#]/)[0].replace(/^\//, "");
  if (!clean) return path.join(dist, "index.html");
  if (path.extname(clean)) return path.join(dist, clean);
  return path.join(dist, clean, "index.html");
}

function capture(html, pattern) {
  return html.match(pattern)?.[1]?.trim();
}

walk(dist);

if (htmlFiles.length !== pages.length) {
  problems.push(`expected ${pages.length} HTML pages, found ${htmlFiles.length}`);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(dist, file);
  const title = capture(html, /<title>([^<]+)<\/title>/);
  const description = capture(html, /<meta name="description" content="([^"]+)">/);
  const canonical = capture(html, /<link rel="canonical" href="([^"]+)">/);

  if ((html.match(/<h1\b/g) || []).length !== 1) problems.push(`${rel}: expected exactly one h1`);
  if (!title || title.length < 20 || title.length > 70) problems.push(`${rel}: title length should be 20-70 characters`);
  if (!description || description.length < 90 || description.length > 230) problems.push(`${rel}: meta description length should be 90-230 characters`);
  if (titles.has(title)) problems.push(`${rel}: duplicate title also used by ${titles.get(title)}`);
  if (descriptions.has(description)) problems.push(`${rel}: duplicate description also used by ${descriptions.get(description)}`);
  titles.set(title, rel);
  descriptions.set(description, rel);

  if (!canonical?.startsWith(`${site.baseUrl}/`)) problems.push(`${rel}: missing or noncanonical URL`);
  if (!html.includes('name="robots" content="index, follow, max-image-preview:large')) problems.push(`${rel}: missing expanded robots directives`);
  if (!html.includes('property="og:image:alt"')) problems.push(`${rel}: missing Open Graph image alt text`);
  if (!html.includes('property="og:image:width"') || !html.includes('property="og:image:height"')) problems.push(`${rel}: missing Open Graph image dimensions`);
  if (!html.includes('name="twitter:card" content="summary_large_image"')) problems.push(`${rel}: missing Twitter summary card`);
  if (!html.includes('rel="preload" as="image"')) problems.push(`${rel}: missing hero image preload`);
  if (html.includes("placeholder copy") || html.includes("AI-readable facts")) problems.push(`${rel}: internal or placeholder language remains`);

  for (const match of html.matchAll(/<img\b([^>]+)>/g)) {
    const attrs = match[1];
    for (const required of ["src=", "srcset=", "sizes=", "width=", "height=", "alt=", "loading=", "decoding="]) {
      if (!attrs.includes(required)) problems.push(`${rel}: image missing ${required.replace("=", "")} attribute`);
    }
  }

  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const url = match[1];
    if (url.startsWith("http") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("sms:")) continue;
    const target = localTarget(url);
    if (!fs.existsSync(target)) problems.push(`${rel}: broken local reference ${url}`);
  }

  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (!fs.existsSync(localTarget(url))) problems.push(`${rel}: broken srcset candidate ${url}`);
    }
  }

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (scripts.length !== 1) problems.push(`${rel}: expected one linked JSON-LD graph`);
  for (const match of scripts) {
    try {
      const data = JSON.parse(match[1]);
      const graph = data["@graph"] || [];
      const types = graph.flatMap(item => Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]]);
      for (const type of ["WebSite", "LodgingBusiness", "WebPage", "BreadcrumbList", "ImageObject"]) {
        if (!types.includes(type)) problems.push(`${rel}: JSON-LD graph missing ${type}`);
      }
      if (rel === path.join("faq", "index.html") && !types.includes("FAQPage")) problems.push(`${rel}: JSON-LD graph missing FAQPage`);
      const ids = graph.map(item => item["@id"]).filter(Boolean);
      if (new Set(ids).size !== ids.length) problems.push(`${rel}: duplicate JSON-LD entity IDs`);
    } catch (error) {
      problems.push(`${rel}: invalid JSON-LD ${error.message}`);
    }
  }
}

const robots = fs.readFileSync(path.join(dist, "robots.txt"), "utf8");
for (const crawler of ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "Googlebot", "Bingbot"]) {
  if (!robots.includes(`User-agent: ${crawler}`)) problems.push(`robots.txt: missing ${crawler} rule`);
}
if (!robots.includes(`Sitemap: ${site.baseUrl}/sitemap.xml`)) problems.push("robots.txt: missing canonical sitemap URL");

const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
for (const page of pages) {
  if (!sitemap.includes(`<loc>${site.baseUrl}${page.url}</loc>`)) problems.push(`sitemap.xml: missing ${page.url}`);
}
if (!sitemap.includes("xmlns:image=") || !sitemap.includes("<image:image>")) problems.push("sitemap.xml: missing image sitemap data");

for (const filename of ["llms.txt", "llms-full.txt"]) {
  const target = path.join(dist, filename);
  if (!fs.existsSync(target) || fs.statSync(target).size < 500) problems.push(`${filename}: missing or incomplete`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages, metadata, entity graphs, internal links, responsive images, crawler rules, sitemap data, and LLM fact files.`);
