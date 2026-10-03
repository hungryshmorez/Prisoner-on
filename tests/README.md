# Browser tests

Headless-Chromium checks driven by Playwright. They load `../index.html` straight from disk.

```
npm i -g playwright          # once; Chromium must be available to Playwright
export NODE_PATH=$(npm root -g)
node tests/smoke.js          # structure: no dropdowns, care bar on every tab, no errors  (~5 s)
node tests/taps.js           # 40 finger-length taps on a live-rebuilt button; must register 40/40
node tests/features.js       # care from the yard/cell, location context menu, every autopilot focus/intensity (~100 s)
```

`taps.js` can score another build with `GAME_URL=file:///path/to/other.html`.
The autopilot scenarios use the game's own SAVE button to read live state and seed
start conditions by rewriting the saved game, so they exercise the real game loop.
