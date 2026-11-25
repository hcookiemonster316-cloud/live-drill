#!/usr/bin/env bash
# Builds the site GitHub Pages serves: a copy of the repo with every script minified (smaller downloads, faster parse)
# and nothing a player doesn't need (tests, tools, workflows, notes). Source files in the repo are never changed.
#   tools/build-site.sh [out-dir]          (default: _site)
# ES modules are fully minified file by file (no bundling, so every import path and worker URL stays the same);
# classic scripts (the service worker, config.js) only lose whitespace and get shorter syntax, so their global names
# stay as they are. Uses esbuild: $ESBUILD if set, else npx esbuild@0.28.2.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-_site}"
ESB="${ESBUILD:-npx --yes esbuild@0.28.2}"
rm -rf "$OUT" && mkdir -p "$OUT"
# everything but the parts a player never loads
tar --exclude=./.git --exclude=./.github --exclude=./tests --exclude=./tools --exclude="./$OUT" --exclude='./*.md' --exclude=./ch5.json -cf - . | tar -xf - -C "$OUT"
mods=(); classic=()
while IFS= read -r f; do
  if grep -qE '^\s*(import|export)\b' "$f"; then mods+=("$f"); else classic+=("$f"); fi
done < <(find "$OUT" -name '*.js' -not -path '*/node_modules/*')
before=$(cat "${mods[@]}" "${classic[@]}" | wc -c)
for f in "${mods[@]}"; do $ESB "$f" --minify --format=esm --target=es2020 --legal-comments=none --log-level=warning --outfile="$f" --allow-overwrite; done
for f in "${classic[@]}"; do $ESB "$f" --minify-whitespace --minify-syntax --target=es2020 --legal-comments=none --log-level=warning --outfile="$f" --allow-overwrite; done
after=$(cat "${mods[@]}" "${classic[@]}" | wc -c)
# a syntax check of every built module, the same one used before every push
for f in "${mods[@]}"; do node --input-type=module --check < "$f" || { echo "build broke $f"; exit 1; }; done
echo "built $OUT: ${#mods[@]} modules, ${#classic[@]} classic scripts, scripts $((before / 1024)) KB -> $((after / 1024)) KB"
