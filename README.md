# CACHE//ZERO — RØ Custody Sim (v26 "Routine Machine")

A single-file, dependency-free browser game. You remotely observe and manage
**RØ**, a prisoner in CELL 00, inside a living prison block: needs and morale,
a cognitive/memory model, NPC inmates with persistent relationships, a yard
combat system, prison work assignments, and a gradual body-transformation
system. All state persists locally in the browser (`localStorage`).

## Play

Open `index.html` in a browser — that's the whole game. Nothing to install.

If GitHub Pages is enabled for this repo, the game is playable directly at the
Pages URL (it serves `index.html` from the repo root).

## Layout

| File | Purpose |
| --- | --- |
| `index.html` | The entire game (markup, CSS, and JS in one file). |
| `V26_NOTES.txt` | Author's release notes for the v26 build. |
| `tests/` | Headless-Chromium checks (see `tests/README.md`). |

## v26 patch notes (this build)

This build includes fixes on top of the original v26 export:

- **Splash overlay CSS conflict** — removed the contradictory
  `display:none!important` + `display:grid` on `#start`; the overlay is now
  coherent and hidden on first paint via a markup class (no flash), so
  auto-launch is unchanged.
- **CRT / accessibility sliders** — the visual-settings sliders are built once
  instead of being rebuilt every animation frame, so they're draggable and now
  apply the scanline/vignette/grain effect live.
- **Prison work while away** — a shift window that fully passes with the feed
  closed now resolves as *excused* (no pay, no infraction, streak preserved)
  instead of leaving a stale "work call active" state.
- **Render loop performance** — the heavy side panels rebuild a few times per
  second (plus immediately on any action) rather than ~60×/second; a light
  HUD update still runs every frame, so gameplay stays smooth.
- **Minor** — `startBattle` runs its cooldown/injury guards before recording a
  "sent to fight" memory (no false memory on a blocked fight); removed a
  dead no-op credits line in the meal action.

## v27 — menus and autopilot

- **Dropdowns / lost taps (root cause fixed).** The side panels were rebuilt from
  scratch several times a second, which destroyed an open dropdown after a split
  second and swallowed taps that landed mid-rebuild (measured: only ~58% of
  finger-length taps on a rebuilt button registered). Unchanged panels are no
  longer rebuilt, rebuilds pause while a pointer is down in the sidebar, and the
  two autopilot dropdowns are now button groups. Same test now: 40/40 taps.
- **Care bar on every screen.** MEAL / SNACK / WATER / WASH / REST are pinned under
  the stats on every tab (and stay pinned when the page scrolls on a phone). In
  CELL 00 they use the existing tray and sink; anywhere else the care is brought
  to him on the spot, with short cooldowns so it cannot be spammed.
- **Context tab that follows him.** The first tab is "HERE" plus his location. In the
  cell it shows privileges, orders and discipline; in the gym and yard it shows
  training, learned moves, the yard ladder and friend challenges. A new
  **STUDY / MIND** training builds technique and speed cheaply.
- **Autopilot tab.** Pick a **focus** (balanced, care, physical, fighting, intellect,
  interactions) and an **intensity** (easy, balanced, hard). Hard decides faster,
  pushes through fatigue, and can pull him off the daily schedule to chase the
  focus (weight pit, yard, or wherever there is company). Autopilot also uses the
  care bar when he is starving or parched away from the cell.

## Save data

Progress is stored per-browser in `localStorage` under a versioned key, with a
migration path from older builds. Different devices/browsers keep separate
custody files.
