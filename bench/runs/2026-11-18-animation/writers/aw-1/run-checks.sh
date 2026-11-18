#!/usr/bin/env bash
# Run one task's hidden check against each of its answers, from app/.
# Code task:     run-checks.sh AG1
# Question task: run-checks.sh AG6 proof   (runs proof.test.ts with expected.json)
set -u
here=$(cd "$(dirname "$0")" && pwd)
app=$(cd "$here/../app" && pwd)
id=$1
dir="$here/$id"

summary() {
    # The test count line, then each failing assertion's first line.
    printf '%s\n' "$1" | grep -E "^ +Tests " | sed 's/^ *//'
    printf '%s\n' "$1" | grep -E "^(AssertionError|Error|TypeError|ReferenceError|SyntaxError)" | sort | uniq -c | sed 's/^ *//'
    printf '%s\n' "$1" | grep -E "Failed to (load|resolve)" | head -3
}

if [ "${2:-}" = "proof" ]; then
    cp "$dir/proof.test.ts" "$app/checks/$id.proof.test.ts"
    out=$(cd "$app" && npx vitest run "checks/$id.proof.test.ts" 2>&1)
    echo "== $id proof with $(basename "${3:-expected.json}")"
    summary "$out"
    rm -f "$app/checks/$id.proof.test.ts"
    exit 0
fi

file=$(cat "$dir/file.txt")
cp "$dir/check.test.ts" "$app/checks/$id.test.ts"
answers="reference other plain $(cd "$dir" && ls hollow*.ts | sed 's/\.ts$//' | tr '\n' ' ')"
for ans in $answers; do
    mkdir -p "$(dirname "$app/$file")"
    cp "$dir/$ans.ts" "$app/$file"
    out=$(cd "$app" && npx vitest run "checks/$id.test.ts" 2>&1)
    echo "== $id $ans.ts as $file"
    summary "$out"
    rm -f "$app/$file"
done
rm -f "$app/checks/$id.test.ts"
