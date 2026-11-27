# Patrol City style guide

One guide for how the game looks, sounds and talks. Every new feature is checked against all three parts before it
ships (see "Before it ships" at the end). Everything here is made from scratch: no third-party fonts, icons, images,
sounds or music.

## What we protect

These decide ties. If a feature fights one of them, the feature changes.

1. **Three themes only.** The score rests on "Port Meridian" (the hook), "End of Watch" (the heart) and "All Units".
   Every arrangement, sting and character motif is built from one of them.
2. **Partners first.** Walsh, Park and Castillo are the reason to come back. Features give them something to say or
   do, never take their scenes away.
3. **The policy spine.** Pursuits, arrests and force follow policy. The game rewards ending risky pursuits, safe
   distance, radio discipline and de-escalation, and never rewards a bad habit.
4. **Made from scratch.** Our fonts (Meridian, Meridian Text), our icons (academy/icons.js), our music
   (scoredata.js, rendered with tools/render-score.js), our sound (synthesized in code).
5. **A city that remembers.** Choices leave marks people mention later: notes, trust, the season finale, the
   courtroom.
6. **The academy is the frame.** Everything is a training simulation at the Port Meridian Police Academy: the course,
   the city, co-op and PvP. That's what lets the game be big and fun while staying true to policy.
7. **This art guide.** One light, one line (below).

The pitch, everywhere it matters (title, first minute, store page): **a cop show you learn from, where doing it right
is the cool thing.**

## Art

**People look like who they are** (owner's call, 2026-11-26). A woman reads as a woman and a man as a man; an officer
wears the uniform with their rank (Lt. and up go without the cap); a manager, clerk of court or attorney dresses for
work; a nurse wears scrubs; clergy wear the collar; kids are kid-sized and never gray. Anyone without a hand-made design
in `folkcast.js` gets a look from `persona.js` (name, title and role), and that same look is used on the map and in
the dialogue portrait. When the story calls someone he or she and the name doesn't say, add them to `SAID` in
`persona.js`. `tests/tlooks.js` checks it.

**One light, one line.**
- Key light from the upper left on everything: people, cars, props, buildings. Shadows lean cool and blue,
  highlights lean warm (hue shifting, not just darker or lighter).
- Silhouettes get a one-pixel ink line in deep blue-black, never pure black (`rgba(12,16,28,.5)` on the detailed
  figures; the pixel people use the darkest step of their own ramp). Signs, props and trims share that ink line.
- People are pixel sprites (pixelfolk.js): flat shapes snapped to hand-style 8-step ramps, five drawings per pose,
  mirrored for the left-facing three with the light kept on the upper left.
- Building signs are pixel art from our own 5x7 letters (pixelsign.js) on a plate with the ink outline, at exactly
  twice the people's pixel size, so they sit on the same grid. Never draw sign text with a font.
- Named characters each have one signature silhouette element nobody else has (folkcast.js).

**Faces.** Six expressions, used in dialogue: calm, worried, angry, laugh, hurt, proud. They change a few pixels of
brow, eye and mouth, and hurt adds a tear. A line can name its expression (`{ expr: 'hurt' }`); otherwise it's read
from the line, and the replies after a choice react to it (a bad choice makes them angry, a good one gets a nod).

**Rank you can see.** Chevrons on the sleeve (ranks 1, 3, 5), a gold collar pin (6), a gold cap band (8), and from
Squad Leader 1 (4) a gold side stripe and roof bar on your cruiser, because the roof is what reads from across the
map. The ID card shows all of them large.

**Interface.** Navy panels (`--navy #0b1630`, `--navy2 #13244a`), gold for what matters (`--gold #f5b800`), ink text
(`--ink #eef2fa`), soft text (`--soft #a5b0c7`). Green means right, red means wrong, and neither is ever the only
signal. Uppercase letter-spaced kickers name the moment ("THE STORM · A CHOICE"). Inline SVG for insignia and scene
boards, drawn in code.

**Motion.** Small and with weight: portraits breathe and nod, cruisers lean into turns. Respect "reduced motion".

## Voice

People talk like people. Short lines, real rhythm, no lectures. The fact is in the scene; nobody recites it.

**Sgt. Dana Castillo**, field training officer. Calm, exact, never raises her voice. Complete sentences, often very
short ones. Praise is rare and plain ("Good.", "Earned it."). No slang, no pet names.
*"That's why we watch the tape. Not to catch you. So the next one goes right."*

**Ofc. Bernie Walsh**, 24 years on. Dry, tired, kind underneath. Talks about the old days at red lights. Jokes
instead of saying the sentimental thing, then says it anyway.
*"Fish badly. Coach badly. Sleep past five, which I've never done in my life."*

**Ofc. Theo Park**, eager, a little nervous, takes notes. Short sentences, asides, questions he answers himself.
*"Twenty minutes. Set a timer. Set two timers."*

**Victor Lassiter.** Polite, patient, and that's the threat. Uses your name and other people's. Never curses, never
shouts, never makes a threat he can be quoted on.
*"Justice Row next, isn't it? Hattie at the clerk's office has the cleanest handwriting in the county. Say hello."*

**You**, the cadet, on calls (academy/callvoice.js). Plain, polite, steady. You say what you're doing and why, use
the person's name, and never raise your voice except when an order has to be repeated. No exclamation marks, no
sentence over 22 words. The same choice sounds different to a frightened caller than to an angry one.
*"Okay. You're upset, and you've got a reason. Start from the top. I'm listening."*

**District casts** (academy/districts.js). Each district has its own dispatcher, sergeant and officer, and you
should know who's talking without a name:
- Central: **Velvet Hale** (dispatch) says sugar, hon, baby, and never rushes. **Castillo** runs roll call.
- Eastside: **Winnie Drummond** (dispatch) numbers everything ("One, you're closest. Two..."). **Sgt. Teddy Vargas**
  talks like a coach at halftime and may use exclamation marks. **Cpl. Ana Duarte** uses short sentences and calls
  everyone "Cadet".
- Riverside: **Nadia Coleman** (dispatch) speaks in full sentences and says "whom" when it's correct. **Sgt. Ray
  Whitfield** says four words where others say forty. **Ofc. Pete Bramlett** starts stories with "So my cousin...".
- Industrial Park: **Margo Sloane** (dispatch) is flat and dry ("Try to stay awake."). **Sgt. June Saito** counts
  things. **Ofc. Luz Carrasco** calls buildings by their old company names.
- Justice Row: **Lourdes Benavides** (dispatch) says "for the record". **Sgt. Celeste Moreau** asks "And how do you
  know that?". **Deputy Harold Wells** talks to the back of his van like a cab driver.

**Regulars** can be loud. They're allowed exclamation marks and the odd word in capitals when something wonderful
happens ("WE PASSED!"). The four above are not.

**What the checker enforces** (tests/tvoice.js, run with the rest of the suite):
- Castillo, Walsh, Park and Lassiter never use an exclamation mark or a shouted word in capitals.
- Longest sentence: Castillo 28 words, Lassiter 24, Walsh 22, Park 18.
- Your own lines on calls (callvoice.js) have no exclamation marks and no sentence over 22 words; Walsh's and Park's
  quiz reactions there keep their limits.
- Castillo uses no slang ("gonna", "wanna", "gotta") and no pet names ("buddy", "kiddo", "honey").
- Lassiter never curses or threatens out loud.
- District casts: Whitfield's sentences stay at 12 words or fewer, Duarte's at 15, Saito's at 16, Carrasco's at 16 and
  Wells's at 18. None of them, or Moreau, uses an exclamation mark. Vargas and Bramlett may.

**Quiz text.** At most three questions per interaction. Four options of similar length; the right one is never the
obvious one; never "all of the above" or "none of the above".

## Music and sound

- **Three themes** (see "What we protect"). Every situation has three arrangements (title, day, night, inside,
  story, side, call, urgent, scene, debrief, friend, water), plus one for each district, unit, shift and season.
- **Seasons.** Each chapter of the year has its own arrangement of the hook; it joins the patrol rotation and plays
  at that chapter's beats.
- **Character motifs.** Castillo: the opening of "All Units" on muted trumpet. Walsh: the first sigh of "End of
  Watch" on sax. Park: the hook, high and quick, on vibes. Lassiter: the hook turned minor, low strings. Each plays
  when they enter a scene, once a minute at most.
- **Tension layer.** A low string pedal in the playing track's key comes in on priority calls and pursuits.
- **Stings** are pieces of the hook (accept, done, promotion, fail).
- **The city.** Traffic, rain, wind, crowds, water, birds at dawn, crickets after dark, passing cars, horns and
  radio static, all synthesized (citysound.js). It sits about 9 dB under the music on a busy street, has its own
  volume, and keeps playing with the music off.
- **Sounds that teach.** The right move sounds right: a crisp radio click, the ABS pulse, a rising note for clean
  cones, one small sound for a mistake.
- **Levels.** Rendered tracks average about -26 dB with peaks under -4 dB; check new renders with ffmpeg's
  volumedetect.

## Before it ships

1. Art: one light, one line; ink outline, not black; rank and expressions where people are shown.
2. Voice: run `node tests/tvoice.js`; read new lines aloud; nobody recites the textbook.
3. Music and sound: from the three themes; levels checked; it works with the music off.
4. The protect list: which of the seven does this serve, and does it fight any of them?
