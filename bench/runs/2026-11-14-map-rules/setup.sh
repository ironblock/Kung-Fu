#!/bin/sh
# Make one directory ready for a mapper, a checker or a breaker.
# Usage: setup.sh SOURCE WORK NAME AST_GREP LEY TASK REQUEST [LEDGER] [orig]
#   SOURCE    the library's source at the pinned release; copied to WORK/NAME/src
#   TASK      the file handed over as task.md; REQUEST the request, with @DIR@ where the directory goes
#   LEDGER    a ledger to hand over as ley.toml, for a checker or a breaker
#   orig      the word `orig`: also hand over an untouched copy of the source as src.orig, for a breaker
set -e
here=$(cd "$(dirname "$0")" && pwd)
box="$2/$3"
mkdir -p "$box/bin"
cp -R "$1" "$box/src"
cp "$6" "$box/task.md"
[ -n "$8" ] && cp "$8" "$box/ley.toml"
[ "$9" = orig ] && cp -R "$1" "$box/src.orig"
for tool in ast-grep ley; do
    real=$4; [ "$tool" = ley ] && real=$5
    sed -e "s|@REAL@|$real|" -e "s|@LOG@|$box.calls.jsonl|" -e "s|@NAME@|$tool|" "$here/wrapper.py" > "$box/bin/$tool"
    chmod +x "$box/bin/$tool"
done
sed "s|@DIR@|$box|g" "$7" > "$box.request.txt"
echo "$box"
