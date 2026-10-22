// Yerel Lighthouse ölçümü (PERF.md). Kurulum: npm i --no-save lighthouse chrome-launcher
// Kullanım: BASE=http://localhost:3100 PAGES=/,/blog RUNS=5 THROTTLE=devtools node scripts/lighthouse.mjs
// THROTTLE=simulate (varsayılan, PageSpeed Insights gibi) ya da devtools (uygulanan gerçek ağ kısıtlaması).
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import fs from "node:fs";
const base = process.env.BASE ?? "http://localhost:3100";
const pages = (process.env.PAGES ?? "/").split(",");
const runs = Number(process.env.RUNS ?? 3);
const label = process.env.LABEL ?? "run";
const chrome = await chromeLauncher.launch({ chromePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"] });
const out = {};
for (const p of pages) {
  const rows = [];
  for (let i = 0; i < runs; i++) {
    const r = await lighthouse(base + p, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance"], formFactor: "mobile", screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }, throttlingMethod: process.env.THROTTLE ?? "simulate" });
    const a = r.lhr.audits;
    rows.push({ score: Math.round(r.lhr.categories.performance.score * 100), fcp: a["first-contentful-paint"].numericValue, lcp: a["largest-contentful-paint"].numericValue, tbt: a["total-blocking-time"].numericValue, cls: a["cumulative-layout-shift"].numericValue, si: a["speed-index"].numericValue, bytes: a["total-byte-weight"].numericValue, lhr: i === 0 ? r.lhr : undefined });
  }
  const med = (k) => rows.map((x) => x[k]).sort((x, y) => x - y)[Math.floor(rows.length / 2)];
  out[p] = { score: med("score"), scores: rows.map((x) => x.score), fcp: Math.round(med("fcp")), lcp: Math.round(med("lcp")), tbt: Math.round(med("tbt")), cls: +med("cls").toFixed(3), si: Math.round(med("si")), kb: Math.round(med("bytes") / 1024) };
  fs.writeFileSync(`lhr-${label}-${p.replace(/\W+/g, "_")}.json`, JSON.stringify(rows[0].lhr));
  console.log(p, JSON.stringify(out[p]));
}
await chrome.kill();
