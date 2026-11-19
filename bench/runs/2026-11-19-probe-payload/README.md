# One short probe a note

Written by Claude Fable 5.2 on 2026-11-19, from the work of three Opus agents. The maintainer said go for making these on 2026-11-19. No arm that uses them is designed or approved yet, and nothing here has been sent to any model.

## What it is for

The project's first design was "run this to see that": a reader is handed a short piece of code and what it shows, in place of a sentence that states the fact. Every test of the notes so far handed the reader the sentence, and only the writers ran the probes. The notes' own probes are too long to hand over: 112,073 bytes for 67 notes, and each tests more than its note.

`short/NN.ts` is one short, self-contained test for note NN of `bench/runs/2026-11-18-animation/notes/merged/merged.md`. Its title names the situation and not the outcome. Each expectation carries the value the library gives. The note's sentence is not in the file.

## What came

67 files, 80,641 bytes: about 1,200 bytes a note, where the notes' sentences are 13,124 bytes in all. By the agents' reports every file passes against the release. I did not run them.

Four do not show their whole note:

- **05:** the agent found the note too wide. It says the package exports no function whose name begins with `_`; the package's index exports two, from other parts. The file shows the clause for the animation code.
- **15:** shows the default end weight of a fade and not an explicit one, cut for length.
- **19:** shows "ease-in" only as two values below the line for each curve.
- **22:** one clause is shown more loosely than the note states it.

## What it does not settle

- **Size.** Code is about six times as long as the sentences. An arm that sets these beside the notes changes the kind of text and its length together.
- **No reader has been given one.** Whether a model that cannot run anything reads an expectation as a fact is the thing to be tested.
- **The agents wrote these blind to the tasks,** so an arm that used them on the animation set would still be held out.
