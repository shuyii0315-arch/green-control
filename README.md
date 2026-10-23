# AI GC · Green Control

Interactive prototype for the **Envision Design Challenge 2026**: one page where an AI conversation and an adaptive building dashboard work together. **All data is simulated.**

**Live demo:** https://shuyii0315-arch.github.io/green-control/

## What to try

1. **Overview**: drag the building to turn it a full circle; pinch or ctrl + scroll to zoom, then drag to move around. Click the orange dot to fly down to Chiller 2. The filters (Cooling, Power, Storage, EV) light up one system.
2. Press **Investigate** on the Chiller 2 card. The view dives from the building into the chiller plant.
3. **Investigate**: the AI checks three sources in turn (what → where → why); each lights its spot on the machine and lands as an evidence card. Then it proposes a plan one step at a time: it checks, you apply, it reports the effect, it finds a free maintenance team, you book.
4. **Back to overview**: the solved issue leaves the list, the forecast moves up, and a toast offers Undo.
5. **Actions** (left menu): every action on one time axis. Drag the window on the overview strip, or use Day / Week / Month to zoom. Hover a row for a summary, click to open it; the running action can be undone from here.

The moon button switches Night and Day. The logo or Esc always returns to the overview. `?state=s2` or `?state=s3` opens a state directly.

## How the ontology shows up

The page runs on a small ontology in `js/data.js`:

- **Objects**: building, chiller plant, chillers (CH-01, CH-02), cooling tower, pumps, backup power (UPS-2), battery (BT-01), car charging (EV-B2), work order, maintenance team.
- **Properties**: what the cards show (power per ton, temperature over normal, months since cleaning).
- **Links**: Chiller 2 is compared with Chiller 1; the cleaning is assigned to Maintenance B.
- **Actions**: "Shift 20% to Chiller 1" writes back to both chillers; "Clean the tubes" books a team. Each action is logged with its object, time and effect.

## Built with

- Plain HTML, CSS and ES modules; no build step.
- The building and plant are line-art isometric drawings pre-rendered every 4° around a full circle; labels and flows are projected from world coordinates per frame.
- [three.js](https://threejs.org) r169 (vendored in `js/vendor/`) for the optional 3D mode.
