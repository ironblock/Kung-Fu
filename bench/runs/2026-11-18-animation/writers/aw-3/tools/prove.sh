#!/usr/bin/env bash
# Usage: tasks/tools/prove.sh <id> [expected-json-file]
# Copies proof.test.ts to app/checks/<id>.proof.test.ts and the expected answer beside it
# as app/checks/<id>.expected.json, runs the proof, and cleans up.
set -u
root=$(cd "$(dirname "$0")/../.." && pwd)
id=$1
dir=$root/tasks/$id
answer=${2:-$dir/expected.json}
cp "$dir/proof.test.ts" "$root/app/checks/$id.proof.test.ts"
cp "$answer" "$root/app/checks/$id.expected.json"
cd "$root/app"
out=$(npx vitest run "checks/$id.proof.test.ts" 2>&1)
status=$?
rm -f "$root/app/checks/$id.proof.test.ts" "$root/app/checks/$id.expected.json"
echo "$out"
exit $status
