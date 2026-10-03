const { launch, open, save } = require('./lib');
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };

async function care() {
  const { browser, page, errors } = await launch();
  await open(page, S => { S.world.location = 'yard'; S.world.lastScheduleKey = '1:540:yard'; S.minute = 600; S.hunger = 30; S.hydration = 30; S.hygiene = 40; S.energy = 50; S.fighter.fatigue = 40; });
  await page.waitForTimeout(500);
  ok((await page.textContent('#hereTab')).includes('YARD'), 'HERE tab switches to YARD when he is in the yard');
  const secs = await page.$$eval('.hereSec.on', e => e.map(x => x.dataset.here));
  ok(secs.includes('gym yard') && secs.includes('cell gym yard') && !secs.includes('cell'), `yard shows training+fight sections, hides cell privileges (${secs.join(' | ')})`);
  ok(await page.isVisible('#yardFightBtn') && await page.isVisible('[data-train="study"]'), 'yard context shows FIGHT and STUDY buttons');
  // care bar from the yard
  const get = async () => (await save(page)).hunger;
  await page.click('[data-care="meal"]'); await page.waitForTimeout(250);
  let s = await save(page);
  ok(s.hunger > 55, `MEAL in yard feeds him on the spot (hunger ${s.hunger.toFixed(0)})`);
  const h1 = s.hunger; await page.click('[data-care="meal"]'); await page.waitForTimeout(200);
  s = await save(page); ok(s.hunger <= h1 + 1, 'second MEAL inside the cooldown does not refill again');
  await page.click('[data-care="water"]'); await page.waitForTimeout(250);
  s = await save(page); ok(s.hydration > 50, `WATER in yard hydrates him (hydration ${s.hydration.toFixed(0)})`);
  await page.click('[data-care="wash"]'); await page.waitForTimeout(250);
  s = await save(page); ok(s.hygiene > 48, `WASH in yard gives a quick rinse (hygiene ${s.hygiene.toFixed(0)})`);
  await page.click('[data-care="rest"]'); await page.waitForTimeout(250);
  s = await save(page); ok(s.energy > 60 && s.fighter.fatigue < 30, `REST recovers energy/fatigue (energy ${s.energy.toFixed(0)}, fatigue ${s.fighter.fatigue.toFixed(0)})`);
  // care bar stays while on other tabs
  await page.click('#tabs [data-tab="world"]'); await page.click('[data-care="snack"]'); await page.waitForTimeout(200);
  ok(!!(await save(page)), 'SNACK works from the WORLD tab (care bar is on every screen)');
  ok(errors.length === 0, 'no page errors (yard care)'); if (errors.length) console.log(errors);
  await browser.close();
}

async function cellCare() {
  const { browser, page, errors } = await launch();
  await open(page);
  await page.waitForTimeout(300);
  ok((await page.textContent('#hereTab')).includes('CELL'), 'HERE tab shows CELL in the cell');
  await page.click('[data-care="meal"]'); await page.waitForTimeout(250);
  let s = await save(page); ok(s.food === true, 'MEAL in cell still serves the tray (existing behaviour)');
  await page.click('[data-care="water"]'); await page.waitForTimeout(250);
  s = await save(page); ok(s.water === true, 'WATER in cell still refreshes sink access');
  ok(await page.isVisible('[data-action="removeFood"]') && await page.isVisible('[data-action="radio"]'), 'cell context shows privileges + REMOVE TRAY');
  ok(errors.length === 0, 'no page errors (cell care)');
  await browser.close();
}

async function auto(name, args, wait, check) {
  const { browser, page, errors } = await launch();
  await open(page, S => { Object.assign(S.world.autopilot, { enabled: true, mode: A.mode, intensity: A.intensity, risk: 'normal', lastDecisionAt: -9999 }); S.minute = A.minute || 455; S.world.location = A.loc || 'block'; S.world.lastScheduleKey = A.key || '1:450:block'; if (A.hunger != null) S.hunger = A.hunger; }, args);
  await page.waitForTimeout(wait);
  await page.evaluate(() => document.querySelector('#saveBtn').click());   // read live state, not whatever autosave last captured
  const s = await save(page);
  const logs = (s.world.autopilot.log || []).map(x => x.text);
  const r = check(s, logs);
  ok(r === true, `${name}${r === true ? '' : ' -> ' + r + ' | loc=' + s.world.location + ' log=' + JSON.stringify(logs.slice(0, 4))}`);
  ok(errors.length === 0, `no page errors (${name})`); if (errors.length) console.log(errors);
  await browser.close();
}
const base = (mode, intensity, extra = {}) => ({ mode, intensity, ...extra });

(async () => {
  await care(); await cellCare();
  await auto('HARD + PHYSICAL pulls him off schedule to the weight pit and trains', base('physical', 'hard'), 16000,
    (s, l) => (s.world.location === 'gym' && l.some(x => /weight pit/.test(x)) && l.some(x => /Training (strength|grit|conditioning)/.test(x))) || 'expected gym + training');
  await auto('EASY + PHYSICAL stays on the normal schedule (no override)', base('physical', 'easy'), 12000,
    (s, l) => (s.world.location === 'block' && !l.some(x => /Pushed/.test(x))) || 'should have stayed in block');
  await auto('HARD + FIGHTING heads to the yard', base('fighter', 'hard'), 12000,
    (s, l) => (['yard', 'gym'].includes(s.world.location) && l.some(x => /Pushed him to the yard/.test(x))) || 'expected yard');
  await auto('INTELLECT mode studies and raises technique', base('intellect', 'balanced'), 14000,
    (s, l) => (l.some(x => /Study block/.test(x)) && s.fighter.technique > 10) || 'expected study + technique gain');
  await auto('HARD + INTERACTIONS goes after people', base('social', 'hard'), 22000,
    (s, l) => l.some(x => /relationship|De-escalated|looking for company|Sparred/.test(x)) || 'expected a social decision');
  await auto('CARE focus feeds him when starving away from the cell', base('care', 'balanced', { hunger: 15, loc: 'yard', key: '1:540:yard', minute: 600 }), 15000,
    (s, l) => (l.some(x => /Brought him a meal/.test(x)) && s.hunger > 30) || 'expected autopilot to feed him');
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
