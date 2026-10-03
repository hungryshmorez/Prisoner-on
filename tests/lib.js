const { chromium } = require('playwright');
const URL = process.env.GAME_URL || require('url').pathToFileURL(require('path').resolve(__dirname, '..', 'index.html')).href;
const KEY = 'cachezero_r0_v26_routine_machine';
async function launch(opts = {}) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  return { browser, ctx, page, errors };
}
// Open the game, optionally rewriting the saved state first, then reload so it loads that state.
async function open(page, mutate, args = {}) {
  await page.goto(URL);
  await page.waitForTimeout(400);
  if (mutate) {
    await page.evaluate(() => document.querySelector('#saveBtn').click());   // force a first save through the game's own button
    await page.evaluate(([KEY, src, A]) => {
      const S = JSON.parse(localStorage.getItem(KEY));
      new Function('S', 'A', src)(S, A);
      S.lastSaved = Date.now();
      localStorage.setItem(KEY, JSON.stringify(S));
    }, [KEY, mutate.toString().replace(/^[^{]*\{/, '').replace(/\}$/, ''), args]);
    await page.reload();
    await page.waitForTimeout(400);
  }
}
const save = page => page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), KEY);
module.exports = { launch, open, save, KEY, URL };
