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

All on 2026-11-15, and all before any try of an arm was sent.

- **The app's test config no longer names a `checks` directory.** As first written it did, which told a subject that hidden checks exist. The grader now has a config of its own, `checks/vitest.config.ts`. The first ceiling try had not been sent yet.
- **A command that starts inside the try's directory is no sign of leaving it.** The bench's rule expects a subject to have one directory and calls every command that begins elsewhere a sign. A try here has two directories inside one. The first ceiling try showed nine such signs, eight of them commands that began in the checkout. `stays` in `reader.py` drops those, and that try's record was put right by the same rule.
- **"Ran the test runner" is read more narrowly.** Reading `vitest.config.ts` counted as running it.
- **The six written tasks came.** They are in `tasks/B1` to `tasks/B6`, as the writer left them, with its second right answer as `other.ts` and its own record of what it ran as `tasks/WRITER-RUNS.md`. I added `file.txt` to each, the file its ask names.

On 2026-11-15, after every try had been kept and graded:

- **The count of tries that read the library's source was low, and is mended.** The keeper looked for the full path `packages/babylon-lite/src` in a call. 15 tries went into the checkout with `cd` and read `src/camera/...` from there. `read_source` in `reader.py` now counts those, and the tally counts the kept calls again. No grade and no token count depends on it.
- **The rules were run before I had read every answer.** The order above says read first. Nothing was changed between the two: a grade is what the hidden check gave, and no try was graded again.
- **The last two groups did not each hold every arm.** The fifth held the sixth written task in all four arms and `P1` in `plain-b` and `doc`. The sixth held `P1` in the two ledger arms and `I1` in `plain-b` and `doc`. The seventh held `I1` in the two ledger arms. Tokens do not depend on what else is running, so I do not think it matters.

## The six written tasks

| task | what it asks for | what the plain answer gets wrong |
|---|---|---|
| `B1` | orbit controls whose zoom stays inside a range | it sets the two limit fields, and nothing reads them until one function is called |
| `B2` | an orbit drag that turns twice as far | it doubles a field that divides the drag, so the camera turns half as far |
| `B3` | fly controls where Shift is only a speed key | by default Shift is also a key that moves the camera down |
| `B4` | tilt a globe camera to a given pitch at any zoom | by default the pitch is forced flat when the camera is zoomed out |
| `B5` | where a point is on the canvas, and whether it is visible | it reads the flag that is also true for a point beyond the far plane |
| `B6` | a camera that banks with a car, and holds on a loop | an up vector along the line of sight makes the camera stop looking at its target |

- **What I checked of the writer.** Its record holds 34 shell calls and one read. No call names a doc, and no full path in a call is outside its directory except a file the harness made of its own output. In my own run each reference answer passes, each plain answer fails, and each of its second right answers passes.
- **The writer's doubts, in its words, shortened.** `B1`: the function is easy to find by its name. `B2`: only one field can do the job, so every right answer is alike. `B4`: the right answer changes the camera's limits, which the ask allows only by implication. `B5`: someone going by names could pick the right flag by chance. `B6`: the ask names the hard case outright.

**Where each task's deciding name is written.** Counted with `grep -c` on the name, before any try of an arm. This counts a word, and does not show that the text states the fact.

| task | the name | the makers' camera doc | any makers' doc | `opus-1` | `opus-2` | `opus-3` |
|---|---|---|---|---|---|---|
| `K1` | `enableArcRotateKeyboardControls` | 6 lines | 1 file | 0 | 4 | 3 |
| `B1` | `setCameraLimits` | 0 | 0 files | 4 | 5 | 3 |
| `B2` | `angularSensibility` | 5 | 1 | 0 | 0 | 0 |
| `B3` | `downKeys` | 2 | 1 | 0 | 0 | 0 |
| `B4` | `pitchDisabledRadiusScale` | 0 | 1 | 0 | 0 | 0 |
| `B5` | `offscreen` | 0 | 16 | 0 | 0 | 0 |
| `B6` | `upVector` | 8 | 3 | 1 | 1 | 0 |

So of the six written tasks, the ledgers name what one turns on, and the makers' camera doc names what three turn on. A ledger cannot help a reader pass a task it says nothing about. I leave my guesses as they were written: I had guessed that no arm would be shown to pass more.

## The ceiling and the arm with no library, 2026-11-15

**The ceiling.** An Opus model, with exactly what the plain arm gets, one try a task: 9 of 9 passed. So each task can be passed as it is worded, with the checkout alone. My first guess held.

| task | passed | grew by, in tokens |
|---|---|---|
| `K1` | 1 of 1 | 18,846 |
| `P1` | 1 of 1 | 17,623 |
| `I1` | 1 of 1 | 28,459, on the mended wording |
| `B1` | 1 of 1 | 31,170 |
| `B2` | 1 of 1 | 24,100 |
| `B3` | 1 of 1 | 11,609 |
| `B4` | 1 of 1 | 24,584 |
| `B5` | 1 of 1 | 31,023 |
| `B6` | 1 of 1 | 15,059 |

- **What the reports show.** On `I1` the subject wrote that the comment on the function "suggests a reject" for leftover inertia, and that "the code does otherwise". On `B2` it did not use the field the reference answer uses: it turned the camera again by what the library had just turned it, each frame, and passed.
- **50,715 output tokens** for the nine tries.

**No library in hand.** A Haiku model with the app and no checkout, one try a task: 0 of 9 passed. My second guess held.

- **Five of the seven code answers call methods or constructors that Babylon.js has and this library has not:** `camera.attachControl(...)`, `new FreeCamera(...)`, `Vector3.Zero()`, `camera.getViewMatrix()`. This library has functions that take the camera. A sixth, on `B3`, wrote its own controls on `camera.rotation`, a field of the Babylon.js camera and not of this one. The seventh, on `B4`, set the pitch field, which is the plain answer. As first written this said six of the seven; a check on 2026-11-15 counted five.
- **Each report says the library could not be read** and that the answer is a guess.
- So this subject does not know this library from memory. What it passes in the arms, it passes from what it reads.
- **47,301 output tokens** for the nine tries. All nine failures are sorted as the test's: the arm is built to lack what an answer needs.

## Two fresh readers, 2026-11-15

A Sonnet model with a shell was given one request with nothing else, did the task, and said what it was asked, in what form, what was missing, what did not agree with the machine, and what could be read two ways. One had a request of the `ledger` arm on `B1`, the other a request of the `doc` arm on `I1`. Their directories are in `fresh-reader/`. Neither is a try.

- **Both did the task right, and both said nothing they needed was missing.**
- **`I1` could be read two ways, and was mended.** The reader said that "starts to drag" could mean pressing the button without moving, which moves nothing. It also said that a second call on the very last frame of a transition would let the first one resolve. The ask now says "the user drags the camera with the mouse" and "the transition is about half way". The ceiling and the no-library try on `I1` were sent again with the new words: the old ones are in `superseded/`.
- **The makers' camera doc says nothing of the function `I1` asks about.** The reader found that. So the `doc` arm points its subject at a file that cannot answer `I1`. That is what the arm is, and `tasks/I1/where.md` now says it.
- **The ledger's first line names release 1.39.0, and the checkout's `package.json` says version 0.1.0.** The reader noticed and went on. Both are true: the repository's own package file is not the published one. Nothing was changed.
- **The ledger reader used the ledger.** It read the rows about limits and the note on the controls' lifetime, and checked them against the source by reading. It also found that a comment in `arc-rotate.ts` says the limits are enforced by the per-frame loop, which the code does not do.

## The first plain round, 2026-11-15

`plain-a`: a Haiku model with the checkout and the app, three tries a task. **27 of 27 passed.**

| task | passed | grew by, mean of three tries, in tokens |
|---|---|---|
| `K1` | 3 of 3 | 28,975 |
| `P1` | 3 of 3 | 22,023 |
| `I1` | 3 of 3 | 34,153 |
| `B1` | 3 of 3 | 35,718 |
| `B2` | 3 of 3 | 43,675 |
| `B3` | 3 of 3 | 23,049 |
| `B4` | 3 of 3 | 26,431 |
| `B5` | 3 of 3 | 39,241 |
| `B6` | 3 of 3 | 23,477 |

- **My third guess was wrong.** I guessed about two thirds of tries on the six written tasks. Every try passed.
- **What the subjects did.** All 27 read the library's source. 23 of 27 ran the test runner on their own answer before they handed it in. 7 opened a makers' unit test and 2 opened a makers' doc. None called npm for a package, and none changed the library.
- **So no arm can pass more than this one.** With the checkout in hand and code that runs, this subject finds each trap by itself. What the other arms can still show is what a try costs, and whether a false note makes a subject get `P1` or `I1` wrong where the plain arm did not. The run goes on as written, for those two things.
- **Cost.** 294,737 output tokens for the 27 tries, 10,916 a try. The 120 tries still to send should come to about 1.3 million.

## The other four rounds, 2026-11-15

`plain-b`, `doc`, `ledger` and `ledger-cut`: 120 tries of a Haiku model. With the first plain round that is 147 tries with the library in hand.

**Passing.** Every one of the 147 passed its check. Each task is 3 of 3 in each arm, and `P1` and `I1` are 6 of 6 in the two ledger arms.

| | `plain-a` | `plain-b` | `doc` | `ledger` | `ledger-cut` |
|---|---|---|---|---|---|
| passed | 27 of 27 | 27 of 27 | 27 of 27 | 33 of 33 | 33 of 33 |

**Spending.** What a try grew by, in tokens: the mean of each task's tries.

| task | `plain-a` | `plain-b` | `doc` | `ledger` | `ledger-cut` |
|---|---|---|---|---|---|
| `K1` | 28,975 | 30,375 | 40,675 | 31,980 | 31,908 |
| `P1` | 22,023 | 19,943 | 38,490 | 28,753 | 29,848 |
| `I1` | 34,153 | 34,263 | 49,139 | 42,435 | 39,578 |
| `B1` | 35,718 | 35,345 | 54,706 | 47,482 | 40,036 |
| `B2` | 43,675 | 44,854 | 63,455 | 47,871 | 54,187 |
| `B3` | 23,049 | 21,013 | 45,913 | 42,080 | 30,954 |
| `B4` | 26,431 | 25,713 | 50,799 | 37,023 | 38,499 |
| `B5` | 39,241 | 42,285 | 57,407 | 50,016 | 45,720 |
| `B6` | 23,477 | 30,127 | 45,270 | 35,490 | 36,850 |
| the nine together | 276,743 | 283,918 | 445,853 | 363,129 | 347,581 |

Both guides cost more than no guide on every one of the nine tasks, against both plain rounds.

**Output tokens.** `plain-b` 307,401; `doc` 296,490; `ledger` 422,573; `ledger-cut` 401,292. The 120 tries came to 1,427,756. I had said about 1.3 million.

## What the rules said

`reader.py compare`, run once.

| the first | the second | passing: difference, interval | spending: ratio, interval | what the spending rule said |
|---|---|---|---|---|
| `plain-a` | `plain-b` | 0.00 (0.00 to 0.00) | 0.97 (0.92 to 1.02) | no saving as large as a third, and no cost as large as a half |
| `doc` | `plain-a` | 0.00 | 1.61 (1.49 to 1.77) | shown: the first spends more, by half or more |
| `doc` | `plain-b` | 0.00 | 1.57 (1.44 to 1.77) | shown: the first spends more, by half or more |
| `ledger` | `plain-a` | 0.00 | 1.31 (1.21 to 1.46) | the first spends more, by less than half |
| `ledger` | `plain-b` | 0.00 | 1.28 (1.16 to 1.46) | the first spends more, by less than half |
| `ledger-cut` | `plain-a` | 0.00 | 1.26 (1.18 to 1.36) | the first spends more, by less than half |
| `ledger-cut` | `plain-b` | 0.00 | 1.22 (1.14 to 1.34) | the first spends more, by less than half |
| `ledger` | `doc` | 0.00 | 0.81 (0.77 to 0.86) | the first spends less, by less than a third |
| `ledger-cut` | `ledger` | 0.00 | 0.96 (0.88 to 1.03) | no saving as large as a third, and no cost as large as a half |

- **The two plain rounds were not told apart** by either rule. So what the rules say of the other pairs counts.
- **Passing: no difference as large as a quarter, for every pair.** This is empty. Every arm passed everything, so no arm could have been shown to pass more. The run could not have shown a guide helping a subject pass.
- **The doc costs more: shown,** against both plain rounds, by about three fifths.
- **The ledger costs more: about three tenths more as written, and about a quarter more with the false rows cut.** By the rule this is one of its weaker answers, and before the run I wrote that only *shown* would be leaned on. So I give it as a direction and not as a size: the low ends of the four intervals are 1.14 to 1.21. What stands behind the direction: all nine tasks, both ledger arms, both plain rounds. Nine of nine by chance alone is 1 in 256 for each pair.
- **A false note: no harm that large.** 0 of 12 tries got the note's part wrong with the note in hand, and 0 of 12 without it.

## Each guess beside what came

| | my guess | what came |
|---|---|---|
| 1 | the ceiling passes all nine | 9 of 9. Held. |
| 2 | no library in hand: 2 of 9 or fewer | 0 of 9. Held. |
| 3 | plain passes `K1` in 5 of 6 or more, and about two thirds of its tries on the six written tasks | `K1` 6 of 6. The six written tasks: 36 of 36. **Wrong.** |
| 4 | no arm is shown to pass more than plain | Held, and for a reason I had not guessed: nothing was left to pass. |
| 5 | the ledger costs what plain costs, 0.85 to 1.15; the doc costs 1.2 times or more | The ledger: 1.31 and 1.28. **Wrong.** The doc: 1.61 and 1.57. Held. |
| 6 | a false note misleads about half the time: 6 of 12 wrong against 2 of 12 | 0 of 12 against 0 of 12. **Wrong.** |
| 7 | in plain, fewer than half open a makers' doc, and about half open a makers' test | A makers' doc: 2 of 27 and 3 of 27. Held. A makers' test: 7 of 27 and 11 of 27, which is fewer than I guessed. |
| 8 | fewer than 1 try in 10 calls npm for a package | 1 of 147, and that one was for `ast-grep`, not for the library. Held. |

Three of my guesses were wrong. Two erred the same way: I took this subject to be weaker than it is when it has the code in front of it and can run it. The third was about cost: I thought a ledger would stand in for some of the reading, and it was read on top.

## What the answers are

I read the code of every answer to `K1`, `B1`, `B2` and `B4` with its comments taken out. For `B3` I read 15 answers so and the first 60 lines of the sixteenth. For `B5` and `B6` I read the lines that decide the answer: the imports, the library calls and the tests on them. I read all 147 reports as they came in. The counts below include the ceiling's answer, so each is of 16.

| task | what the answers do |
|---|---|
| `K1` | 16 of 16 call `enableArcRotateKeyboardControls()` and pass `{ keyboard: true }`. |
| `B1` | 16 of 16 call `setCameraLimits`. |
| `B2` | 2 of 16 halve `angularSensibility`, which is the reference answer. 11 measure what the library turned the camera by each frame and turn it that far again. 2 wrap the camera in a `Proxy`. 1 doubles the stored offsets for one frame. |
| `B3` | 15 of 16 call `attachConfigurableFreeControl` with `downKeys: ["PageDown"]`. 1 wrote its own controls. |
| `B4` | 15 of 16 set `pitchDisabledRadiusScale` to `null`. 1 sets `pitchMin` to the pitch. |
| `B5` | 15 of 16 call the library's projection and none takes `clipped` for the answer. 1 does the projection by hand. 3 of the 16 also call a point nearer than the near plane not visible, which the ask does not speak of and the check does not test. |
| `B6` | 16 of 16 call `createBankedFreeCamera` and test for an up vector that lies along the line of sight before they use it. |

- **On `B2` the subjects went past the reference answer.** Two plain reports say they tried it first. One: "My first approach halved `angularSensibility`, which doubled the drag but not the glide. The library snaps inertia to zero at an absolute 0.001 threshold, so the glide tail differed." The other: "gave an exact 2x drag but a glide about 2% off". The check allows 1.9 to 2.1, so the reference passes. The ask says "twice as far", and 13 of the 15 tries of the Haiku model did something other than the reference answer.
- **One pass does not do what its ask says.** `ledger/B3/1` read `free-camera-controls.ts`, where Shift moves the camera down and nothing makes it faster, and did not open `configurable-free-camera-controls.ts`. Its third call had listed the directory that holds that file. Its report: "So I wrote my own controls with the same left-handed math." The ask says "the library's keyboard and mouse fly controls". The check tests what the camera does, and 173 lines of the subject's own code do it. Its ledger names the configurable function twice. I leave the grade as the check gave it. It is one try, and I do not know why it stopped looking.
- **The arms' answers are alike.** No way of answering belongs to one arm, except that both tries that used the reference answer on `B2` had a ledger. No ledger names that field.

## What a false note did

Each ledger has a note that says input is never applied when no scene is passed, which is false for a pinch. Each has a note that says leftover inertia makes the transition reject, which is false for inertia that is there when the call is made. `ledger-cut` has neither. I checked both by the note's name in each of the six files.

| | `ledger`: the note is there | `ledger-cut`: it is not |
|---|---|---|
| `P1`: `pinch` wrong | 0 of 6 | 0 of 6 |
| `I1`: `a` wrong | 0 of 6 | 0 of 6 |

What the twelve `ledger` reports say of the note:

- **`I1`: five of six say the note is wrong.** "The ledger's "interrupt: what it means" note says leftover inertia causes a rejection. The source says otherwise" (`ledger/I1/2`). The sixth, `ledger/I1/1`, says the notes it relied on "agree with the code I read". It had run the library and answered right.
- **`P1`: one of six says the note is wrong.** "right for drag and wheel but wrong for pinch, which applies immediately" (`ledger/P1/3`). Three say that what they checked of the ledger holds: "I checked the ledger's `is` rows against this code and they hold for these paths" (`ledger/P1/1`), "matches the code" (`ledger/P1/4`), "The ledger rows I checked agree with this" (`ledger/P1/6`). The other two say they went by the code. All six answered `pinch` right.

So no subject was led to a wrong answer. Six of the twelve said the note is wrong. Four wrote that the ledger agrees with the code, and answered against the note all the same. They answered from the code: for them the note was beside the point, and they did not correct it.

**A false sentence that was not on the way to the answer was passed on.** The makers' camera doc says that at `alpha = -π/2, beta = π/2` the camera "is on the +Z axis". I ran the library: `getCameraPosition` gives `z = -10` for a radius of 10. The three `doc` tries on `K1` all met that sentence. One tested it: "That is wrong: its own eye formula gives z = -10 for that pair" (`doc/K1/1`). One used it and said it had not checked. One wrote it down as a fact: "The alpha/beta choice puts the eye on +Z looking at the origin" (`doc/K1/3`). The check does not test which side the camera is on. Three tries are few. The pattern they suggest: a subject checks what its answer turns on, and may repeat the rest.

## Where the extra tokens went

Counted after the run. No rule was fixed for it, so this describes and does not test. Each number is the mean over the nine tasks of a task's mean try.

| a try, in tokens | `plain-a` | `plain-b` | `doc` | `ledger` | `ledger-cut` |
|---|---|---|---|---|---|
| grew by | 30,749 | 31,546 | 49,539 | 40,348 | 38,620 |
| read from the guide file | 0 | 44 | 18,230 | 6,569 | 5,630 |
| read from every other call | 14,546 | 14,716 | 12,108 | 13,263 | 13,440 |
| written, reasoning included | 10,916 | 11,385 | 10,981 | 13,689 | 13,006 |

- **A guide was read on top of the code, not in place of it.** All 147 tries read the library's source. With the doc a try read about 18,200 tokens of doc and about 2,500 fewer of everything else. With a ledger it read about 6,600 tokens of ledger and about 1,300 fewer of everything else.
- **With a ledger a try also wrote more:** 2,300 to 2,800 more tokens with the ledger as written, and 1,600 to 2,100 with the cut one. I did not measure what they were. The reports with a ledger are longer: they say what in the ledger was checked, what was not, and what did not agree.
- **With a guide, fewer tries opened a makers' test.** A makers' unit test was opened in 18 of 54 plain tries, 3 of 27 with the doc and 2 of 66 with a ledger. On the two questions it was 8 of 12 plain tries and 1 of 24 with a ledger. The drop in "every other call" above has those tests in it, so it is not a drop in code read alone.
- **The subjects checked by running.** On the seven code tasks, 18 to 20 of 21 tries in each arm ran the test runner on their own answer.

## What the test could not hold still

- **The harness told each subject where my session was working.** Each subject's record gives a working directory inside this repository: `bench/runs/2026-11-15-reader` for 139 of the 165, and the repository's root for 26. One subject put that path into a command, which did nothing. So the path was in front of at least that one, and it has `bench` in it. The request was worded as a user's ask so that the subject would not think of a test. I searched what every subject said and ran for the repository, a benchmark, a grader, or being tested: no report speaks of any, and no call of the 1,866 names the repository's files, another try's directory or a file of mine. I cannot tell what the path changed. It was the same in every arm.
- **The path of each try's directory named its arm and its task,** as in `reader-work/ledger-cut/P1/5`. That path is in every request, so a subject could read `ledger-cut` or `plain-a` in it. I had not seen this before the run.
- **Reasoning was not kept.** The records hold 1,350 blocks of reasoning with no text in them. I explain nothing from it.
- **`ast-grep` was not in the box.** A ledger's rows are commands for it. A call names it in 24 of the 66 tries with a ledger, and 29 of the 66 reports name it. One of them: "ast-grep is not installed here, so I did not re-run the ledger's `run` searches" (`ledger-cut/P1/2`). One subject installed it from npm to run them. So a subject had each row's sentence and count, and could not run the row. A ledger whose rows the reader can run was not tested here.
- **The request called the notes unchecked:** "A row with `is` is a note by someone who read the code, and nothing has checked it." By a search of the reports for "not rely", "not relied", "rather than relying", "without relying", "not from the ledger" and "not on the ledger", 18 of the 66 with a ledger say that they did not rely on the notes. The run says nothing about a note that a reader is told to trust.
- **The ledger's first line and the checkout disagree on the version,** 1.39.0 against 0.1.0 in `package.json`. 21 of the 66 reports with a ledger name the version 0.1.0, and so do 4 of the 54 plain ones. A fresh reader had seen this before the run and I changed nothing. It cost the ledger arms some tokens and perhaps some trust. I did not measure how much.
- **The harness also gave every subject one shared directory for scratch files.** 26 tries name a file or directory of their own directly under it. 14 of them wrote the type checker's output to the same name, `tsc-out.txt`, so one may have read another's. That file holds type errors and no answer.
- **Three tries were woken after they were kept,** by a command of their own that was still running: `doc/B3/1`, `ledger-cut/B3/3`, `ledger-cut/B4/3`. What is kept is what each had handed in when it first stopped.

## What this shows, and what it does not

**Shown, for one library, nine tasks and this subject:**

1. With the checkout in hand and code it can run, a Haiku model passed every task with no guide. It does not know the library from memory: with no checkout it passed none.
2. The makers' camera doc, read first, did not help it pass and cost about three fifths more.
3. A ledger, read first, did not help it pass and did not save reading. It cost more: about three tenths as written, about a quarter with the false rows cut, and at the least about a seventh.
4. A false note that the request called unchecked led no subject to a wrong answer on the question it speaks to.

**Not shown:**

- **Whether a guide helps a reader pass.** The plain arm left nothing to gain. I ran the plain arm first, saw 27 of 27, and went on for the cost and for the false note. The tasks were too easy for this subject to show the first thing, and that is a fault of how I chose them: I asked for traps that only reading shows, and this subject reads.
- **Anything about the small model this project is for.** It has less room. Reading 14,000 tokens of source for each task may not be open to it, and that is the reader a ledger was meant for.
- **Anything about a reader with no checkout,** or with a ledger it can run.

**What it changes, by what I wrote before the run:**

- "The ledger is no better than plain": more mapping rules and mended notes are not worth their cost for a reader like this one. I would stop work on them until a reader is found that fails without a guide.
- "No harm that large": before the run I wrote that cutting what a checker marks false would then be mending enough. The run does not show that. For this reader a false note did no harm whether it was cut or left, so nothing here tells cutting from leaving. What does follow is that the second reader for notes can wait.
- "The doc does as well as the ledger or better": passing cannot say, since every arm passed everything. The ledger cost about four fifths of what the doc cost, which by the rule is a weaker answer.

**Checked.** A Sonnet model with nothing but these sections and the kept files checked about 105 claims. It found no wrong number in a table, no wrong quotation and no wrong count of the answers. It found six sentences that said more than the numbers and four counts it could not make again. All ten are mended above, on 2026-11-15.

**What I would run next,** and this is a proposal, not a finding. A guide can only be shown to help where the plain arm fails. This run has one such arm already: with no checkout the subject passed 0 of 9, and five of its seven code answers called methods or constructors of Babylon.js. So give that subject the app, no checkout, and one text: the doc, a ledger, or the package's type declarations. Then count what it passes. That asks what this project set out to ask, which is how small a text teaches a model a library, and it asks it where the answer is not already "everything passes".

