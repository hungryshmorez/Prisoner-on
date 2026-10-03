// Structure checks: no native dropdowns, care bar on every tab, no startup errors.
const { launch, open } = require('./lib');
let fail = 0; const ok = (c, m) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
(async () => {
  const { browser, page, errors } = await launch();
  await open(page);
  await page.waitForTimeout(1500);
  ok((await page.$$eval('select', e => e.length)) === 0, 'no <select> dropdowns remain (they were destroyed by panel rebuilds)');
  for (const t of ['here', 'auto', 'chat', 'world', 'power', 'cell', 'mind', 'records']) {
    await page.click(`#tabs [data-tab="${t}"]`); await page.waitForTimeout(120);
    ok(await page.isVisible('#careDock [data-care="meal"]') && await page.isVisible('#careDock [data-care="water"]'), `care bar visible on the ${t.toUpperCase()} tab`);
  }
  ok(errors.length === 0, 'no page errors on startup'); if (errors.length) console.log(errors);
  await browser.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
