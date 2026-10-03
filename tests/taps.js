const { launch, open, save } = require('./lib');
// A human tap = press, ~150ms, release. Count how many taps on a rebuilt button register.
(async () => {
  const { browser, page, errors } = await launch();
  await open(page);
  const isNew = await page.$('#careDock') !== null;
  // before-build: autopilot lives in POWER; new build: AUTO tab. Use the combat toggle (flips each real tap).
  await page.click(`#tabs [data-tab="${isNew ? 'auto' : 'power'}"]`);
  await page.waitForTimeout(300);
  const N = 40; let flips = 0, last = true;  // base state: combat AI on
  for (let i = 0; i < N; i++) {
    const box = await page.evaluate(() => { const r = document.querySelector('#autoCombat').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.waitForTimeout(150); await page.mouse.up();
    await page.waitForTimeout(180 + (i * 37) % 260);   // vary phase against the 0.4s rebuild clock
    const sv = await save(page); const now = sv ? sv.world.autopilot.combat : last;
    if (now !== last) flips++; last = now;
  }
  console.log(`${isNew ? 'NEW ' : 'OLD '} build: ${flips}/${N} taps registered; errors: ${errors.length || 'none'}`);
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
