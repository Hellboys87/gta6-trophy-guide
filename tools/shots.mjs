// shots.mjs — renders the four dossier screenshots of the running app with
// the Chrome headless shell. Progress is seeded into localStorage before the
// page's own scripts run, so the captures show a tracker part-way through a
// real platinum run (14 of 55 earned) instead of an empty checklist.
//
// Usage: node serve.ts (in another shell) then `node tools/shots.mjs`.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/home/hatch/workspace/makefun/node_modules/puppeteer-core');

const CHROME = '/home/hatch/workspace/makefun/.browsers/chrome-headless-shell/linux-157.0.8103.78/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://localhost:8080/';
const OUT_DIR = fileURLToPath(new URL('../screenshots/', import.meta.url));

// A plausible mid-run save: the opening missions, a few strands and
// activities, exploration under way — 14 trophies, bronze and silver mixed.
// Chapters 1 and 2 are deliberately left unearned so the spoiler capture
// shows story trophies masked near the top of the list.
const EARNED = [2, 8, 10, 16, 18, 20, 21, 28, 30, 33, 36, 39, 42, 44];

async function openSeededPage(browser, { spoilers }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.evaluateOnNewDocument(
    (earned, spoilerOn) => {
      localStorage.setItem('gta6-trophy-progress', JSON.stringify(earned));
      localStorage.setItem('gta6-trophy-settings', JSON.stringify({ spoilers: spoilerOn }));
    },
    EARNED,
    spoilers,
  );
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.trophy-row');
  return page;
}

async function clickRowByText(page, text) {
  await page.evaluate((needle) => {
    const row = [...document.querySelectorAll('.trophy-row')].find((r) => r.textContent.includes(needle));
    if (row) row.click();
  }, text);
  await new Promise((r) => setTimeout(r, 350));
}

async function clickTab(page, view) {
  await page.evaluate((v) => {
    document.querySelector(`.tab[data-view="${v}"]`).click();
  }, view);
  await new Promise((r) => setTimeout(r, 350));
}

async function shoot(page, file) {
  await page.screenshot({ path: join(OUT_DIR, file), type: 'jpeg', quality: 80 });
  console.log('wrote', file);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

try {
  // 1 — cover: checklist, progress part-way, a missable's guide open.
  const cover = await openSeededPage(browser, { spoilers: false });
  await clickRowByText(cover, 'Catch Me If You Can');
  await cover.evaluate(() => window.scrollTo(0, 0));
  await shoot(cover, '1-cover.jpg');
  await cover.close();

  // 2 — roadmap view.
  const roadmap = await openSeededPage(browser, { spoilers: false });
  await clickTab(roadmap, 'roadmap');
  await shoot(roadmap, '2-roadmap.jpg');
  await roadmap.close();

  // 3 — missables view with the flags visible.
  const missables = await openSeededPage(browser, { spoilers: false });
  await clickTab(missables, 'missables');
  await shoot(missables, '3-missables.jpg');
  await missables.close();

  // 4 — spoiler mode on: unearned story trophies are masked, filters visible.
  // Scrolled just far enough that the filter bar stays in frame while the
  // first masked story rows ("Hidden story trophy") come into view.
  const spoilers = await openSeededPage(browser, { spoilers: true });
  await spoilers.evaluate(() => window.scrollTo(0, 330));
  await new Promise((r) => setTimeout(r, 250));
  await shoot(spoilers, '4-spoilers.jpg');
  await spoilers.close();
} finally {
  await browser.close();
}
