# Patrol City (academy/) — working rules

Standing rules from the owner:
- **Every feature ships with an optimization pass.** New features must leave the game at least as fast as before: measure before/after, and pair each feature with a speed-up (cache it, draw it once, move it off the main thread, or do it less often). Never trade visual quality for speed.
- **Don't break the game.** Before pushing: syntax-check every touched module with `node --input-type=module --check < file.js` (plain `node --check` misses errors here), run the Playwright regression tests, and look at screenshots of anything visual.
- PvP and co-op are training scenarios with sim rounds only, never live fire. Don't reward bad habits or illegal activity; pursuits, arrests and use of force follow policy (reward terminating risky pursuits, safe distance, radio discipline, de-escalation).
- At most 3 quiz questions per interaction; longer runs are split into saved stages, and the player can walk away from any interaction.
- Quiz options must be similar in length and content; the right answer must not be obvious.
- Push live after each feature (GitHub Pages); `database.rules.json` deploys automatically via `.github/workflows/deploy-rules.yml` when it changes.

Architecture notes:
- Feature modules export `installX(H)` and get a host object from `game.js` (POL, EP, ON, FEEL, SAFE, NG, PREM, COOP...).
- Rendering: depth-sorted `list` of `{d, f}`; sprites are cached (personFast, drawPropFast, vehicleFast, dogFast, label); sprite resolution `RES` follows on-screen scale; ground goes through a sliding screen buffer; buildings can be painted in `sprw.js` (worker).
- Local test server: `cd live-drill && python3 -m http.server 8765`, open `/academy/?mock&skiptitle` (test saves need `seenCine: 1, tutDone: 1`).
