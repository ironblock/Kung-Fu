#!/usr/bin/env bash
# Runs one question task's proof, from app/: first with expected.json as written, then with one
# field changed (given as NAME=VALUE), then removes both copies.
# Usage: tasks/run-proof.sh AM6 aloneHalfY=3
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"
app="$root/app"
id="$1"
change="$2"
dir="$root/tasks/$id"
run() {
    out="$(cd "$app" && timeout 300 npx vitest run "checks/$id.proof.test.ts" 2>&1)"
    status=$?
    tests="$(printf '%s\n' "$out" | grep -E '^ +Tests ' | sed 's/^ *//')"
    first="$(printf '%s\n' "$out" | grep -E '(AssertionError|Error:)' | head -1 | sed 's/^ *//' | cut -c1-120)"
    if [ $status -eq 0 ]; then echo "$id $1: PASS ($tests)"; else echo "$id $1: FAIL ($tests) first failure: ${first:-unknown}"; fi
}
cp "$dir/proof.test.ts" "$app/checks/$id.proof.test.ts"
cp "$dir/expected.json" "$app/checks/$id.expected.json"
run "expected.json as written"
name="${change%%=*}"
value="${change#*=}"
node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));if(!(process.argv[2] in j))throw new Error("no field "+process.argv[2]);j[process.argv[2]]=JSON.parse(process.argv[3]);fs.writeFileSync(p,JSON.stringify(j));' "$app/checks/$id.expected.json" "$name" "$value"
run "with $name changed to $value"
rm -f "$app/checks/$id.proof.test.ts" "$app/checks/$id.expected.json"
