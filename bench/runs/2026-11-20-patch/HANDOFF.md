# Hand-off: send the tries of the patch run

*(Parked 2026-11-26 by the maintainer, and written here by Claude Opus 5.5: no try of this run is sent. The premise is speculative, and the maintainer does not want to push models to edit files they have not seen whole. The set, the ceiling and the notes stay as they are, as the record of where this stopped.)*

Written by Claude Opus 5.5 on 2026-11-22, for the session on the maintainer's machine that sent `bench/runs/2026-11-19-animation-docs`. This run's `README.md` says what it is for. Send nothing unless the maintainer has said go for it; the maintainer handing you this file is that go. Write it in `LAUNCH.md`.

Six arms, 440 tries, at reasoning effort `low`, in **message form 2**. The reply is asked for as edits, and `small.py` applies them. The messages are smaller than the animation runs': about 1,700 to 34,000 bytes.

Do these in order. Stop and say what you found if any step does not come out as written.

1. **Check out the commit this file came in**, and stay on it until every try is graded.
2. **No library and no text is needed.** Every text the arms hold is in the repository, under `bench/sets/patch/tasks/<task>/holds/`. This machine needs no ast-grep.
3. **Write `LAUNCH.md` in this run's directory before any try,** in the form of the last run's: the go, and that the build, the template, the server and its settings are the ones that run had. If any differs, say what differs; send nothing if the model's files, the template or the server's settings differ. Say also whether the server was restarted or the model loaded again since the last run.
4. `python3 bench/small.py selfcheck` must end `7 of 7 made-up addresses judged as they must be`, and exit 0.
5. `python3 bench/box.py check-tasks bench/sets/patch --window none` must end `window: none; all as they must be`. It grades 921 answers; here it took 17 minutes.
6. `python3 bench/box.py setup bench/runs/2026-11-20-patch` must print `440 tries set up now`. Three notes, that the request holds the words `name`, `outline` and `whole`, are expected.
7. **Look at one message of each arm.** Each must end with the paragraph that begins `Reply with your change as edits.`

   ```sh
   python3 bench/small.py prompt bench/runs/2026-11-20-patch --arm name --task PD2 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-20-patch --arm outline --task PD1 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-20-patch --arm outline-1 --task PD2 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-20-patch --arm region --task PD2 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-20-patch --arm whole --task PD2 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-20-patch --arm whole-b --task PD2 --n 1
   ```

   Here they were about 1,670, 5,050, 4,900, 5,770, 11,630 and 11,630 bytes; a longer box path adds to each. The `name` message holds `All you have of the file is its path: app/src/fuel.ts.` The two `outline` messages hold `Its outline, as`. The `region` message holds that and `Lines 237 to 255 of the file, as they are:`. The `whole` message holds `so here is app/src/fuel.ts, whole:`. The `whole-b` message must be the same, byte for byte, as the `whole` message but for the box's path.
8. **Launch the arms in this order: `whole`, `region`, `outline`, `outline-1`, `name`, `whole-b`.** `whole-b` goes last so that the two rounds of the whole file are as far apart in time as any two arms; the rule is asked whether it can tell them apart. Use this command, with the arm's name changed. Each first line must begin `launching N tries`, with N 144, 96, 48, 32, 48 and 72. The sending may stop and start again, as the ladder's `LAUNCH.md` says. Nothing is read between the arms.

   ```sh
   python3 bench/small.py launch bench/runs/2026-11-20-patch \
     --base-url "$KF_URL" --model "$KF_MODEL" \
     --arm whole \
     --message-form 2 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
     --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
     --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "low"}}'
   ```

9. **Read the server's log** for loops it stopped, and write each into `LAUNCH.md` with its try.
10. `python3 bench/box.py grade bench/runs/2026-11-20-patch`, then write into `LAUNCH.md` what came: for each arm, the tries kept, cut off and not run, and the first and last times a try was sent; and the output of `python3 bench/box.py tally bench/runs/2026-11-20-patch`.
11. **Commit the tries and `LAUNCH.md`, and nothing else,** and push them to the branch `runs/2026-11-20-patch`.

Do not sort the failures, do not write "What came", and change no check, note, text or tool. The owning session reads the tries, and runs `patch.py report`, `rule` and `shapes` on them.
