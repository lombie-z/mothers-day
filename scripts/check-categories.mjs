import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Run against `npm run dev`: node scripts/check-categories.mjs [base URL]
const base = process.argv[2] || "http://localhost:3000";
const home = await fetch(base);
assert.equal(home.status, 200);
const html = await home.text();
for (const category of ["watercolour", "oil", "acrylic", "sculpture", "prints", "other"]) {
  const { works } = JSON.parse(await readFile(new URL(`../content/${category}/portfolio.json`, import.meta.url)));
  assert.equal(html.includes(`href="/${category}"`), works.length > 0, `${category}: homepage visibility`);
  const response = await fetch(`${base}/${category}`);
  assert.equal(response.status, 200, `${category}: route`);
  const page = await response.text();
  assert.equal(page.includes("No pieces yet."), works.length === 0, `${category}: separate artwork list`);
  if (works.length) assert.ok(page.includes(works[0].title), `${category}: first artwork`);
}
for (const path of ["work", "not-an-art-category"]) {
  assert.equal((await fetch(`${base}/${path}`)).status, 404, `${path}: unknown route`);
}
console.log("Category routes, artwork lists, and homepage visibility passed.");
