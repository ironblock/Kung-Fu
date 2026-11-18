# Writing notes for a reader who cannot see the code

Your directory is given in your message. Work only inside it. Do not use the network. Do not read anything outside it.

## What you have

- `babylon-lite/`: the Babylon Lite repository at its release 1.39.0, without its `docs`, `lab` and `reference` directories. The library's source is under `babylon-lite/packages/babylon-lite/src`. Its own unit tests are under `babylon-lite/tests/lite/unit`, and they run without a browser: `cd babylon-lite && npx vitest run --project unit tests/lite/unit/<file>`.
- `app/`: a small app that uses the library from that checkout under the name `@babylonjs/lite`. `cd app && npx vitest run` runs every `*.test.ts` under `app/src` and `app/checks`.
- `app/checks/helpers.ts`: a canvas that is a plain object, a real scene on the library's null engine, and a function that runs a frame.
- `names/animation-bare.d.ts`: the type declarations of `src/animation` as the compiler cuts them, with every comment removed.

## The reader

A developer who knows Babylon.js well and is about to use the animation code of Babylon Lite 1.39.0 (`src/animation`) in an app. They hold `names/animation-bare.d.ts` and your notes, and nothing else. They cannot read the library's code and cannot run anything. They will be asked to write functions that use the animation code, and to answer questions about what it does. You do not know what they will be asked.

From the declarations they already have every name, every parameter and every type. Your notes are for what they need to know besides, to use this code correctly. Do not write what the declarations already say.

## What a note is

One or two plain sentences that state one thing the library does. Use the library's own names for functions and fields. At most 240 bytes. No "usually", no "should": say what happens.

A note says no more than was seen. If you saw it for one function, write it for that function. For each note, write a test under `notes/probes/` that runs the library and shows it, and run it.

## The order

Put the notes in order, the most needed first. A note is needed more when a developer is more likely to depend on the thing, and when they would go further wrong without the note.

At most 60 notes. Fewer good ones are better than more weak ones.

## What to hand in

`notes/facts.json`: a list, in order, of objects with:
- `text`: the note;
- `about`: the file of `src/animation` it is about (the file's name only);
- `probe`: the file under `notes/probes/` that shows it.

And `notes/RUNS.md`: what you did, the command that ran your probes and what it printed, and what you did not look at.

Leave `app/src` empty and `app/checks` holding only `helpers.ts` at the end.

When you finish, report in under 200 words: how many notes, how you chose and ordered them, the three you are least sure of, and what you did not look at. Do not paste the notes.
