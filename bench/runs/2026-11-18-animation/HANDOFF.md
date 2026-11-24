# Hand-off: send the tries of the animation run

Written by Claude Opus 5.5 on 2026-11-18, for the session on the maintainer's machine that sent `bench/runs/2026-11-17-effort-ladder` and `bench/runs/2026-11-18-mended-notes`. This run's `README.md` says what it is for. Send nothing unless the maintainer has said go for it; the maintainer handing you this file is that go. Write it in `LAUNCH.md`.

Three arms, each the 24 animation tasks by 3 tries: 216 tries, at reasoning effort `low`, in **message form 2**. At the last runs' pace, about an hour and a half.

Do these in order. Stop and say what you found if any step does not come out as written.

1. **Check out the commit this file came in**, and stay on it until every try is graded.
2. **Cut the declarations.** They are the library's file, so they are not in the repository:

   ```sh
   python3 bench/box.py declarations --dirs animation --name animation --no-comments --out <your texts directory>
   ```

   It must report `animation: 14 files, 18263 bytes, sha256 c49900276505a6cd2fb32145962328ab366d1022a54b1aa95d2fd8098b5fd934`. The texts directory is the one `bench/box.local.json` names under `"texts"`. The two note texts are in the repository, under this run's `notes/`.
3. **Write `LAUNCH.md` in this run's directory before any try,** in the form of the mended-notes run's: the go, and that the build, the template, the server and its settings are the ones those runs had. If any differs, say what differs; send nothing if the model's files, the template or the server's settings differ.
4. `python3 bench/box.py check-tasks bench/sets/animation` must end `window: stub; all as they must be`. It grades 143 answers and takes some minutes.
5. `python3 bench/box.py setup bench/runs/2026-11-18-animation` must print `216 tries set up now`.
6. Look at one message of each arm. Each must hold the line `You cannot open files or run anything from where you are, so here is each of those files, whole:`.

   ```sh
   python3 bench/small.py prompt bench/runs/2026-11-18-animation --arm names-low --task AP1 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-18-animation --arm one-low --task AP1 --n 1
   python3 bench/small.py prompt bench/runs/2026-11-18-animation --arm merged-low --task AP1 --n 1
   ```

   They are about 19,800, 28,600 and 33,100 bytes.
7. **Launch `names-low` first, then `one-low`, then `merged-low`,** each with this command, the arm's name changed. Each first line must begin `launching 72 tries`. The sending may stop and start again, as the ladder's `LAUNCH.md` says. Nothing is read between the arms.

   ```sh
   python3 bench/small.py launch bench/runs/2026-11-18-animation \
     --base-url "$KF_URL" --model "$KF_MODEL" \
     --arm names-low \
     --message-form 2 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
     --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
     --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "low"}}'
   ```

8. **Read the server's log** for loops it stopped, and write each into `LAUNCH.md` with its try.
9. `python3 bench/box.py grade bench/runs/2026-11-18-animation`, then write into `LAUNCH.md` what came: for each arm, the tries kept, cut off and not run, and the first and last times a try was sent; and the output of `python3 bench/box.py tally bench/runs/2026-11-18-animation`.
10. **Commit the tries and `LAUNCH.md`, and nothing else,** and push them to the branch `runs/2026-11-18-animation`.

Do not sort the failures, do not write "What came", and change no check, note, text or tool. The owning session reads the tries.
