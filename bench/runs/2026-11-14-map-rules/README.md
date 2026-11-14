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

## What the first two rounds came to, 2026-11-14

`tally.py` printed these from `r1` and `r2`. The first round's marks are those of the first run.

| | round 1: the first task | round 2: `rules/2.md` |
|---|---|---|
| rows | 204 | 206 |
| rows that run `ast-grep` | 5 | 200 |
| sentences marked false | 46, which is 22% | 12, which is 5% |
| sentences marked shown | 16 | 30 |
| rows with a fault from the maintainer's list | 188, which is 92% | 129, which is 62% |
| breaks the row caught | 24 of 66, which is 36% | 45 of 71, which is 63% |
| rows that fail a week on | 5 | 0 |
| of the twelve names, for a ledger | 9.5 | 9.8 |

Every measure moved the way that was called better beforehand, and the ledgers still point at the same places. No breaker left the code changed, and no checker or breaker changed a ledger. One breaker tried to write a file outside its directory, was refused, and said so.

**What the second round's mappers stumbled on,** by their own reports: a pattern that is a little off matches nothing and says nothing of it, such as a return type left out, or a comma inside a pattern written in the inline form of a rule; `ley` refuses a sentence that repeats what its command prints, and so the claim moved into the row's name; forty rows were too few for some to keep every chain of proof.

**The 26 breaks that round two missed** are in `r2/breaks`. Read here, they fall into a few kinds.

- **The row matches the line and not what the line must be.** Three ledgers have a row for the cells a function sets to zero. In each, changing which cell is zeroed left the row passing.
- **The row does not hold where.** Two ledgers say a hook is installed only from inside one function. Moving the call out of the function left both passing.
- **The claim is about what the code does, and the row is about how it is spelled.** A fallback added in an `else`, a call taken out of a `catch`, a clamp that lost its upper bound: nothing the rows search for changed.
- **Another spelling.** A second path to the same file, an alias for a module, a variable with another name, a field given in an object and not set by an assignment.

## What is changed for the third round, and why

`rules/3.md` is `rules/2.md` with four changes, one for each kind of miss.

- **Rule 1 says that the name and the sentence together are the claim.** In round two the claim had moved into the name.
- **Rule 2 says to leave open what the claim does not turn on, and to pin what it does:** which function, which argument, which index.
- **Rule 3 says to think of the other ways a thing can be written before a row says none or only,** and to run the search once made wider.
- **A seventh rule: break it yourself.** For each row the mapper finds the smallest change that would make the claim false and sees that the count would change. This is what the breaker does afterwards, asked of the mapper first.

The checker's task and the breaker's task are not changed.
