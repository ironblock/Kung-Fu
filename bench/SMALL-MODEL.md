# Repeating a run on a small model

Written 2026-11-16 by an Opus model working to a brief by Claude Fable 5.2, and checked by a second.

This page says how to run the camera tasks on another machine, against a model you host yourself. The model is reached through an OpenAI-compatible chat endpoint: a base URL that answers `POST /v1/chat/completions`. Nothing else about it is assumed. It need not support tool calls.

## What is different from the runs in this repository

Every run in `bench/runs` gave its subject a box. The subject was a `claude -p` process. It could read and write files there, one call at a time, as often as it liked.

Here the subject gets one message and gives one reply. The message holds the request and the whole content of each file the arm hands over. The reply holds every file the subject writes, each in a fenced block under a line `FILE: app/<path>`. `bench/small.py` writes those files into the try's box, and the try is kept as `box.py` keeps a box subject's try. So `box.py grade`, `tally`, `compare` and `answers` work as they are.

So a result here is not the same measure as a result in `bench/runs`. The subject cannot read a file twice, cannot look at what it wrote, and has the whole text in its context at once. `small.py launch --via-claude MODEL` sends the same message to a model through the local `claude` program, with no tools. That sets the one-shot form beside the box form for one model on one machine.

The request still names the box's path, as `box.py setup` wrote it. It says "Read them first" and "keep every change inside" that path. The files follow in the same message. In the one try made through `--via-claude` while this was built, the subject said it could not read files from disk and could not write the file. It wrote the file in the reply all the same, and the file passed.

The first thing to do on any new model is the arm with the bare declarations on the nine old tasks: K1, P1, I1 and B1 to B6. It shows where the model stands before any notes are given to it.

## What you need

- Python 3. `box.py` and `small.py` use the standard library only.
- Node and npm, for the test runner.
- git.
- The model's endpoint: its base URL, the name it knows the model by, and its API key if it needs one.

## Step by step

All paths below are examples. Keep the library, the runner, the boxes and the raw records outside this repository.

1. Get this repository, and work at its root.

2. Get the library at the release and the commit the runs name: Babylon Lite 1.39.0, commit `2dddc888f6695e433ab29ae5918bee221375d86f`. Copy it without the `lab` and `reference` directories, which hold demo assets and pictures.

   ```sh
   git clone https://github.com/BabylonJS/Babylon-Lite /work/lib
   git -C /work/lib checkout 2dddc888f6695e433ab29ae5918bee221375d86f
   mkdir -p /work/pristine/babylon-lite
   tar -C /work/lib --exclude=./lab --exclude=./reference --exclude=./.git -cf - . | tar -C /work/pristine/babylon-lite -xf -
   ```

   `box.py` expects the pristine path to be the repository's root, the directory that holds `packages/babylon-lite`.

3. Install the test runner from the package file the reader run keeps, `bench/runs/2026-11-15-reader/runner-package.json`.

   ```sh
   mkdir -p /work/runner
   cp bench/runs/2026-11-15-reader/runner-package.json /work/runner/package.json
   (cd /work/runner && npm install --ignore-scripts)
   ```

   `box.py` takes the runner's directory and uses the `node_modules` inside it. It runs `tsc` from `node_modules/.bin` and `vitest` through `npx`. The package file gives ranges, not exact versions, so check that `/work/runner/node_modules/.bin/tsc --version` says `Version 6.0.3`, the version the runs name. A later `tsc` can cut the declarations differently (step 6).

4. Write `bench/box.local.json`. git ignores it.

   ```json
   {"pristine": "/work/pristine/babylon-lite", "runner": "/work/runner", "boxes": "/work/boxes", "raw": "/work/raw"}
   ```

   `boxes` is where each try's box goes. `raw` is where the raw request and response of each try go. Make both directories. The box's path is written into every try's `request.md`, `sent.md` and `setup.json`, and the subject reads it. So choose a path that names no person or machine, such as `/home/dev` as the runs here did, and not a path under your home directory.

5. Check the tasks. Each reference answer must pass, and each plain answer must fail.

   ```sh
   python3 bench/box.py check-tasks bench/sets/camera
   ```

   The last line must say `all as they must be`.

6. Cut the declaration texts. They are not in this repository, because they are the library's files.

   ```sh
   python3 bench/box.py declarations --out /work/texts --no-comments
   ```

   It writes `/work/texts/declarations-bare.d.ts` and prints its sha256. It must be `6eb658f9f54043ed0726418845981ef05caa42032069734dc269584c84aa30a6`, 14,002 bytes, as in `bench/runs/2026-11-15-camera-union/run.json` under `texts.names`. The tool says whether it is. If it is not, stop: the subject would be handed a different text.

7. Make the run's directory, for example `bench/runs/2026-11-20-small-bare`. Copy `request.md` from `bench/runs/2026-11-15-camera-union`. Write `run.json`:

   ```json
   {
    "set": "../../sets/camera",
    "tasks": ["K1", "P1", "I1", "B1", "B2", "B3", "B4", "B5", "B6"],
    "request": "request.md",
    "window": "stub",
    "texts": {
     "names": {"path": "/work/texts/declarations-bare.d.ts",
               "sha256": "6eb658f9f54043ed0726418845981ef05caa42032069734dc269584c84aa30a6", "bytes": 14002,
               "made": "box.py declarations --no-comments, tsc 6.0.3, from Babylon Lite 1.39.0"}
    },
    "arms": {
     "bare": {"model": "small", "files": {"camera-api.d.ts": "names"},
              "guide": "What I do have is the library's type declarations for its camera code, in @BOX@/app/camera-api.d.ts. Read them first.",
              "tries": 3}
    },
    "pairs": [],
    "matters": 0.25
   }
   ```

   `"model": "small"` tells `box.py` that `small.py` launches this arm. `box.py launch` leaves it alone. Write down what the run is for before any try, as `AGENTS.md` asks.

8. Set the run up.

   ```sh
   python3 bench/box.py setup bench/runs/2026-11-20-small-bare
   ```

9. Look at one message before you send any.

   ```sh
   python3 bench/small.py prompt bench/runs/2026-11-20-small-bare --arm bare --task K1 --n 1
   ```

   It prints the message exactly as it would be sent, and then its size in bytes and in tokens. The tokens are an estimate: the bytes divided by 3.5.

10. Launch.

    ```sh
    export MY_KEY=...   # only if the endpoint needs a key
    python3 bench/small.py launch bench/runs/2026-11-20-small-bare \
       --base-url http://localhost:8000 --model the-name-the-endpoint-knows \
       --api-key-env MY_KEY --context-limit 32000 --max-tokens 8000 --label "a 27B open-weights model"
    ```

    `--context-limit` is the model's context in tokens. A message whose estimate is over it is not sent. It is counted as "did not fit". `--label` is the model in words. It is kept in each `record.json`. Do not put the model's identifier there. `--parallel` is 2 by default. A try whose request fails, times out, or comes back with no choice is not kept. Run the same command again to send it again. Each relaunch is counted.

11. Grade, tally and compare.

    ```sh
    python3 bench/box.py grade bench/runs/2026-11-20-small-bare
    python3 bench/box.py tally bench/runs/2026-11-20-small-bare
    python3 bench/box.py compare bench/runs/2026-11-20-small-bare
    python3 bench/box.py answers bench/runs/2026-11-20-small-bare --task K1
    ```

    Then read every answer and sort each failure, as `AGENTS.md` says, before you explain any number.

## What to send back

Send the run's directory: `run.json`, `request.md`, and the whole of `tries/`. Each try holds `request.md`, `setup.json`, `sent.md` (the message as sent), `app/`, `report.txt`, `steps.json`, `record.json`, `grade.json` and `grade.txt`. Each kept file passed the privacy scan before it was written. A try that did not fit holds `did-not-fit.json` instead.

Do not send `bench/box.local.json`, the library, the runner, the texts or the raw directory. The raw directory holds the endpoint's URL and the model's name.
