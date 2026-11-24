# Writing tasks for a reader test

You are writing tasks; your message says how many. Each will later be given to other models, to see how well they do with different things in their hands. You will not be told what those things are, and you do not need to know.

Your directory is given in your message. Work only inside it. Do not use the network. Do not read anything outside it.

## What you have

- `babylon-lite/`: the Babylon Lite repository at its release 1.39.0, without its `docs`, `lab` and `reference` directories. The library's source is under `babylon-lite/packages/babylon-lite/src`. Its own unit tests are under `babylon-lite/tests/lite/unit`, and they run without a browser: `cd babylon-lite && npx vitest run --project unit tests/lite/unit/<file>`.
- `app/`: a small app that uses the library from that checkout under the name `@babylonjs/lite`. `cd app && npx vitest run` runs every `*.test.ts` under `app/src` and `app/checks`.
- `app/checks/helpers.ts`: a canvas that is a plain object, a real scene on the library's null engine, and a function that runs a frame. Read it. Your checks use it.
- `names/`: the type declarations of the parts of the library named in your message, as the compiler cuts them, with every comment removed. This is all that one kind of later reader will hold about the library.
- `examples/`: two finished tasks about another part of the library, one of each kind, to show the layout. Do not write about what they are about.

## The reader you are writing against

A capable model that knows Babylon.js well, holds only the files in `names/`, and cannot read the library's code or run anything. It reads a signature, and fills in what the function does from the name and from what Babylon.js does.

An earlier set of tasks was written to trip a reader who "went by the names and signatures". That reader then passed every one of them, three times out of three, because the names and its knowledge of Babylon.js were enough. So a task is only worth writing here if that reader would get it wrong. That happens where:

1. Babylon Lite does something other than what Babylon.js does under the same or a like name (another unit, another sign, another default, another order, another moment at which a thing takes effect);
2. the behaviour is Babylon Lite's own and no name or type gives it away (what is ignored, what is clamped, what is reset and when, what needs another thing to be present, what wins when two settings disagree);
3. the right use needs a step, an order or a value that the signature does not show.

Before you write a task, write down in `where.md` the answer that reader would give and why it would give it. If you cannot say why it would go wrong, drop the task.

## What a task is

A task is something a developer might ask for in an app that builds a 3D scene with the parts of this library named in your message. The reader gets the ask and the app. Afterwards a check that the reader never sees is run on what it wrote. There are two kinds.

**A code task** (most of your tasks): a function to add to the app. Its directory holds:
- `ask.md`: the ask, in the words of the developer who wants it, to someone who has never seen this library. It names the file to write and gives the exact signature of the function to export. It says everything the check will look at, as things the developer wants and not as a list of test cases. It names no function of the library, no file of the library and no step to take, except where the developer would naturally say it. It must not state the behaviour the task turns on. 150 words at most.
- `file.txt`: the path of the file the ask names, from `app` (for example `src/orbit.ts`), and nothing else.
- `check.test.ts`: the check. It imports the reader's file from `../src/<file>` and the helpers from `./helpers`. It drives the function and asserts on what can be seen from outside: the camera's fields, what the library's own functions return for it, the canvas's listeners, the scene's per-frame list. It never reads the text of the reader's file.
- `reference.ts`: an answer that passes the check.
- `plain.ts`: the answer the reader described above would write. It must look reasonable, run without an error, and fail the check at an assertion.
- `where.md`: see below.

**A question task** (at most two of your tasks): a question about what the library does, whose answer the developer needs before deciding something. Its directory holds:
- `ask.md`: the question, with the reason the developer needs it, and the exact shape of a JSON file to write the answer to, at a path under `notes/` in the app. The answer has at least three fields, each a boolean or a number, so that guessing rarely gets all of them. 150 words at most.
- `answer-file.txt`: the path of that JSON file from `app`, and nothing else.
- `expected.json`: the right answer.
- `proof.test.ts`: a test that shows, by running the library, that every field of `expected.json` is right. It reads `expected.json` and asserts each field against what the library does.
- `where.md`: see below.

Look at `examples/B2` and `examples/P1` for one task of each kind.

`where.md`, for both kinds, says in this order:
- the behaviour the task turns on, in one sentence;
- the answer the reader described above would give, and why;
- the file and lines of `src` that decide it;
- the makers' unit test that pins it (the file and the title of the case), or "none";
- `comment: yes` if a doc comment that the compiler would carry into the type declarations states the behaviour, `comment: no` if none does, and the comment's words when yes.

## What makes a good set

1. **Each task on a different behaviour**, all within the parts your message names. No two tasks on one behaviour.
2. **Most with `comment: no`.** A behaviour that the makers wrote down in a doc comment is easy to find. Find the ones they did not write down, by reading the function bodies and by running probes of your own.
3. **Only the public face.** The reference answer imports only from `@babylonjs/lite`, and uses nothing whose name begins with an underscore.
4. **The check tests the ask and nothing else.** Every assertion must follow from a sentence of `ask.md`. Where the ask fixes a number, the check may test it. Where it does not, the check tests a direction or a relation. A right answer written another way must pass, so write one other right answer yourself and try it.
5. **No browser, no timer that waits, no network.** If a function of the library needs `window` or `document`, do not build a task on it.
6. **One function, one file** for a code task. The signature takes what a check can make: an engine and a scene from the helpers, a canvas (`HTMLCanvasElement`), plain numbers and objects. The check runs on the library's null engine, with no browser and no GPU, so it can look at what the library holds and computes (lists, flags, matrices, bounds, vertex data), and not at a picture.
7. **Things a developer would really need.** Not a trick, and not a corner nobody would reach.

## Before you finish

For each code task run these from `app`, with `check.test.ts` copied to `app/checks/<id>.test.ts`:
- the check, with `reference.ts` copied to the file the ask names: it must pass;
- the check, with `plain.ts` copied there: it must fail, and at an assertion, not at an import or a type;
- the check, with your other right answer: it must pass.

For each question task run `proof.test.ts` (copied to `app/checks/<id>.proof.test.ts`, with `expected.json` where it reads it): it must pass. Then change one field of `expected.json` and run it again: it must fail. Put the right file back.

Leave `app/src` empty and `app/checks` holding only `helpers.ts` at the end. Put the commands you ran, and what each printed, in `tasks/RUNS.md`.
