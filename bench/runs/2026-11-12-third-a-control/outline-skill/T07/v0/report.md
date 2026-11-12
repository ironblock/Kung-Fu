A. Find every call `herald.announce(...)` on a plain `herald` identifier in src (JavaScript, all files), matching from `herald` through the closing parenthesis, excluding other receivers, nested `herald` properties, other methods, bare references, and strings.

B. unsure

Answer written to /tmp/claude-0/-home-user/5a6488dd-41c7-5be7-b55c-ee990999c7a9/scratchpad/bench-work/2026-11-12-third-a-control/outline-skill/T07/v0/answer.txt:
ast-grep run --pattern 'herald.announce($$$ARGS)' --lang javascript --globs '*' src

Reasoning: the pattern's object is the bare identifier `herald`, so `this.herald.announce(...)` and `room.herald.announce(...)` do not match; the property is fixed to `announce`, so `announceAll` and `whisper` do not match; with no trailing parentheses in a reference, `herald.announce` passed as a value does not match. `--lang javascript` forces the parser for all files, and `--globs '*'` is there to include files with unusual or missing extensions. I could not run ast-grep, so the `--globs` behavior with `--lang` in 0.51.1 is unverified, and that is why I rate this unsure.
