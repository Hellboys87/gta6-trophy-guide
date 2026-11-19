# Leonida Platinum — a GTA VI trophy guide & tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Hellboys87/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Hellboys87/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A complete, offline guide to the platinum for Grand Theft Auto VI on PlayStation 5 — built for the player who wants to earn all 55 trophies in one well-planned run instead of discovering a missable at 97%.

**What's inside**

- **All 55 official trophies** — name, description and grade exactly as published, each with a guide written in our own words: what to do, when to do it, and the practical habits that make it painless. Every entry cites its sources.
- **A four-stage roadmap** — story first (catching the set-piece moments on the way), then strand and collectible cleanup, then the long counters and cash grinds, and finally the 100% sweep into the platinum.
- **Five missables, flagged with reasoning** — the unique-animal hunt, the VCIA departure, the Rhino tanks, the showroom escape and a fail-then-retry beat. Each flag is argued from the wording of its official description, and each guide says how to play it safe.
- **An honest guide, not a confident one** — the game has only just released, so where a step cannot yet be pinned down the guide says so, instead of inventing a precise location. Advice is framed as what the official descriptions support plus how this series has always worked.
- **A real tracker** — tick trophies off and progress is saved in your browser (localStorage), with per-grade counters, export and import of your progress file, search, filters by kind and grade, and a spoiler mode that hides unearned story trophies' names, descriptions and guides until you earn them.
- **No online trophies** — worth knowing before you start: all 55 are earned in the single-player game. The Online filter is included so you can verify that for yourself.

**Views:** Checklist (filter, search, tick off) · Roadmap (all 55 in stage order) · Missables (just the five flags, with the reasoning up front). Click any trophy anywhere to open its full guide.

## Run it

The app is plain static files with no build step and no network loads — every script, style and data file lives under `app/` and is referenced relatively, so it works with the network off.

```sh
node serve.ts
# then open http://localhost:8080
```

To produce the make.fun handover (copies `app/` and `screenshots/` and writes the dossier):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/index.html` — the page: header counters, filters, tabs, detail pane
- `app/data/trophies.json` — the 55 trophies with guides, sources, kinds, missable flags, roadmap stages and targets
- `app/js/` — `main.js` (boot and wiring), `store.js` (localStorage progress, export/import), `filters.js` (kind/grade/search rules and the spoiler rule), `views.js` (checklist, roadmap, missables and detail rendering)
- `app/css/style.css` — the Leonida dusk theme, system fonts only
- `screenshots/` — four captures of the running app; `shots.json` describes each view

Fan-made and unofficial; not affiliated with Rockstar Games or Take-Two Interactive.

---

<sub>Entered on [make.fun](https://make.fun/?ref=9xcq3bkm&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
