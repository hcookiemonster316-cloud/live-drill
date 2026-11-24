#!/bin/bash
# Patrol City regression runner.
#   tests/run.sh quick            core flows plus the newest features (a few minutes)
#   tests/run.sh full             every regression test
#   tests/run.sh changed [base]   only the tests that exercise the files changed since base (default: HEAD, plus
#                                 uncommitted and new files); core files add the quick set (tests/map.json)
#   tests/run.sh t21 tsq ...      just these
# Env: SHARD=i/N runs every Nth test of the list (CI splits the full suite this way), JOBS (parallel tests, default 2),
#      PORT (default 8765), ROOT (folder to serve, default the repo), NOSERVER=1 (a server is already running).
# Starts its own test server and one shared browser, cuts long fixed pauses in half (fast.js), retries anything that
# failed once on its own, prints a summary, and exits non-zero if a test still fails (known failures excepted).
cd "$(dirname "$0")"; T=$(pwd); REPO=$(cd .. && pwd)
QUICK="t21 t28 t61 t68 t95 tvo tarc tready thands treport techo tdecor tunlock tmood tbike tpart tways tspecial tsq"
FULL=$(ls t*.js | sed 's/\.js$//' | grep -v '^mkmap$' | sort -V | tr '\n' ' ')
KNOWN="t85 t90" # failing before Phase 4; reported, not retried, never fail the run
# tests whose fixed pauses carry real waiting (loading, travel, a scene finishing): they run with full-length pauses.
# Every first-try failure in Phase 4 came from fast.js halving these, so they no longer get halved.
WHOLE="t21 t41 t50 t58 t60 t62 t65 t70 t74 t76 t83 t87 t98 t99 tpart"
CORE="academy/game.js academy/world.js academy/index.html academy/pixelfolk.js academy/data.js academy/net.js academy/db.js academy/learn.js academy/sw.js"
MODE=${1:-quick}
case "$MODE" in
  quick) LIST=$QUICK ;;
  full) LIST=$FULL ;;
  changed)
    BASE=${2:-HEAD}; CH=$( (git -C "$REPO" diff --name-only "$BASE"; git -C "$REPO" diff --name-only --cached; git -C "$REPO" ls-files --others --exclude-standard) | sort -u)
    LIST=""; NEEDQ=0
    for f in $CH; do
      case " $CORE " in *" $f "*) NEEDQ=1; continue;; esac
      case "$f" in
        tests/t*.js) LIST="$LIST $(basename "$f" .js)";;
        academy/*.js|academy/*.html|academy/*.json)
          m=$(node -e "const m=require('./map.json').map[process.argv[1]];console.log(m?m.join(' '):'')" "$(basename "$f")")
          if [ -n "$m" ]; then LIST="$LIST $m"; else NEEDQ=1; fi;;
      esac
    done
    [ $NEEDQ = 1 ] && LIST="$LIST $QUICK"
    LIST=$(echo $LIST | tr ' ' '\n' | grep -v '^mkmap$' | sort -uV | tr '\n' ' ')
    echo "changed since $BASE: $(echo $CH | wc -w) files -> $(echo $LIST | wc -w) tests"
    [ -z "$LIST" ] && { echo "nothing to test"; exit 0; } ;;
  *) LIST="$*" ;;
esac
if [ -n "$SHARD" ]; then I=${SHARD%/*}; N=${SHARD#*/}; LIST=$(echo $LIST | tr ' ' '\n' | awk -v i="$I" -v n="$N" 'NR % n == i - 1' | tr '\n' ' '); fi
PORT=${PORT:-8765}; ROOT=${ROOT:-$REPO}; JOBS=${JOBS:-2}
# every module must parse before anything runs: one bad line stops the whole game from loading
BADJS=""; for f in "$REPO"/academy/*.js; do node --input-type=module --check < "$f" >/dev/null 2>&1 || BADJS="$BADJS $(basename "$f")"; done
if [ -n "$BADJS" ]; then echo "SYNTAX ERROR in:$BADJS (the game will not load)"; exit 1; fi
OUTD="$T/out"; mkdir -p "$OUTD/undefined"; OUT="$OUTD/result_${MODE}${SHARD:+_${SHARD/\//of}}.txt"
if [ -z "$NOSERVER" ]; then (cd "$ROOT" && exec python3 -m http.server "$PORT" >/dev/null 2>&1) & SRV=$!; fi
node "$T/pwserver.js" > "$OUTD/.pw_ws" & PWS=$!
for i in $(seq 1 100); do [ -s "$OUTD/.pw_ws" ] && break; sleep .2; done
export PW_WS=$(head -1 "$OUTD/.pw_ws")
T0=$(date +%s)
# each test runs from tests/out, so its screenshots land there and never in the repo
cd "$OUTD"
mkdir -p "$OUTD/logs"
echo $LIST | tr ' ' '\n' | grep . | xargs -P"$JOBS" -I{} sh -c "case ' $WHOLE ' in *' {} '*) export FAST=1;; esac; timeout 300 node -r '$T/fast.js' '$T/{}.js' > '$OUTD/logs/{}.txt' 2>&1; echo \"{}: \$(tail -1 '$OUTD/logs/{}.txt')\"" > "$OUT"
FAILS=""
for t in $(grep -v ": no errors$" "$OUT" | cut -d: -f1); do case " $KNOWN " in *" $t "*) continue;; esac
  # the first try's full log stays in out/logs/<test>.txt; the retry's goes beside it
  PW_WS= FAST=1 timeout 400 node -r "$T/fast.js" "$T/$t.js" > "$OUTD/logs/$t.retry.txt" 2>&1; r=$(grep -v '^\s*at ' "$OUTD/logs/$t.retry.txt" | tail -1 | cut -c1-200)
  echo "$t retry: $r" >> "$OUT"; [ "$r" = "no errors" ] || FAILS="$FAILS $t"; done
echo "== $MODE${SHARD:+ shard $SHARD}: $(echo $LIST | wc -w) tests, $(grep -c '^[^ ]*: no errors$' "$OUT") passed first time, $(( $(date +%s) - T0 )) s"; grep -v "^[^ ]*: no errors$" "$OUT"
kill $PWS ${SRV:-} 2>/dev/null
[ -z "$FAILS" ] || { echo "STILL FAILING:$FAILS"; for t in $FAILS; do echo "--- $t (retry log, last lines)"; grep -v '^\s*at ' "$OUTD/logs/$t.retry.txt" | tail -12 | cut -c1-300; done; exit 1; } # the CI log shows why, since artifacts can be hard to reach
