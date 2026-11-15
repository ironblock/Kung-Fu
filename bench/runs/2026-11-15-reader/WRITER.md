# Writing tasks for a reader test

You are writing six tasks. Each will later be given to other models, to see how well they do with different things in their hands. You will not be told what those things are, and you do not need to know.

## What you have

- `babylon-lite/`: the Babylon Lite repository at its release 1.39.0, without its `docs`, `lab` and `reference` directories. The library's source is under `babylon-lite/packages/babylon-lite/src`. Its own unit tests are under `babylon-lite/tests/lite/unit`, and they run without a browser: `cd babylon-lite && npx vitest run --project unit tests/lite/unit/<file>`.
- `app/`: a small app that uses the library from that checkout under the name `@babylonjs/lite`. `cd app && npx vitest run` runs every `*.test.ts` under `app/src` and `app/checks`.
- `app/checks/helpers.ts`: a canvas that is a plain object, a real scene on the library's null engine, and a function that runs a frame. Read it. Your checks use it.

Work only inside this directory. Do not use the network. Do not read anything outside this directory.

## What a task is

A task is something a developer might ask for in an app that uses the camera code of this library (`src/camera`): a function to add to the app. A subject will get the ask, the app and the checkout. It writes one file under `app/src`. Afterwards a check that the subject never sees is run on its file.

Each task is a directory, `tasks/B1` to `tasks/B6`, with these files:

- `ask.md`: the ask, in the words of the developer who wants it, to someone who has never seen this library. It names the file to write and gives the exact signature of the function to export. It says everything the check will look at, as things the developer wants and not as a list of test cases. It names no function of the library, no file of the library and no step to take, except where the developer would naturally say it. 150 words at most.
- `check.test.ts`: the check. It imports the subject's file from `../src/<file>` and the helpers from `./helpers`. It drives the function and asserts on what can be seen from outside: the camera's fields, what the library's own functions return for it, the canvas's listeners, the scene's per-frame list. It never reads the text of the subject's file.
- `reference.ts`: an answer that passes the check.
- `plain.ts`: the answer of someone who went by the names and signatures of the library's functions and did not read their bodies, their comments or the tests. It must look reasonable, and it must fail the check.
- `where.md`: for the thing the plain answer gets wrong, the file and lines of `src` that decide it, the makers' unit test that pins it (the file and the title of the case), and whether a comment in `src` says it.

## What makes a good task

1. **It has a way to go wrong that only reading shows.** The plain answer runs without an error and does the wrong thing, or does nothing. Take the behaviour from a case of the makers' unit tests: that is the proof the makers mean it.
2. **Six tasks on six different things.** Spread them over `src/camera`. No two tasks may turn on the same behaviour, and no more than two may turn on the same file.
3. **Not these three**, which other tasks already cover: keyboard control of the arc-rotate camera; `attachControl` called without a scene; what interrupts `interpolateArcRotateCamera`.
4. **Only the public face.** The reference answer imports only from `@babylonjs/lite`, and uses nothing whose name begins with an underscore.
5. **The check tests the ask and nothing else.** Every assertion must follow from a sentence of `ask.md`. Where the ask fixes a number, the check may test it. Where it does not, the check tests a direction or a relation: more, less, unchanged, equal to what the library returns. A right answer written another way must pass, so write one other right answer yourself and try it.
6. **No browser, no timer that waits, no network.** If a function of the library needs `window` or `document`, do not build a task on it.
7. **One function, one file.** The signature takes what a check can make: a canvas (`HTMLCanvasElement`), a scene (`SceneContext`), plain numbers and objects.

## Before you finish

For each task run these from `app`:

- the check, with `reference.ts` copied to the file the ask names: it must pass;
- the check, with `plain.ts` copied there: it must fail, and at an assertion, not at an import or a type;
- the check, with your other right answer: it must pass.

Leave `app/src` empty at the end. Put the commands you ran, and what each printed, in `tasks/RUNS.md`.

Then report: one line for each task, saying what it asks and what the plain answer gets wrong, and any doubt you have about a task.
