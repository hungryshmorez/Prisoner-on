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

## Save data

Progress is stored per-browser in `localStorage` under a versioned key, with a
migration path from older builds. Different devices/browsers keep separate
custody files.
