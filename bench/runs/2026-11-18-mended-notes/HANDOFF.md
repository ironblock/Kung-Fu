# Hand-off: send the tries of this run

Written by Claude Opus 5.5 on 2026-11-18, for the session on the maintainer's machine that sent `bench/runs/2026-11-17-effort-ladder`. The maintainer's go is in this run's `README.md`, under "The go, and part B held off".

One arm, `mended-low`: the 23 camera tasks, 3 tries each, 69 tries, at reasoning effort `low`. It is the effort ladder's `union-low` with the notes mended in seven places. Everything else must be as `union-low` had it.

Do these in order. Stop and say what you found if any step does not come out as written.

1. **Check out the commit this file came in**, and stay on it until the tries are graded. Later commits on the branch may change the camera checks, and these tries must be graded by the same checks as the 138 they are set beside.
2. **Write `LAUNCH.md` in this run's directory before any try,** in the form of the effort ladder's: the go, and that the build, the template and the server are the ones `union-low` had (`turboderp/Qwen3.8-27B-exl3`, branch `3.00bpw`, revision `6fe61ad620abfe97c5b49f9722c2bceeea4ccc28`; the build's own `chat_template.jinja`; TabbyAPI and ExLlamaV3 as the ladder's `LAUNCH.md` gives them; two requests at once). If any of them differs, send nothing, and write down what differs.
3. `python3 bench/box.py check-tasks bench/sets/camera` must end `window: stub; all as they must be`. G1's check has one more test than when `union-low` was first graded; `union-low` has been graded again with it.
4. `python3 bench/box.py setup bench/runs/2026-11-18-mended-notes` must print `69 tries set up now`.
5. `python3 bench/small.py prompt bench/runs/2026-11-18-mended-notes --arm mended-low --task K1 --n 1 --message-form 1` gives a message of about 32,000 bytes. It holds the line `Here are the files in the app that matter:` and the line `attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first.`
6. **Launch** with the command in `README.md` under "What is sent". Its first line must begin `launching 69 tries`. The sending may stop and start again, as the ladder's `LAUNCH.md` says.
7. **Read the server's log** for loops it stopped, and write each into `LAUNCH.md` with its try.
8. `python3 bench/box.py grade bench/runs/2026-11-18-mended-notes`, then write into `LAUNCH.md` what came: tries kept, cut off, not run; the first and last times a try was sent; and the output of `python3 bench/runs/2026-11-18-mended-notes/mended.py tasks`.
9. **Commit the tries and `LAUNCH.md`, and nothing else,** and push them to the branch `runs/2026-11-18-mended-notes`.

Do not sort the failures, do not write "What came", and change no check, note, text or tool. The owning session reads the tries.
