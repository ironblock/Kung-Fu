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

## Before the fourth round's checks, 2026-11-14

Written after the fourth round's six ledgers came and before any of them was checked or broken.

- **The six ledgers are in `r4/ledgers`.** Each passes `ley check`, and no mapper changed the code.
- **The checker's task names the directory.** `check-task-light.md` is `check-task.md` with `src/light` where it said `src/camera`, and nothing else changed. The breaker's task names no directory and is used as it is.
- **The count of the twelve names does not apply.** Those names are places in `src/camera`.
- **"Rows that fail a week on" says less than it seemed.** Of the seventeen commits between the release and the library's head of 2026-11-13, none touches `src/camera` or `src/light`, and two touch `src/scene`. A row can fail a week on only where its command reaches outside its directory. That was learned now, by running `git log` on each directory, and it should have been run before the measure was chosen.

## A measure that was missing: false alarms, 2026-11-14

Written after the third round was tallied and before any ledger was run against a changed copy of the code. One thing was seen first: the hand-written rows of `hand/` were run on two of the copies, to see what `ley check` prints, and all of them held.

**What is missing.** A breaker counts how often a row fails when its claim is made false. Nothing counts how often a row fails when its claim is still so. A row that spells out a whole line of code, down to the names of its variables, fails on any change to that line. It would catch every break and be a poor test: it cries at every tidying. The rules of the third round ask for rows that pin more, so the third round's catch rate could have been bought that way.

**The measure.** `tidy.js` makes three copies of the whole of `src`. In each, nothing the code does is changed.

- `comments`: every comment is taken out.
- `names`: every parameter, and every variable declared inside a function, gets a new name. The copy is checked: every file still parses, and the compiler makes the same kinds of complaint about each file, in the same number, as before.
- `format`: every file is printed again by the library's own formatter at 80 columns, where the library uses 180.

`alarms.py` runs every ledger of every round on each copy. A row that held on the code and fails on a copy gave a false alarm, unless its claim is about the thing that was changed: a row that says a function is marked `@internal` is about a comment. Rows that fail on `comments` are read for that before they are counted.

Each change is far wider than one tidying, since it is made everywhere at once. So this counts the rows that depend on a thing at all, and not how often such a row would cry in a month of work.

**What is expected.** These are guesses.

- `comments`: a third or more of the first round's rows fail, since a search for a word finds it in comments too. All six of its ledgers were known to count comments in one row. Few or none of the later rounds' rows fail, since `ast-grep` reads code.
- `names`: few of the first round's rows fail. More of the second round's do, where a pattern spells a variable's name. The third round's rule says to leave open what the claim does not turn on, so fewer than one row in ten there.
- `format`: some of the first round's rows fail, where a search holds two things that the formatter puts on two lines. None of the later rounds'.

**What it would change.** If more than one row in ten of the third or fourth round fails on `names`, the third round's catch rate was partly bought with rows that cry at tidying. Then a rule is owed, and the ledgers are less good than the table says.

**What it cannot carry.** Three changes. One a programmer makes often, taking a value out into a variable of its own, is not among them, and neither is moving code from one file to another. A row that passes all three can still be brittle.
