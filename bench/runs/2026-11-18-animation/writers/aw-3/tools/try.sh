#!/usr/bin/env bash
# Usage: tasks/tools/try.sh <id> <variant-file>
# Copies the variant to the file the ask names and the check to app/checks/<id>.test.ts,
# runs the check, prints a short result, and cleans up.
set -u
root=$(cd "$(dirname "$0")/../.." && pwd)
id=$1
variant=$2
dir=$root/tasks/$id
file=$(cat "$dir/file.txt")
mkdir -p "$root/app/$(dirname "$file")"
cp "$dir/$variant" "$root/app/$file"
cp "$dir/check.test.ts" "$root/app/checks/$id.test.ts"
cd "$root/app"
out=$(npx vitest run "checks/$id.test.ts" 2>&1)
status=$?
rm -f "$root/app/$file" "$root/app/checks/$id.test.ts"
echo "$out"
exit $status
