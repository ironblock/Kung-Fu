#!/usr/bin/env bash
# Runs one code task's check against each of its answers, from app/.
# Usage: tasks/run-checks.sh AM1 [AM2 ...]
# For each answer: copy the check to app/checks/<id>.test.ts, the answer to the file the ask
# names, run vitest on the check, print PASS or FAIL and the kind of the first failure, then
# remove both copies.
set -u
root="$(cd "$(dirname "$0")/.." && pwd)"
app="$root/app"
for id in "$@"; do
    dir="$root/tasks/$id"
    file="$(tr -d '\n' < "$dir/file.txt")"
    for answer in reference other plain $(cd "$dir" && ls hollow*.ts | sed 's/\.ts$//'); do
        mkdir -p "$(dirname "$app/$file")"
        cp "$dir/check.test.ts" "$app/checks/$id.test.ts"
        cp "$dir/$answer.ts" "$app/$file"
        out="$(cd "$app" && timeout 300 npx vitest run "checks/$id.test.ts" 2>&1)"
        status=$?
        rm -f "$app/checks/$id.test.ts" "$app/$file"
        tests="$(printf '%s\n' "$out" | grep -E '^ +Tests ' | sed 's/^ *//')"
        if [ $status -eq 0 ]; then
            echo "$id $answer: PASS ($tests)"
        else
            kind="$(printf '%s\n' "$out" | grep -E '(AssertionError|TypeError|ReferenceError|SyntaxError|Error:)' | head -1 | sed 's/^ *//' | cut -c1-120)"
            echo "$id $answer: FAIL ($tests) first failure: ${kind:-unknown}"
        fi
    done
done
