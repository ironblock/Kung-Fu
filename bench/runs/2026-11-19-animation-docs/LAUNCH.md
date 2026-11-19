# How this run was launched

Written 2026-11-19 by Claude Opus 5.5, in a Claude Code session on the maintainer's machine, before any try. This is the session that sent `bench/runs/2026-11-18-animation`. It follows `HANDOFF.md` step by step, at commit `32ea579a`, the commit that file came in.

## The go

`HANDOFF.md` says that the maintainer handing over that file is the go. He handed it to this session on 2026-11-19 at about 20:33Z.

## The subject, set beside the 18th's animation run

Each line says whether it is what `bench/runs/2026-11-18-animation` had.

- **The model's files: the same.** `turboderp/Qwen3.8-27B-exl3`, branch `3.00bpw`, revision `6fe61ad620abfe97c5b49f9722c2bceeea4ccc28`. All 16 download records name it, and no file in the model's folder is newer than 2026-11-18.
- **The template: the same.** The build's own `chat_template.jinja`, whose sha256 begins `c3cf9e34abf4f9e3`.
- **The server: the same process.** It was started at 17:17:58Z on 2026-11-18. It served every try of `bench/runs/2026-11-18-mended-notes` and of `bench/runs/2026-11-18-animation`.
- **Started again, or the model loaded again, since the 18th's run: no.** The process is the one above. Its log since that start has one line `Loading model`, at its start, and no other load or unload.
- **The server's programs: the same.** TabbyAPI `be74bf0a`, ExLlamaV3 1.5.4, and a DFlash2 draft model.
- **The server's settings: the same.**
  - The configuration file's sha256 begins `612743fc16e1a0fc`.
  - The preset is `qwen38_thinking`.
  - Context: 163,840 tokens.
  - Cache: 163,840 tokens, with 8-bit keys and values.
  - Requests at once: two.
- **The machine: the same.** Kernel 7.3.4-ogc8.1 and GPU driver 620.70.06.

Nothing differs from the 18th's animation run.

## The texts

- `box.py declarations --dirs animation --name animation --no-comments` reported `animation: 14 files, 18263 bytes, sha256 c49900276505a6cd2fb32145962328ab366d1022a54b1aa95d2fd8098b5fd934`. It was written to the texts directory that `bench/box.local.json` names.
- **The makers' document.** This session's copy of the library has its `docs` directory. Its `docs/lite/architecture/07-animation.md` is 44,002 bytes, sha256 `5da3ae10e66ac06958a65eca082d14e68230fd3dee9af81ea9844b09fec6067d`. It was copied as it is to `animation-doc.md` in the texts directory, and the copy has the same size and digest.
- The merged notes are the repository's, in the 18th's run folder.

## Before any try

- `box.py check-tasks bench/sets/animation` ended with `window: stub; all as they must be`.
- `box.py setup` printed `144 tries set up now; 144 set up in all`.
- `small.py prompt --task AP1 --n 1` gave one message for each arm. Each holds the line `You cannot open files or run anything from where you are, so here is each of those files, whole:`.

  | Arm | Bytes |
  |---|---|
  | `docs-low` | 64,041 |
  | `merged-low-b` | 33,160 |

- The `merged-low-b` message is the same, byte for byte, as the 18th's `merged-low` message for AP1, made again now, once the box's path is set aside. The box's path is in three lines, and nothing else differs.

## Sending

The command in `HANDOFF.md`, step 7, in message form 2, with `--parallel 2`. The arms are sent in this order: `docs-low`, then `merged-low-b`. Nothing is read between the arms. The sending may stop and start again, as the ladder's `LAUNCH.md` says.

## What came

| Arm | Kept | Cut off | Not run | First try sent | Last try sent | Last reply |
|---|---|---|---|---|---|---|
| `docs-low` | 72 | 0 | 0 | 20:47:20Z, `AG1/2` | 21:23:07Z, `AP8/3` | 21:24:30Z |
| `merged-low-b` | 72 | 0 | 0 | 21:24:31Z, `AG1/1` | 21:55:54Z, `AP8/3` | 21:56:58Z |

All times are on 2026-11-19. Each arm's launch began with `launching 72 tries` and ended with no try not run. The sending was not stopped.

- **Loops the server stopped:** none. Its log since the start at 17:17:58Z on 2026-11-18 has no line "generation stopped because a token loop was detected". It still has one `Loading model` line, at that start.
- **Grading:** by `box.py grade` at commit `32ea579a`, which printed `graded 144: 80 passed, 64 failed`.

`box.py tally` printed:

```
passed of tries, by task and arm (spoiled tries and tries played by hand left out)
task      docs-low merged-low-
AG1         0 of 3      1 of 3
AG2         1 of 3      0 of 3
AG3         3 of 3      3 of 3
AG4         3 of 3      3 of 3
AG5         3 of 3      0 of 3
AG6         0 of 3      3 of 3
AG7         3 of 3      3 of 3
AG8         0 of 3      3 of 3
AM1         0 of 3      3 of 3
AM2         0 of 3      1 of 3
AM3         0 of 3      3 of 3
AM4         0 of 3      3 of 3
AM5         2 of 3      3 of 3
AM6         0 of 3      0 of 3
AM7         0 of 3      0 of 3
AM8         0 of 3      0 of 3
AP1         3 of 3      3 of 3
AP2         2 of 3      3 of 3
AP3         3 of 3      3 of 3
AP4         0 of 3      3 of 3
AP5         3 of 3      3 of 3
AP6         3 of 3      3 of 3
AP7         0 of 3      1 of 3
AP8         0 of 3      3 of 3
all       29 of 72    51 of 72
docs-low: kept 72, not run 0, not launched 0, not graded 0, spoiled 0; output tokens 226,256; cost $0.0000
merged-low-b: kept 72, not run 0, not launched 0, not graded 0, spoiled 0; output tokens 258,530; cost $0.0000
failures, sorted by whose.txt; a try cut off is among them, sorted "too long"
  docs-low              43: not sorted yet 43
  merged-low-b          21: not sorted yet 21
```

No failure is sorted here, and "What came" in `README.md` is not written. The owning session reads the tries.

## Changes during the run

None.
