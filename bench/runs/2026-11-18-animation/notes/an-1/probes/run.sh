#!/usr/bin/env bash
# Run every probe under notes/probes against the library, through the app's vitest setup.
# The probes are copied into app/checks/probes for the run and removed afterwards.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
app="$here/../../app"
dest="$app/checks/probes"
rm -rf "$dest"
mkdir -p "$dest"
trap 'rm -rf "$dest"' EXIT
cp "$here"/*.test.ts "$dest"/
cd "$app"
npx vitest run checks/probes "$@"
