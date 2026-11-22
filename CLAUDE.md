# Patrol City (academy/) — working rules

Standing rules from the owner:
- **Every feature ships with an optimization pass.** New features must leave the game at least as fast as before: measure before/after, and pair each feature with a speed-up (cache it, draw it once, move it off the main thread, or do it less often). Never trade visual quality for speed.
- **Don't break the game.** Before pushing: syntax-check every touched module with `node --input-type=module --check < file.js` (plain `node --check` misses errors here), run `tests/run.sh changed` (only the tests that exercise what changed; core files add the quick set), and look at screenshots of anything visual. If it passes, push live. The full regression suite then runs on GitHub (`.github/workflows/regression.yml`, 8 machines, about 5 minutes); check its result and fix anything it finds (owner's call, 2026-11-21, replacing the local full run).
- PvP and co-op are training scenarios with sim rounds only, never live fire. Don't reward bad habits or illegal activity; pursuits, arrests and use of force follow policy (reward terminating risky pursuits, safe distance, radio discipline, de-escalation).
- At most 3 quiz questions per interaction; longer runs are split into saved stages, and the player can walk away from any interaction.
- Quiz options must be similar in length and content; the right answer must not be obvious.
- **Everything is made from scratch.** No third-party fonts, icon sets, emoji art, images, sounds or music. Text uses the game's own fonts (Meridian / Meridian Text, built by `tools/makefont.py`); emoji in strings are drawn as the game's own icons (`academy/icons.js`, add a design or a MAP entry for any new emoji); music is composed in `scoredata.js` and rendered with `tools/render-score.js`.
- Push live in batches of two or three features (owner's call, 2026-11-21), one test cycle per batch (GitHub Pages); `database.rules.json` deploys automatically via `.github/workflows/deploy-rules.yml` when it changes.

Architecture notes:
- Feature modules export `installX(H)` and get a host object from `game.js` (POL, EP, ON, FEEL, SAFE, NG, PREM, COOP...).
- Rendering: depth-sorted `list` of `{d, f}`; sprites are cached (personFast, drawPropFast, vehicleFast, dogFast, label); sprite resolution `RES` follows on-screen scale; ground goes through a sliding screen buffer; buildings can be painted in `sprw.js` (worker).
- Regression tests live in `tests/` (`tests/run.sh quick|full|changed|<names>`, `SHARD=i/N` to split). After adding a test, run `node tests/mkmap.js` so `changed` knows which modules it covers. Wait for elements or conditions, never on fixed pauses alone.
- Local test server: `cd live-drill && python3 -m http.server 8765`, open `/academy/?mock&skiptitle` (test saves need `seenCine: 1, tutDone: 1`).
