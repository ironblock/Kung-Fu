# Writing notes for a reader who cannot see the code

Your directory is given in your message. Work only inside it. Do not use the network. Do not read anything outside it.

## What you have

- `babylon-lite/`: the Babylon Lite repository at its release 1.39.0, without its `docs`, `lab` and `reference` directories. The library's source is under `babylon-lite/packages/babylon-lite/src`. Its own unit tests are under `babylon-lite/tests/lite/unit`.
- `app/`: a small app that uses the library from that checkout under the name `@babylonjs/lite`. `cd app && npx vitest run` runs every `*.test.ts` under `app/src` and `app/checks`.
- `app/checks/helpers.ts`: a canvas that is a plain object, a real scene on the library's null engine, and a function that runs a frame.
- `names/`: the type declarations of four parts of the library (`src/mesh`, `src/light`, `src/shadow`, `src/scene`) as the compiler cuts them, with every comment removed.

## The reader

A developer who knows Babylon.js well and is about to build 3D scenes with Babylon Lite 1.39.0 in an app: meshes, thin instances, lights, shadows, fog, parenting, adding things to a scene and taking them out (`src/mesh`, `src/light`, `src/shadow`, `src/scene`). They hold the files in `names/` and your notes, and nothing else. They cannot read the library's code and cannot run anything. They will be asked to write functions that build and change such scenes, and to answer questions about what the library does. You do not know which.

From `names/` they already have every name, every parameter and every type. From Babylon.js they will fill in what each thing does. Your notes are for what those two leave out or get wrong:

- where Babylon Lite does something other than Babylon.js does under the same or a like name: another unit, sign, default, order, or moment at which a thing takes effect;
- behaviour that is Babylon Lite's own and that no name or type gives away: what is ignored, what is clamped, what is reset and when, what needs another thing to be present, what wins when two settings disagree;
- the step, the order or the value that a right use needs and a signature does not show.

Do not write what the declarations already say. Do not write what Babylon.js does too.

## What a note is

One or two plain sentences that state one thing the library does. Use the library's own names for functions and fields. At most 240 bytes. No "usually", no "should": say what happens.

A note says no more than was seen. If you saw it for one function, write it for that function.

## The order

Put the notes in order, the most needed first. A note is needed more when a developer is more likely to depend on the thing, and when they would go further wrong without the note. The list will later be cut after its first few notes, and again further down, so the order matters as much as the notes do.

At most 60 notes. Fewer good ones are better than more weak ones.

## What to hand in

`notes/facts.json`: a list, in order, of objects with:
- `text`: the note;
- `about`: the file of `src` it is about (for example `shadow/shadow-base.ts`);
- the further fields your message asks for.

And `notes/RUNS.md`: what you did, and what you did not look at.

When you finish, report in under 200 words: how many notes, how you chose and ordered them, the three you are least sure of, and what you did not look at. Do not paste the notes.
