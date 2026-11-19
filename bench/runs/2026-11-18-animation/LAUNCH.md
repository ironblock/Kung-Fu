# How this run was launched

Written 2026-11-18 by Claude Opus 5.5, in a Claude Code session on the maintainer's machine, before any try. This is the session that sent `bench/runs/2026-11-17-effort-ladder` and `bench/runs/2026-11-18-mended-notes`. It follows `HANDOFF.md` step by step, at commit `be36bb4c`, the commit that file came in.

## The go

`HANDOFF.md` says that the maintainer handing over that file is the go. He handed it to this session on 2026-11-18 at about 21:37Z.

## The subject, set beside the mended-notes run's

Each line says whether it is what `bench/runs/2026-11-18-mended-notes` had.

- **The model's files: the same.** `turboderp/Qwen3.8-27B-exl3`, branch `3.00bpw`, revision `6fe61ad620abfe97c5b49f9722c2bceeea4ccc28`. All 16 download records name it.
- **The template: the same.** The build's own `chat_template.jinja`, whose sha256 begins `c3cf9e34abf4f9e3`.
- **The server: the same process.** It was started at 17:17:58Z on 2026-11-18 and served every try of the mended-notes run.
- **The server's programs: the same.** TabbyAPI `be74bf0a`, ExLlamaV3 1.5.4, and a DFlash2 draft model.
- **The server's settings: the same.**
  - The configuration file's sha256 begins `612743fc16e1a0fc`.
  - The preset is `qwen38_thinking`.
  - Context: 163,840 tokens.
  - Cache: 163,840 tokens, with 8-bit keys and values.
  - Requests at once: two.
- **The machine: the same.** Kernel 7.3.4-ogc8.1 and GPU driver 620.70.06.

Nothing differs from the mended-notes run. That `LAUNCH.md` says what differs from the effort ladder: a new server process and a later kernel. Both hold here too.

## Before any try

- `box.py declarations --dirs animation --name animation --no-comments` reported `animation: 14 files, 18263 bytes, sha256 c49900276505a6cd2fb32145962328ab366d1022a54b1aa95d2fd8098b5fd934`. It was written to the texts directory that `bench/box.local.json` names.
- `box.py check-tasks bench/sets/animation` ended with `window: stub; all as they must be`.
- `box.py setup` printed `216 tries set up now; 216 set up in all`.
- `small.py prompt --task AP1 --n 1` gave one message for each arm. Each holds the line `You cannot open files or run anything from where you are, so here is each of those files, whole:`.

  | Arm | Bytes |
  |---|---|
  | `names-low` | 19,900 |
  | `one-low` | 28,641 |
  | `merged-low` | 33,160 |

## Sending

The command in `HANDOFF.md`, step 7, in message form 2, with `--parallel 2`. The arms are sent in this order: `names-low`, then `one-low`, then `merged-low`. Nothing is read between the arms. The sending may stop and start again, as the ladder's `LAUNCH.md` says.

## What came

| Arm | Kept | Cut off | Not run | First try sent | Last try sent | Last reply |
|---|---|---|---|---|---|---|
| `names-low` | 72 | 0 | 0 | 21:48:53Z, `AG1/2` | 22:12:24Z, `AP8/3` | 22:13:14Z |
| `one-low` | 72 | 0 | 0 | 22:13:15Z, `AG1/1` | 22:41:34Z, `AP8/3` | 22:42:14Z |
| `merged-low` | 72 | 0 | 0 | 22:42:14Z, `AG1/1` | 23:13:21Z, `AP8/3` | 23:14:35Z |

All times are on 2026-11-18. Each arm's launch began with `launching 72 tries` and ended with no try not run. The sending was not stopped.

- **Loops the server stopped:** none. Its log since the start at 17:17:58Z has no line "generation stopped because a token loop was detected".
- **Grading:** by `box.py grade` at commit `be36bb4c`, which printed `graded 216: 111 passed, 105 failed`.

`box.py tally` printed:

```
passed of tries, by task and arm (spoiled tries and tries played by hand left out)
task     names-low     one-low  merged-low
AG1         0 of 3      0 of 3      1 of 3
AG2         0 of 3      1 of 3      1 of 3
AG3         0 of 3      3 of 3      3 of 3
AG4         3 of 3      3 of 3      3 of 3
AG5         0 of 3      0 of 3      0 of 3
AG6         0 of 3      3 of 3      3 of 3
AG7         1 of 3      3 of 3      3 of 3
AG8         0 of 3      3 of 3      3 of 3
AM1         0 of 3      3 of 3      2 of 3
AM2         0 of 3      0 of 3      2 of 3
AM3         0 of 3      2 of 3      3 of 3
AM4         0 of 3      3 of 3      3 of 3
AM5         0 of 3      3 of 3      3 of 3
AM6         0 of 3      0 of 3      0 of 3
AM7         0 of 3      0 of 3      0 of 3
AM8         0 of 3      0 of 3      0 of 3
AP1         1 of 3      3 of 3      3 of 3
AP2         2 of 3      3 of 3      3 of 3
AP3         3 of 3      3 of 3      3 of 3
AP4         0 of 3      1 of 3      2 of 3
AP5         3 of 3      3 of 3      3 of 3
AP6         1 of 3      3 of 3      3 of 3
AP7         0 of 3      0 of 3      3 of 3
AP8         0 of 3      1 of 3      3 of 3
all       14 of 72    44 of 72    53 of 72
names-low: kept 72, not run 0, not launched 0, not graded 0, spoiled 0; output tokens 210,483; cost $0.0000
one-low: kept 72, not run 0, not launched 0, not graded 0, spoiled 0; output tokens 239,101; cost $0.0000
merged-low: kept 72, not run 0, not launched 0, not graded 0, spoiled 0; output tokens 255,974; cost $0.0000
failures, sorted by whose.txt; a try cut off is among them, sorted "too long"
  names-low             58: not sorted yet 58
  one-low               28: not sorted yet 28
  merged-low            19: not sorted yet 19
```

No failure is sorted here, and "What came" in `README.md` is not written. The owning session reads the tries.

## Changes during the run

None.
