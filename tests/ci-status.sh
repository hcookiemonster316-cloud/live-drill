#!/bin/bash
# The latest GitHub regression run for a commit: status, and each shard's result.
#   tests/ci-status.sh [sha] [--wait]     (sha defaults to HEAD; --wait polls until the run finishes)
cd "$(dirname "$0")/.."; R=$(git remote get-url origin | sed 's#.*github.com[/:]##;s#\.git$##')
WAIT=0; SHA=$(git rev-parse HEAD); for a in "$@"; do if [ "$a" = --wait ]; then WAIT=1; else SHA=$(git rev-parse "$a"); fi; done
while :; do
  read -r ID ST CO < <(gh api "repos/$R/actions/workflows/regression.yml/runs?head_sha=$SHA&per_page=1" --jq '.workflow_runs[0] | "\(.id) \(.status) \(.conclusion)"' 2>/dev/null)
  [ -n "$ID" ] && [ "$ID" != null ] && { [ $WAIT = 0 ] || [ "$ST" = completed ]; } && break
  [ $WAIT = 0 ] && { echo "no regression run for ${SHA:0:7} yet"; exit 0; }; sleep 30
done
echo "run $ID (${SHA:0:7}): $ST ${CO/null/}"
gh api "repos/$R/actions/runs/$ID/jobs" --jq '.jobs[] | "  \(.name): \(.conclusion // .status)"'
[ "$CO" = success ] || [ "$ST" != completed ]
