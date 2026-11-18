# How this run was launched

Written 2026-11-18 by Claude Opus 5.5, in a Claude Code session on the maintainer's machine, before any try. This is the session that sent `bench/runs/2026-11-17-effort-ladder`. It follows `HANDOFF.md` step by step, at commit `de46716c`, the commit that file came in.

## The go

The maintainer said "Yes" when asked "Go for the 69 tries?". This run's `README.md` gives it, under "The go, and part B held off". The hand-off reached this session on 2026-11-18 at about 17:15Z, carried by the maintainer.

## The subject, set beside `union-low`

Each line says whether it is what `union-low` had in the effort ladder.

- **The build: the same.** `turboderp/Qwen3.8-27B-exl3`, branch `3.00bpw`, revision `6fe61ad620abfe97c5b49f9722c2bceeea4ccc28`. All 16 download records of the files the server loads name that revision, and the weights are dated 2026-10-03, as before.
- **The template: the same.** The build's own `chat_template.jinja`, whose sha256 begins `c3cf9e34abf4f9e3`. The server's log at load says `Using template "chat_template" for chat completions.`
- **The server's programs: the same.**
  - TabbyAPI `be74bf0a`.
  - ExLlamaV3 1.5.4.
  - A DFlash2 draft model, the same as before.
  - The same configuration file, whose sha256 begins `612743fc16e1a0fc`.
  - The same preset, `qwen38_thinking`.
- **Context, cache and requests at once: the same.** 163,840 tokens of context; a cache of 163,840 tokens with 8-bit keys and values; two requests at once.

**Two things differ, and neither is in the hand-off's list.** So this session sends, and writes them here.
- **The server is a new process.** The machine was started again after `union-low` was sent. This session started the server again with the machine's own script, unchanged, at 17:17:58Z. It then made the four checks of a bring-up:
  - the server is up;
  - it has the right model loaded;
  - it is warmed, by a reply of one token in which the draft model was used;
  - its settings are those above.
- **The machine's kernel is a later build.** `union-low` ran on 7.3.4-ogc6.1, and this run runs on 7.3.4-ogc8.1. The GPU driver is the same, 620.70.06.

## Before any try

- `box.py check-tasks bench/sets/camera` ended with `window: stub; all as they must be`.
- `box.py setup` printed `69 tries set up now; 69 set up in all`.
- `small.py prompt --arm mended-low --task K1 --n 1 --message-form 1` was 32,230 bytes, about 9,209 tokens. It holds both lines that the hand-off names:
  - `Here are the files in the app that matter:`
  - `attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first.`

## Sending

The command in `README.md` under "What is sent", with `--parallel 2`. The sending may stop and start again, as the ladder's `LAUNCH.md` says.

## What came

- **Tries:** 69 kept, none cut off by their length limit, none not run, none that did not fit.
- **The first try sent:** 17:23:52Z, `mended-low/A1/1`.
- **The last try sent:** 17:53:33Z, `mended-low/P1/3`. Its reply came at 17:53:46Z.
- **Loops the server stopped:** none. Its log since the start at 17:17:58Z has no line "generation stopped because a token loop was detected".
- **Grading:** by `box.py grade` at commit `de46716c`, which printed `graded 69: 64 passed, 5 failed`.

`mended.py tasks` printed:

```
task    kept   mended-low  call
A1    6/6           3/3    no change shown
A3    6/6           3/3    no change shown
A4    0/6           3/3    mended
A5    1/6           3/3    mended
B1    6/6           3/3    no change shown
B2    6/6           3/3    no change shown
B3    6/6           3/3    no change shown
B4    6/6           3/3    no change shown
B5    6/6           3/3    no change shown
B6    6/6           3/3    no change shown
C3    2/6           3/3    mended
C4    0/6           0/3    no change shown
C5    6/6           3/3    no change shown
F1    3/6           3/3    no change shown
F2    5/6           3/3    no change shown
F5    4/6           3/3    no change shown
G1    0/6           3/3    mended
G2    6/6           3/3    no change shown
G3    6/6           3/3    no change shown
G5    1/6           1/3    no change shown
I1    6/6           3/3    no change shown
K1    3/6           3/3    no change shown
P1    6/6           3/3    no change shown

mended-low: passed 64 of 69 tries
  mended: 4  A4 A5 C3 G1
  broken: 0  
  no change shown: 19  A1 A3 B1 B2 B3 B4 B5 B6 C4 C5 F1 F2 F5 G2 G3 G5 I1 K1 P1
```

No failure is sorted here, and "What came" in `README.md` is not written. The owning session reads the tries.

## Changes during the run

None.
