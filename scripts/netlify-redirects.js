import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

// Netlify serves dist/ statically, so src/server.js never runs. Mirror its routing as a
// _redirects file: the per-build opaque page routes, the /gh-games/ GitHub mirrors, and the 404.
const require = createRequire(import.meta.url);
const DIST_DIR = path.join(process.cwd(), "dist");
const vendorMap = require(path.join(DIST_DIR, ".runtime", "vendor-map.cjs"));

const pages = { "/apps": "apps.html", "/games": "games.html", "/tabs": "tabs.html", "/settings": "settings.html" };
const ghGamesBases = {
  "/gh-games/1/": "https://raw.githubusercontent.com/qrs/x/fixy/",
  "/gh-games/2/": "https://raw.githubusercontent.com/3v1/V5-Assets/main/",
  "/gh-games/3/": "https://raw.githubusercontent.com/3v1/V5-Retro/master/",
  "/gh-games/4/": "https://raw.githubusercontent.com/xbubbo/V6-Assets/main/",
};

const lines = ["/.runtime/* /404.html 404!", "/play.html /games.html 200"];
for (const [clean, file] of Object.entries(pages)) lines.push(`${vendorMap.routes?.[clean] || clean} /${file} 200`);
for (const [prefix, base] of Object.entries(ghGamesBases)) lines.push(`${prefix}* ${base}:splat 200`);
lines.push("/* /404.html 404");

await writeFile(path.join(DIST_DIR, "_redirects"), `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote dist/_redirects (${lines.length} rules)`);
