# Hand-off: send the tries of the animation docs run

Written by Claude Fable 5.2 on 2026-11-19, for the session on the maintainer's machine that sent `bench/runs/2026-11-18-animation`. This run's `README.md` says what it is for. Send nothing unless the maintainer has said go for it; the maintainer handing you this file is that go. Write it in `LAUNCH.md`.

Two arms, each the 24 animation tasks by 3 tries: 144 tries, at reasoning effort `low`, in **message form 2**. At the last run's pace, about an hour.

Do these in order. Stop and say what you found if any step does not come out as written.

1. **Check out the commit this file came in**, and stay on it until every try is graded.
2. **Put the two library texts in your texts directory** (the one `bench/box.local.json` names under `"texts"`). They are the library's files, so they are not in the repository.

   The declarations, as for the last run:

   ```sh
   python3 bench/box.py declarations --dirs animation --name animation --no-comments --out <your texts directory>
   ```

   It must report `animation: 14 files, 18263 bytes, sha256 c49900276505a6cd2fb32145962328ab366d1022a54b1aa95d2fd8098b5fd934`.

   The makers' document, copied as it is from the library's repository at release 1.39.0 (tag `npm-lite-v1.39.0`, commit `2dddc888f6695e433ab29ae5918bee221375d86f`), `docs/lite/architecture/07-animation.md`, to `<your texts directory>/animation-doc.md`. If your copy of the library has no `docs` directory, take the file from a clone:

   ```sh
   git -C <a clone of the library> show 2dddc888f6695e433ab29ae5918bee221375d86f:docs/lite/architecture/07-animation.md > <your texts directory>/animation-doc.md
   ```

   It must be 44,002 bytes, sha256 `5da3ae10e66ac06958a65eca082d14e68230fd3dee9af81ea9844b09fec6067d`. `box.py setup` refuses a text whose digest differs.

   The merged notes are in the repository, in the last run's folder.
3. **Write `LAUNCH.md` in this run's directory before any try,** in the form of the last run's: the go, and that the build, the template, the server and its settings are the ones that run had. If any differs, say what differs; send nothing if the model's files, the template or the server's settings differ. This run sets one arm beside the same arm of the 18th, so say also whether the server was restarted or the model loaded again since then.
4. `python3 bench/box.py check-tasks bench/sets/animation` must end `window: stub; all as they must be`.
5. `python3 bench/box.py setup bench/runs/2026-11-19-animation-docs` must print `144 tries set up now`.
6. Look at one message of each arm. Each must hold the line `You cannot open files or run anything from where you are, so here is each of those files, whole:`.

   ```sh
   python3 bench/small.py prompt bench/runs/2026-11-19-animation-docs --arm docs-low --task AP1 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-19-animation-docs --arm merged-low-b --task AP1 --n 1
   ```

   They are about 64,000 and 33,100 bytes. The second must be the same, byte for byte, as the last run's `merged-low` message for AP1 but for the box's path.
7. **Launch `docs-low` first, then `merged-low-b`,** each with this command, the arm's name changed. Each first line must begin `launching 72 tries`. The sending may stop and start again, as the ladder's `LAUNCH.md` says. Nothing is read between the arms.

   ```sh
   python3 bench/small.py launch bench/runs/2026-11-19-animation-docs \
     --base-url "$KF_URL" --model "$KF_MODEL" \
     --arm docs-low \
     --message-form 2 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
     --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
     --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "low"}}'
   ```

8. **Read the server's log** for loops it stopped, and write each into `LAUNCH.md` with its try.
9. `python3 bench/box.py grade bench/runs/2026-11-19-animation-docs`, then write into `LAUNCH.md` what came: for each arm, the tries kept, cut off and not run, and the first and last times a try was sent; and the output of `python3 bench/box.py tally bench/runs/2026-11-19-animation-docs`.
10. **Commit the tries and `LAUNCH.md`, and nothing else,** and push them to the branch `runs/2026-11-19-animation-docs`.

Do not sort the failures, do not write "What came", and change no check, note, text or tool. The owning session reads the tries.
