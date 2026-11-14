# 2026-11-14-map-rules: rules for writing a ledger, tried in rounds

This was written before the second round. It follows `../2026-11-14-map-camera`, which is the first round.

## Why

The maintainer read rows of the first round and put a name to what is wrong with them: a row is a unit test of how code is built, and what would be a fault in a unit test is a fault in a row. Their list of faults: a number written into the test, a test that says the same thing twice, a test that lists something and claims nothing, and a test that shows only that a thing is where its name says. Their cures: compare with a value and not a number, delete the test that tests nothing, tell a warning from an error, and prove the whole claim. They asked for rows written that way, and for a few rounds of trying rules to see which give better rows. The design here is this session's.

## One row of the first round, written again by hand

`hand/first-row.toml` is a row of the first round: a search for a piece of text, with a sentence that says callbacks registered by users run before the camera's own work. `hand/per-frame-order.toml` is the same claim as five rows: the loop that runs the list front to back, the call inside the registration that adds at the front, the five calls by which camera code adds at the back, a search for camera code that adds at the front, which finds none, and every call in the library that adds at the front. All five pass `ley check`.

The code was then broken four ways, each time put back:

| the break | the one row | the five rows |
|---|---|---|
| the registration adds at the back | fails | two fail |
| one camera control adds at the front | passes | three fail |
| the loop runs back to front | passes | one fails |
| a comment that names the call is added, which breaks nothing | fails | all pass |

The one row catches one break of three and gives one false alarm. The five catch all three and give none. Writing them also showed what the sentence had left out: three other parts of the library add at the front too.

## What a round is

- **Six mappers,** three on an Opus model and three on a Sonnet model, each write a ledger for `src/camera` of Babylon Lite 1.39.0, as in the first round, with `rules/N.md` as the task.
- **Six checkers** on an Opus model each mark every sentence of one ledger against the code: `check-task.md`, the task of the first round, word for word.
- **Six breakers** on an Opus model each take one ledger. A breaker names the faults of every row, from the maintainer's list. For every third row it makes the smallest real change to the code that makes the sentence false, runs `ley check`, and writes down whether the row failed. `break-task.md` is its task.

## What is counted, said now

For each ledger: its rows, and how many run `ast-grep`; the checker's marks; the breaker's faults; of the claims that were broken, how many the row caught; how many rows fail at the library's head of 2026-11-13, seventeen commits on; and how many of the twelve names that four or more ledgers of the first round pointed at it still points at.

**Better means:** fewer sentences marked false, more marked shown, more breaks caught, fewer faults, fewer rows failing a week on, and no fewer of the twelve names. A round that gets the first five by saying nothing worth reading has not got better.

## The rounds

1. **The first run's six ledgers,** with breakers only. Their marks are in that run.
2. **`rules/2.md`:** the first run's task with the maintainer's framing put into six rules.
3. **`rules/3.md`,** written after the second round is read and before the third starts, with what was changed and why.
4. **The last rules once more, on `src/light`,** a directory that no rule was fitted to.

## What this cannot carry

- **The rules are fitted to one directory of one library,** by reading results on it. The fourth round is the only check of that, and it is one directory.
- **Mappers, checkers and breakers are one family of model.** A break is a change one of them thought of.
- **Six ledgers a round.** No rule that compares is used. What comes is a direction.

## What it should cost

A guess: 20,000 output tokens a mapper, since the rules ask for a tool that five mappers of six did not call in the first round; 20,000 a checker; 30,000 a breaker.
