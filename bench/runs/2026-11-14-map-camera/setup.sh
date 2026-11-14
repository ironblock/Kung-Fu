#!/bin/sh
# Make one mapper's directory ready. Usage: setup.sh SOURCE WORK NAME AST_GREP LEY
#   SOURCE    the library's source at the pinned release, a directory that will be copied to WORK/NAME/src
#   WORK      a directory outside this repository
#   NAME      the mapper, such as opus-1
#   AST_GREP  the real ast-grep program; LEY the real ley program
set -e
here=$(cd "$(dirname "$0")" && pwd)
box="$2/$3"
mkdir -p "$box/bin"
cp -R "$1" "$box/src"
cp "$here/task.md" "$box/task.md"
for tool in ast-grep ley; do
    real=$4; [ "$tool" = ley ] && real=$5
    sed -e "s|@REAL@|$real|" -e "s|@LOG@|$box.calls.jsonl|" -e "s|@NAME@|$tool|" "$here/wrapper.py" > "$box/bin/$tool"
    chmod +x "$box/bin/$tool"
done
sed "s|@DIR@|$box|g" "$here/request.txt" > "$box.request.txt"
echo "$box"
