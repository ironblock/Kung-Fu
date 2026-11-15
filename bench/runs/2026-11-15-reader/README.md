# The reader test (2026-11-15)

Written down before any subject ran. Each later change is in "Changes after this was written", with its date.

## Why

Seven rounds of `../2026-11-14-map-rules` measured ledgers: how many of their sentences a second reader marks false, how many breaks their rows catch, how many rows fail on a harmless change. Every one of those numbers is about the ledger. No reader has read one.

This run asks three things of a reader with a task to do.

1. Does it pass more often, or spend less, with a ledger in hand than with the library alone?
2. How does the ledger compare with the makers' own notes on the same code?
3. What does a false note cost? Checkers marked 42 of 83 notes false in rounds five and six.

The maintainer said the reader test can proceed, on 2026-11-15.

## What a reader holds

Each try has a directory of its own with two things in it.

- `babylon-lite`: the Babylon Lite repository at its release 1.39.0, commit `2dddc888f6695e433ab29ae5918bee221375d86f`. It is the repository's files less the directories `lab` and `reference`, which hold demo assets and reference pictures: 2,865 files, 35 MB. Its source, its unit tests and its docs are all there. The packages the library and its tests need are installed: `runner-package.json` lists them.
- `app`: a small app that imports the library from that checkout under the name `@babylonjs/lite`. It has a `tsconfig.json`, a `vitest.config.ts` and an empty `src`. The same packages are installed, so a subject can run code.

So every subject can read the library's source, the makers' tests and the makers' docs, and can run them. The arms differ only in what the request points at.

**The request is worded as a user's ask.** It gives a reason for the pinned version: "for various reasons I need the exact version that is checked out at … : nothing older or newer can be used". It has no line that says this is a test, and no rule against the network. This follows the maintainer's advice: a model's wish to look a library up on npm is strong, and a rule that forbids it tells the model it is being watched. The whole wording is `REQUEST` in `reader.py`.

**The subject** is a Haiku model, of the kind `bench-subject`: a shell and its files (`Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`). It stands in for the small model this project is for. It is not that model.

## The arms

| arm | what the request adds before the ask |
|---|---|
| `plain-a`, `plain-b` | nothing. One arm, run twice. |
| `doc` | "The library's own notes on its camera code are in the checkout, at …/docs/lite/architecture/02-camera.md. Read them first." The file is 52,885 bytes. |
| `ledger` | a ledger of round five, as its mapper wrote it, put in the app as `camera-ledger.toml`, with four sentences that say what a row is, and "Read the ledger first." |
| `ledger-cut` | the same, with every row that the ledger's checker marked false taken out. |

- **Which ledgers.** The three that an Opus model wrote in round five: `opus-1`, `opus-2`, `opus-3`. A try numbered n gets the ledger numbered n, and tries 4 to 6 go round again. They are 19,517, 21,153 and 17,577 bytes. The rule was fixed before any task was written.
- **What is cut.** 3, 5 and 4 rows: eleven notes and one test. `reader.py guides` makes both kinds from round five's ledgers and marks, and prints the names of the rows it cut. Nothing is mended: a cut note's true sentences go with its false one.
- **Why the plain arm runs twice.** A rule that tells two rounds of one arm apart cannot be trusted to tell two arms apart. `bench/studies/fourth.md` found that out.

Two more runs stand beside the arms and are compared with nothing.

- `ceiling`: an Opus model, with exactly what the plain arm gets, once on each task. It shows that each task can be passed as it is worded.
- `memory`: a Haiku model with the app and no library, of the kind that can run nothing, once on each task. It shows what the subject knows of this library before it reads anything. The library's first release was in June 2026.

## The tasks

Nine tasks, all about `src/camera`, all for someone who uses the library. None asks for a change to the library.

**Six are written by a writer that has seen neither a ledger nor the makers' docs**: `B1` to `B6`. The writer is an Opus model with the library's source and unit tests, the app, and `WRITER.md`. Its copy of the library has no `docs` directory. Each task asks for one function in one file of the app. A check the subject never sees then drives that function the way the makers' unit tests drive the library: a canvas that is a plain object, a real scene on the library's null engine, and no browser. Each task has a reference answer that passes and a "plain" answer that fails: what someone would write from the names and signatures alone.

**Three were chosen by me, knowing the ledgers and the doc.** They are reported apart from the six.

- `K1`, code: an orbit camera with the library's arrow-key control turned on. The keys do nothing unless one function is called first. A comment in `src`, the makers' doc and a makers' test all say so. Every arm can find it, so this task can show a difference in spending and is not expected to show one in passing.
- `P1`, a question: with controls attached and no scene, which of a drag, a wheel turn and a pinch change the camera? Only the pinch does. All three ledgers hold a note that says nothing moves the camera without a scene.
- `I1`, a question: does the `await` of a camera transition resolve or reject in three situations? All three ledgers hold a note that says leftover inertia makes it reject. It does not: the transition's first step throws that inertia away.

`tasks/P1/proof.test.ts` and `tasks/I1/proof.test.ts` show both expected answers on the library itself. Each task's `where.md` says where its fact is written: in the code, in a comment, in a makers' test, in the makers' doc, in a ledger.

**Every task has a trap, by the way it was chosen.** The share of real asks that have one is not known. So this run says nothing about how often a ledger helps over all the work a reader does. It asks whether a ledger helps where help is possible.

## What is counted

- **Passed.** For code, every case of the hidden check passes, on the app as the subject left it, against a library nobody has touched. For a question, every part of the answer is as expected. `reader.py check-tasks` grades each task's own reference and plain answers, and stops unless the first passes and the second fails.
- **What a try grew by.** The tokens the subject had read and written at its end, less what it had in front of it when it began, less the text the harness adds on its own. This is the bench's measure since the fourth study. Reading the doc or the ledger is inside it.
- **What the subject opened or ran.** From the words of its calls: the makers' camera doc, any makers' doc, the ledger, the makers' tests, the library's source, whether it ran the test runner, whether it called npm for a package.
- **Whether it changed the library,** and each sign that it left its directory. Both are kept beside the try and read later.
- **For `P1` and `I1`,** the one part of the answer the false note speaks to: `pinch`, and `a`.

Kept for each try: the request, the app as the subject left it, its report word for word, each call it made and how much came back, the tokens of each message, and the grader's whole output.

## The rules, fixed before the run

The task is the unit. A comparison is between two arms over the tasks both ran.

- **Passing.** For each task, the share of tries the first arm passed, less the share the second passed. The mean of that over the tasks is the difference. The tasks are drawn again 10,000 times for an interval. *Shown*: the difference is a quarter or more and the interval leaves out nothing. *No difference as large as a quarter*: the interval lies inside a quarter either way. Otherwise *cannot tell*.
- **Spending.** The sum over tasks of the mean of what a try grew by in the first arm, over the same sum in the second. The tasks are drawn again for an interval. *Shown*: the interval lies below 1 and the ratio is two thirds or less; or it lies above 1 and the ratio is one and a half or more. A smaller saving or cost is named as smaller. *No saving as large as a third, and no cost as large as a half*: the interval lies inside those. Otherwise *cannot tell*.
- **Against the plain arm, twice.** An arm is compared with `plain-a` and with `plain-b`. A difference counts only if both comparisons give it. If a rule tells `plain-a` from `plain-b`, nothing that rule says about any pair counts.
- **A false note.** Over the tries of `P1` and `I1` in `ledger` and in `ledger-cut`, 12 in each: how many got the note's part wrong. *Harm shown*: 6 or more of 12 more with the note. *No harm that large*: 2 or fewer more. Otherwise *cannot tell*.
- **Each task is given by itself first**, as passes of tries in each arm. A sum is read only after that.

**The rules were tried on made-up subjects** (`reader.py simulate`, nine tasks, three tries in each arm, 400 runs of each case).

| made-up case | what the passing rule said |
|---|---|
| both arms pass every task 9 times in 10 | no difference 67%, cannot tell 33%, shown 0% |
| both arms pass every task half the time | cannot tell 80%, no difference 13%, shown 7% |
| 0.9 against 0.6 on every task | shown 67%, cannot tell 31% |
| 0.9 against 0.4 on every task | shown 98% |
| always against never on three tasks, 0.9 both on six | shown 53%, cannot tell 47% |
| always against never on one task, 0.9 both on eight | cannot tell 96%, shown 4% |

| made-up case | what the spending rule said |
|---|---|
| the same cost | no saving or cost that large 83%; "less, by less than a third" 6%; "more, by less than half" 6%; shown 0% |
| the first costs two thirds | shown 52%; "less, by less than a third" 46% |
| the first costs half | shown 100% |
| the first costs one and a half times | shown 49%; "more, by less than half" 49% |

So this run can show a difference in passing of about a third or more when it is spread over the tasks. It cannot see a difference that lives in one task: the table of single tasks is where that would show. With nothing different, the passing rule says *shown* about 7 times in 100 and the spending rule gives one of its weaker answers about 12 times in 100. Nine tasks are few to draw again, and the interval comes out too narrow. So only *shown* will be leaned on, and only when both plain rounds agree.

## The size

| run | tries |
|---|---|
| `ceiling` | 9, one per task, an Opus model |
| `memory` | 9, one per task |
| `plain-a`, `plain-b`, `doc` | 27 each: three per task |
| `ledger`, `ledger-cut` | 33 each: three per task, and three more on `P1` and on `I1` |

156 tries of a Haiku model and 9 of an Opus model. No try is added until the answers above are given.

## The order

1. `ceiling`. A task the Opus model does not pass is read, and mended only if the test is at fault.
2. A fresh reader reads one request with nothing else in front of it, says what it is asked and what is missing, and does the task once.
3. `memory`.
4. `plain-a`, then its tokens are counted and the cost of the rest is written here before the rest is sent.
5. `plain-b`, `doc`, `ledger`, `ledger-cut`, in groups that each hold every arm.
6. Every try is kept and graded. Every answer is read. Each failure is sorted. Then the rules are run once.

## How a failure is sorted

- **The test's**: the check fails on something the ask does not say; or the answer does what the ask says and the check still fails; or the try broke for a reason outside the subject, such as the harness ending it.
- **The subject's**: the ask says what the check tests, the ceiling passed on the same request, and the answer does not do it.
- **Not known**: the answer, the check's output and the calls do not settle it.

Tried on made-up failures before the run:

| made-up failure | sorted as |
|---|---|
| `K1`: the answer passes the keyboard option and never turns the keyboard module on; the arrow-key case fails | the subject's |
| `K1`: the answer adds its own key listener on `window`, and the check stops because there is no `window` | the subject's: the ask says to turn on the library's own control |
| a code task: the answer does what the ask says, and reads a field of an event that a browser gives and the check's plain object lacks | the test's |
| `P1`: the file is there with the right answers under other keys than the ask gives | the subject's: the ask gives the shape |
| `P1`: no file, and the record shows the harness ended the subject | the test's |
| a code task: the check fails, and reading the answer does not show whether the ask covers the case | not known |

## What the test takes for granted

- **The subject has a shell, its files and the installed packages.** The request says the dev dependencies are installed.
- **"The app" is `…/app`, and the library is imported as `@babylonjs/lite`.** The request says both, and the app's two config files show the path.
- **A code task's answer is one named file that exports one named function.** Each ask gives the file and the signature.
- **A question's answer is one named JSON file in a given shape.** Each ask gives both.
- **The words "orbit camera" mean the library's arc-rotate camera.** The signature in `K1` returns `ArcRotateCamera`.
- **The ledger's paths start from `packages/babylon-lite`.** The ledger arms' request says so.
- **The subject stays in its directory.** Nothing holds it there. The machine also holds this repository, with every check and reference answer in it. Each sign that a subject looked outside is kept and read.

## My guesses, before the run

1. **Ceiling:** the Opus model passes all nine.
2. **Memory:** the Haiku model with no library passes 2 of 9 or fewer.
3. **Plain:** it passes `K1` in 5 of 6 tries or more, and about two thirds of its tries on the six written tasks.
4. **Passing:** no arm is shown to differ from plain. The rule says *cannot tell* or *no difference as large as a quarter* for `doc`, `ledger` and `ledger-cut`.
5. **Spending:** the ledger costs about what plain costs, a ratio between 0.85 and 1.15, so no saving as large as a third. The doc costs more, a ratio of 1.2 or more.
6. **A false note:** it misleads about half the time. 6 of 12 wrong with the note and 2 of 12 without, so the rule lands between *cannot tell* and *harm shown*.
7. **What subjects open:** in the plain arm, fewer than half open any makers' doc by themselves, and about half open a makers' test.
8. **npm:** fewer than 1 try in 10 calls npm for a package.

## What each outcome would change

- **The ledger passes more, or spends a third less, than plain:** a ledger is worth handing to a reader for work like this. The next question is whether the rules of the seven rounds matter to the reader, with a first-round ledger as an arm.
- **The ledger is no better than plain:** with the library in hand, a reader of this size does not need it for work like this. More mapping rules and mended notes would not be worth their cost until a case is found where they help: a reader with less room, a library with no docs, or no checkout at all.
- **The doc does as well as the ledger or better:** for a library with docs like these, the place to start is the makers' own sentences, picked and proved, and not a map made from the code.
- **A false note does harm:** no ledger goes to a reader until its notes have had a second reader with the makers' tests in hand. **No harm that large:** deleting what a checker marks false is mending enough for now.

## What this cannot show

- **One library, one directory, nine tasks, three ledgers.** A direction at most.
- **One family of models** wrote the ledgers, marked them, wrote six of the tasks and reads as the subject. The makers' tests and the library itself are the only parts no such model wrote.
- **The subject is not the small model this project is for.** It has more room and reads more for the same cost.
- **Use, not change.** The mappers were told their reader would use the code or change it. No task here changes it.
- **Reading is cheap here.** The subject has the whole checkout and can run code. A ledger may matter more where that is not so.

## How to run it again

```sh
git clone https://github.com/BabylonJS/Babylon-Lite lib && git -C lib checkout 2dddc888f6695e433ab29ae5918bee221375d86f
mkdir pristine && tar -C lib --exclude=./lab --exclude=./reference --exclude=./.git -cf - . | tar -C pristine -xf -
mkdir runner && cp runner-package.json runner/package.json && (cd runner && npm install --ignore-scripts)
python3 reader.py guides
python3 reader.py check-tasks --pristine pristine --runner runner/node_modules
python3 reader.py simulate
python3 reader.py setup plain-a K1 1 --work /a/work/directory --pristine pristine --runner runner/node_modules
# send tries/plain-a/K1/1/request.md to a subject, word for word, and when it has finished:
python3 reader.py keep --records /the/harness/records --model-starts claude-haiku --model-as "a Haiku model" --pristine pristine --remove-work
python3 reader.py grade --pristine pristine --runner runner/node_modules
python3 reader.py tally && python3 reader.py compare
```

## Changes after this was written

None yet.
