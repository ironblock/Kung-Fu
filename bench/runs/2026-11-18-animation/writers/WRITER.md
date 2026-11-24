# Writing tasks for a reader test

You are writing eight tasks. Each will later be given to other models, to see how well they do with different things in their hands. You will not be told what those things are, and you do not need to know.

Your directory is given in your message. Work only inside it. Do not use the network. Do not read anything outside it.

## What you have

- `babylon-lite/`: the Babylon Lite repository at its release 1.39.0, without its `docs`, `lab` and `reference` directories. The library's source is under `babylon-lite/packages/babylon-lite/src`. Its own unit tests are under `babylon-lite/tests/lite/unit`, and they run without a browser: `cd babylon-lite && npx vitest run --project unit tests/lite/unit/<file>`.
- `app/`: a small app that uses the library from that checkout under the name `@babylonjs/lite`. `cd app && npx vitest run` runs every `*.test.ts` under `app/src` and `app/checks`.
- `app/checks/helpers.ts`: a canvas that is a plain object, a real scene on the library's null engine, and a function that runs a frame. Read it. A check may use it, or define what else it needs inside its own file.
- `names/animation-bare.d.ts`: the type declarations of `src/animation` as the compiler cuts them, with every comment removed. This is all that one kind of later reader will hold about the library.

## The reader you are writing against

A capable model that knows Babylon.js well, holds only `names/animation-bare.d.ts`, and cannot read the library's code or run anything. It reads a signature, and fills in what the function does from the name and from what Babylon.js does.

A task is only worth writing here if that reader would get it wrong. That happens where:

1. Babylon Lite does something other than what Babylon.js does under the same or a like name (another unit, another sign, another default, another order, another moment at which a thing takes effect);
2. the behaviour is Babylon Lite's own and no name or type gives it away (what is ignored, what is clamped, what is reset and when, what needs another thing to be present, what wins when two settings disagree);
3. the right use needs a step, an order or a value that the signature does not show.

Before you write a task, write down in `where.md` the answer that reader would give and why it would give it. If you cannot say why it would go wrong, drop the task.

## What a task is

A task is something a developer might ask for in an app that uses the animation code of this library (`src/animation`). The reader gets the ask and the app. Afterwards a check that the reader never sees is run on what it wrote. There are two kinds.

**A code task** (at least five of your eight): a function to add to the app. Its directory holds:
- `ask.md`: the ask, in the words of the developer who wants it, to someone who has never seen this library. It names the file to write and gives the exact signature of the function to export. It says everything the check will look at, as things the developer wants and not as a list of test cases. It names no function of the library, no file of the library and no step to take, except where the developer would naturally say it. It must not state the behaviour the task turns on. 150 words at most.
- `file.txt`: the path of the file the ask names, from `app` (for example `src/fade-in.ts`), and nothing else.
- `check.test.ts`: the check. It imports the reader's file from `../src/<file>` and may import `./helpers`. It drives the function and asserts on what can be seen from outside: the values the animation writes to its targets after a number of steps, what the library's own functions return, the scene's per-frame list. It never reads the text of the reader's file.
- `reference.ts`: an answer that passes the check.
- `other.ts`: a second right answer, written another way. It must pass.
- `plain.ts`: the answer the reader described above would write. It must look reasonable, run without an error, and fail the check at an assertion.
- `hollow.ts`: see "A check a wrong answer cannot pass", below. It must fail the check at an assertion.
- `where.md`: see below.

**A question task** (at most three of your eight): a question about what the library does, whose answer the developer needs before deciding something. Its directory holds:
- `ask.md`: the question, with the reason the developer needs it, and the exact shape of a JSON file to write the answer to, at a path under `notes/` in the app. The answer has at least three fields, each a boolean or a number, so that guessing rarely gets all of them. 150 words at most.
- `answer-file.txt`: the path of that JSON file from `app`, and nothing else.
- `expected.json`: the right answer.
- `proof.test.ts`: a test that shows, by running the library, that every field of `expected.json` is right. It reads `expected.json` and asserts each field against what the library does.
- `where.md`: see below.

`where.md`, for both kinds, says in this order:
- the behaviour the task turns on, in one sentence;
- the answer the reader described above would give, and why;
- the file and lines of `src` that decide it;
- the makers' unit test that pins it (the file and the title of the case), or "none";
- `comment: yes` if a doc comment that the compiler would carry into the type declarations states the behaviour, `comment: no` if none does, and the comment's words when yes.

## A check a wrong answer cannot pass

An audit of an earlier set of tasks found that every one of its code tasks had a check that some wrong answer passed. Write your checks so that this cannot happen:

- **Read what the library itself reports,** not only what the answer returns or what a field reads back. An answer can keep its own copy of a value, or put its own accessor on an object, and report what the check expects while the library never did the work. Where it matters, keep the library's own accessor or function from before the answer runs, and read through it afterwards.
- **Drive the library's path where the ask names it.** If the ask says the developer wants the library's own easing, blending or timing, check a property that only the library's path has (the shape of the curve, the order of events), so that a hand-made loop fails.
- **Go past the defaults and the easy case.** Use more than one step, values outside the defaults, more than one target, a second call. A value right only for the check's own inputs must fail.
- **Write `hollow.ts`:** the most plausible answer you can find that does not do on the real library what the ask asks, and that a careless check would pass. Then make sure the check fails it. If you find more than one, add them as `hollow-<name>.ts`; each must fail.

## What makes a good set of eight

1. **Eight different behaviours**, all within the files your message names. No two tasks on one behaviour.
2. **At least five with `comment: no`.** A behaviour that the makers wrote down in a doc comment is easy to find. Find the ones they did not write down, by reading the function bodies and by running probes of your own.
3. **Only the public face.** The reference answer imports only from `@babylonjs/lite`, and uses nothing whose name begins with an underscore. The ask names no function whose name begins with an underscore.
4. **The check tests the ask and nothing else.** Every assertion must follow from a sentence of `ask.md`. Where the ask fixes a number, the check may test it. Where it does not, the check tests a direction or a relation.
5. **No browser, no timer that waits, no network.** If a function of the library needs `window` or `document`, do not build a task on it.
6. **One function, one file** for a code task. The signature takes what a check can make: a scene (`SceneContext`), plain numbers and objects, and what the library's own functions make from them.
7. **Things a developer would really need.** Not a trick, and not a corner nobody would reach.

## Before you finish

For each code task run these from `app`, with `check.test.ts` copied to `app/checks/<id>.test.ts`:
- the check, with `reference.ts` copied to the file the ask names: it must pass;
- the check, with `other.ts` there: it must pass;
- the check, with `plain.ts` there: it must fail, and at an assertion, not at an import or a type;
- the check, with each `hollow*.ts` there: each must fail, at an assertion.

For each question task run `proof.test.ts` (copied to `app/checks/<id>.proof.test.ts`, with `expected.json` where it reads it): it must pass. Then change one field of `expected.json` and run it again: it must fail. Put the right file back.

Leave `app/src` empty and `app/checks` holding only `helpers.ts` at the end. Put the commands you ran, and what each printed, in `tasks/RUNS.md`.
