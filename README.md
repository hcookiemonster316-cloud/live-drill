# Live Drill: live games and leaderboards for the study hubs

A free, sign-in-free live quiz site for the FBRTP chapter study hubs. It runs on GitHub Pages (hosting) and Firebase (real-time data).

- **Join:** players open the site, type the 6-digit PIN and a nickname. Up to 50 players per game (tested with 30).
- **Host (`?host`):** Classic quiz, Boss Raid (co-op), True/False Showdown, Team Category Board (Jeopardy-style clues, 2-4 teams).
- **Leaderboards (`?boards`):** this week and all time for every study-hub game; scores arrive from the hub's Post score button.
- **Squads (`?squads`):** create or join with a 5-character code, leave any time (up to 3). Weekly squad points and goal, squad streak, study hall, opt-in readiness board, achievement feed, all-squads board, and TV mode (`?tv`). Cadets add progress with **Report in** in the study hub.
- **Events:** add a Qualification Week to `events` in config.js to multiply squad points.
- **Try it without Firebase:** add `?mock` to any address to play between tabs of one browser.

## Files
| File | What it is |
|---|---|
| index.html | The page and its styles |
| app.js | Joining, hosting, the four game modes, leaderboards |
| squads.js | Squads, Report in, the feed, events and TV mode |
| db.js | Firebase connection (anonymous sign-in + Realtime Database) |
| config.js | **Your Firebase settings go here**, plus the chapter list |
| ch5.json | Chapter 5 question bank: Kahoot-style questions, true/false statements, Jeopardy clues |
| database.rules.json | Security rules to paste into Firebase |

## Setup (about 10 minutes, once)

### Firebase
1. Go to console.firebase.google.com, sign in with a Google account, and click **Create a project**. Name it `live-drill`, turn Google Analytics off, and create it.
2. **Build → Authentication → Get started → Sign-in method → Anonymous →** turn on **Enable** and save.
3. **Build → Realtime Database → Create database**, pick the United States location, choose **Start in locked mode**, and click Enable.
4. Open the database's **Rules** tab, replace everything with the contents of `database.rules.json`, and click **Publish**.
5. Click the gear icon → **Project settings → General**. Under *Your apps* click the web icon `</>`, enter `live-drill` as the nickname, and click **Register app**. Copy the values of `apiKey`, `authDomain`, `databaseURL`, `projectId` and `appId` into `config.js`. If `databaseURL` is missing, copy it from the top of the Realtime Database page.

### GitHub Pages
6. At github.com, create a free account if you don't have one. Click **New repository**, name it `live-drill`, set it to **Public**, and create it.
7. Click **uploading an existing file**, drag in all 7 files, and click **Commit changes**.
8. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, select **main** and **/ (root)**, and save. After about a minute your site is at `https://YOUR-USERNAME.github.io/live-drill/`.
9. Back in Firebase, go to **Authentication → Settings → Authorized domains → Add domain** and enter `YOUR-USERNAME.github.io`.

### Connect the hub
10. Send the site address to Claude. The study hub's Game Center then shows the **Live and multiplayer** rows, and results screens get **Post score**.

## Adding a chapter
Export its bank to `chN.json` and add a line to `chapters` in `config.js` with the chapter's study hub link.

## Free-plan limits
Firebase's free plan allows 100 simultaneous connections and 10 GB of downloads a month, which covers many class games. Finished games are deleted when the host closes them.
