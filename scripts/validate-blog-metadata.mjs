import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = "src/content/blog";
const failures = [];
let count = 0;
for (const slug of fs.readdirSync(root, { withFileTypes: true })) {
  if (!slug.isDirectory()) continue;
  for (const file of fs.readdirSync(path.join(root, slug.name))) {
    if (!file.endsWith(".md")) continue;
    const name = path.join(root, slug.name, file);
    const { data } = matter(fs.readFileSync(name, "utf8"));
    for (const field of ["title", "excerpt"]) {
      if (typeof data[field] !== "string" || !data[field].trim()) failures.push(`${name}: missing ${field}`);
    }
    if (!data.date || !Number.isFinite(Date.parse(data.date))) failures.push(`${name}: invalid date`);
    count++;
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Validated metadata for ${count} blog translations.`);
