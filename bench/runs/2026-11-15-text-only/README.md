# With no code in hand: what one text teaches

Written on 2026-11-15, before any try. The maintainer said to proceed on 2026-11-15, after reading the proposal at the end of `bench/runs/2026-11-15-reader/README.md`.

## Why

The reader test gave a Haiku model a library's code and nine tasks. It passed all of them with no guide, so no guide could be shown to help it. With no code and nothing else it passed 0 of 9, and five of its seven code answers called methods of Babylon.js, which this library does not have.

So the place where a text can help is the reader with no code. This run gives that reader one text and counts what it passes. It asks which text teaches the most, and how small a text is enough. That is the question this project began with.

## What a subject holds

- **The subject** is a Haiku model of the kind `bench-subject-closed`: it can read and write files, and nothing else. It cannot run anything.
- **The box** of a try is one directory with `app` in it: the reader test's scaffold, and one text for the arm. There is no checkout and nothing is installed.
- **The library** is Babylon Lite 1.39.0, commit `2dddc888f6695e433ab29ae5918bee221375d86f`, as in the reader test.

## The arms

| arm | the text in `app` | size |
|---|---|---|
| `none` | nothing | 0 |
| `names` | `camera-api.d.ts`: the type declarations of `src/camera`, with the makers' comments taken out | 13,547 bytes |
| `types-a`, `types-b` | `camera-api.d.ts`: the same declarations with the makers' comments. One arm, run twice | 51,671 bytes |
| `doc` | `02-camera.md`: the makers' notes on the camera code | 52,885 bytes |
| `ledger` | `camera-ledger.toml`: a ledger as a mapper wrote it. Try n has ledger ((n-1) mod 3)+1 of the reader test's three | 17,577 to 21,153 bytes |
| `ledger-cut` | the same ledger less every row its checker marked false | 14,869 to 17,830 bytes |

**No one here wrote the first three texts.** The declarations are made by a command from the pinned source, in `packages/babylon-lite`:

```sh
tsc --ignoreConfig --declaration --emitDeclarationOnly --noCheck --skipLibCheck \
    --target ES2022 --module ESNext --moduleResolution Bundler --rootDir src --outDir OUT src/camera/*.ts
```

With `--removeComments` added for `names`. The 17 files of `OUT/camera` are joined in the order of their names, each under a line `// <its name>`. I ran this with `tsc` 6.0.3 on 2026-11-15 to see that it works and to get the sizes: no error, 17 files. The session that builds the run makes the texts again, and writes down the version and the sizes it gets.

So the arms are a ladder. `names` holds what each function is called and takes. `types` adds what the makers wrote above each. `doc` is the makers' prose. A ledger is a model's map.

## The request

The reader test's request for its arm with no library, word for word, with one paragraph added after the first for an arm that has a text.

```
I'm working on a small viewer app in @BOX@/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

@GUIDE@

@ASK@

Please keep every change inside @BOX@/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
```

| arm | the added paragraph |
|---|---|
| `names`, `types-a`, `types-b` | What I do have is the library's type declarations for its camera code, in @BOX@/app/camera-api.d.ts. Read them first. |
| `doc` | What I do have is the library's own notes on its camera code, in @BOX@/app/02-camera.md. Read them first. |
| `ledger`, `ledger-cut` | What I do have is @BOX@/app/camera-ledger.toml, a ledger of facts about the library's camera code, written for this release. A row with `run` and `shows` is a search of the code and a sentence about what it finds; a tool has checked that each search still gives the count its row states. A row with `is` is a note by someone who read the code, and nothing has checked it. Read the ledger first. |

The ledger's paragraph is the reader test's, but for its opening words and the sentence about where its paths start, which is left out. So a note is called unchecked here too, and what differs from the reader test is that there is no code to check it against.

## The tasks

The reader test's nine, with their asks, their hidden checks and its grader, used from `bench/runs/2026-11-15-reader` as they stand and not copied. A check runs the subject's file against a library nobody has touched, on the grader's side.

## Two things mended from the reader test

- **A try's path says nothing.** The box is `WORK/<six random hex digits>`. The reader test's paths named the arm and the task. The kept try's `setup.json` holds which box was which.
- **The session that sends the tries works from `/home/user` when it sends them,** so that the working directory the harness gives a subject is not inside this repository. In the reader test it was. The first kept record is read to see that this held. If it did not, the run stops.

A subject of this kind has no shell, so it cannot list a directory or search the machine.

## The ceilings

An Opus model of the same kind, with exactly what the arm's subject gets, one try for each task and text: `names` 9, `types` 9, `doc` 9, `ledger` 27 and `ledger-cut` 27, since a ledger arm has three texts. 81 tries.

A ceiling here does a second job. It says what a text holds for a strong reader. Where the Opus model fails a task with a text, that text does not hold enough for it.

## What is counted

- **Passed,** as in the reader test.
- **What a try grew by,** and the size of its text.
- **For `P1` and `I1`,** the part of the answer that the ledger's false note speaks to: `pinch`, and `a`.

Kept for each try: what the reader test kept.

## The rules, fixed before the run

The task is the unit, as in the reader test, and the passing rule is the reader test's, with its table of made-up subjects.

- **Passing.** For each task, the share of tries the first arm passed, less the share the second passed. The mean over the tasks is the difference, and the tasks are drawn again 10,000 times for an interval. *Shown*: a quarter or more, and the interval leaves out nothing. *No difference as large as a quarter*: the interval lies inside a quarter either way. Otherwise *cannot tell*.
- **One arm twice.** `types-a` is set against `types-b` first. If the rule tells them apart, nothing it says of any pair counts. A comparison with `types` counts only if both rounds give it.
- **The pairs,** and no others: `names`, `types`, `doc` and `ledger` each against `none`; `types` against `names`; `doc` against `types`; `ledger` against `types`; `ledger` against `doc`; `ledger-cut` against `ledger`.
- **A false note.** Over the tries of `P1` and `I1` in `ledger` and in `ledger-cut`, 12 in each: how many got the note's part wrong. *Harm shown*: 6 or more of 12 more with the note. *No harm that large*: 2 or fewer more. Otherwise *cannot tell*.
- **Each task is given by itself first,** as passes of tries in each arm, beside what the ceiling did with the same text.
- **Tokens have no rule.** The size of the text nearly fixes what a try reads. Passes are given beside the size of the text.

**What should be passed where,** written before any try. The reader test counted, before its own tries, which text names what each written task turns on (`grep -c` on the name; its table is under "The six written tasks"). The camera doc names it for `K1`, `B2`, `B3` and `B6`. The ledgers name it for `K1` (two of the three), `B1` (all three) and `B6` (two of the three). The declarations name it for all seven, since every exported name is in them. If a text teaches by what it names, an arm passes a code task where its text names the thing and fails it where it does not.

## The size

| run | tries |
|---|---|
| ceilings | 81, an Opus model |
| `none`, `names`, `types-a`, `types-b`, `doc` | 27 each: three for each task |
| `ledger`, `ledger-cut` | 33 each: three for each task, and three more on `P1` and on `I1` |

201 tries of a Haiku model and 81 of an Opus model. No try is added until the answers above are given. The reader test's one try a task with no library, 0 of 9, is not counted here: its paths were of the old kind.

**Cost, guessed from the same kind of try.** The reader test's nine tries with no library wrote 47,301 output tokens, 5,256 a try. At that rate 201 tries write about 1.1 million. After the first group the count is taken again and written here before the rest is sent.

## The order

1. The texts are made by the commands above. `check-tasks` is run: each reference answer passes and each plain answer fails.
2. A fresh reader, a Sonnet model of the same kind, gets one request of `types-a` and another gets one of `ledger`, with nothing else. Each says what it is asked, in what form and what is missing, and does the task once. Neither is a try.
3. The ceilings.
4. `none` and `types-a`, then the cost of the rest is written here.
5. The rest, in groups that each hold every arm still to run.
6. Every try is kept and graded. Every answer is read. Each failure is sorted. Then the rules are run once.

**The run stops, and the session that runs it asks,** if: a reference answer does not pass; a fresh reader finds something missing or something that can be read two ways; the Opus model with `types` passes fewer than 5 of 9; the cost after the first group points past 2.5 million output tokens; a subject's working directory is inside this repository; or a request holds an arm's name.

## How a failure is sorted

The arms are built to lack the code, so a failure has one more place to come from than in the reader test.

- **The text's**: the Opus model, with the same text and the same request, failed the same task. The text does not hold enough.
- **The subject's**: the Opus model passed with the same text, and the answer does not do what the ask says.
- **The test's**: the check fails on something the ask does not say, or the answer does what the ask says and the check still fails, or the try broke for a reason outside the subject.
- **Not known**: the answer, the check's output and the calls do not settle it.

In `none` there is no text, and a failure is the text's by this rule: nothing was given.

Tried on made-up failures:

| made-up failure | sorted as |
|---|---|
| `doc`, `B4`: the answer sets the pitch and nothing else; the Opus model with the doc did the same and failed | the text's |
| `types-a`, `B2`: the answer doubles `angularSensibility`; the Opus model with the same text halved it and passed | the subject's |
| `ledger`, `P1`: the answer says a pinch does nothing, as the ledger's note says; the Opus model with that ledger said the same | the text's, and it is counted under the false note as well |
| `names`, `K1`: the answer is right by the ask, and the check stops on a missing `window` | the test's |
| `ledger`, `B3`, try 2: the harness ended the subject before it wrote a file | the test's |
| `doc`, `B5`: the check fails and reading the answer does not show which of the ask's sentences it breaks | not known |

## What the test takes for granted

- **The subject can read and write files and do nothing else.** The request says there is nothing to run.
- **"The app" is `…/app`, and the library is imported as `@babylonjs/lite`.** The request says both.
- **The app's two config files name a checkout that is not there.** The request says the library is not on the machine. It was so in the reader test's arm with no library.
- **A code task's answer is one named file that exports one named function, and a question's answer is one named JSON file.** Each ask gives them.
- **The text is where the request says it is.**
- **An answer that would not compile can still be run by the check.** The check does not type-check. An import of a name the library lacks is `undefined` there, and the case that calls it fails.

## My guesses, before the run

1. **`none`:** 2 of 27 or fewer.
2. **`names`:** about a third, 7 to 12 of 27.
3. **`types`:** a half to two thirds, 13 to 19 of 27 in each round, and shown to pass more than `names`.
4. **`doc`:** 9 to 15 of 27, and most of its passes in `K1`, `B2`, `B3` and `B6`.
5. **`ledger`:** 6 to 11 of 33, and fewer than `types`.
6. **A false note:** with no code to check it against, the note is followed. 9 or more of 12 wrong with it, and 4 to 8 of 12 without it, where the subject has to guess. So the rule lands on *cannot tell* or *harm shown*.
7. **The ceilings:** the Opus model passes 7 of 9 or more with `types`, 6 or fewer with the doc, and 4 or fewer with any one ledger.
8. **The text limits, not the reader:** in each arm the Haiku model's share of passes is within 0.15 of the Opus model's.
9. **What should be passed where:** it holds for the doc and the ledgers on at least 5 of the 6 written tasks each.

## What each outcome would change

- **`types` passes more than the doc and the ledger:** for a reader with no code, the first text to hand over is the one a command cuts from the code. A ledger then has to add to it to earn its place, and the next question is what the declarations lack.
- **`names` does as well as `types`:** the makers' comments add little, and the smallest useful text is the signatures.
- **A ledger passes a task that `types` fails:** a map holds something the declarations do not, and the next arm is the two together.
- **A false note does harm here:** a note is not fit for a reader with no code until something has checked it, and calling it unchecked is not enough.
- **The Opus model passes much more than the Haiku model with the same text:** the reader limits more than the text does, and the small model has to be the next subject.

## What this cannot show

- **A reader that can run code.** A real session has the installed package and can try its answer. This subject cannot.
- **One library, nine tasks, three ledgers,** and one family of models for the ledgers, six of the tasks and the subject.
- **The texts are not of one kind.** The doc is the makers' notes on how the code is built, and was not written to teach its use. The ledgers were written for a reader who has the code.
- **The subject is not the small model this project is for.**

## How it is run

The session that builds and runs this writes here what it built, each command it ran, and each change it made to the plan, with its date.

### What was built, 2026-11-15

Written by the session that builds and runs this, which is not the session that wrote the plan above.

- **The tool is `text.py`,** beside this file. It imports the reader test's `reader.py` and points its keeper, its grader and its rules at this run's `tries`. The tasks, asks, hidden checks, scaffold and grader are read from `../2026-11-15-reader` and are not copied. The reader test's own tool and tries are not changed.
- **The library** was cloned from `https://github.com/BabylonJS/Babylon-Lite` at `2dddc888f6695e433ab29ae5918bee221375d86f` into a directory outside this repository. The pristine copy and the runner's `node_modules` were made by the three commands under "How to run it again" in the reader test's guide.
- **The texts** were made by the command above, with `tsc` 6.0.3 from the runner's `node_modules`, run in `packages/babylon-lite` of the pristine copy. No error, 17 files each time. The join is `for f in $(ls | LC_ALL=C sort); do echo "// $f"; cat $f; done`. The doc is `docs/lite/architecture/02-camera.md`, copied.

| text | in `app` as | bytes | sha256 |
|---|---|---|---|
| declarations without comments | `camera-api.d.ts` | 14,002 | `6eb658f9f54043ed0726418845981ef05caa42032069734dc269584c84aa30a6` |
| declarations with comments | `camera-api.d.ts` | 52,126 | `8187adf9d7f9ceaaea78a84ee9b03479f0e254649336fc3540104d29c647e784` |
| the makers' camera doc | `02-camera.md` | 52,885 | `6a67c6249e5cfb7e5187108cf7d0f54511d2a45994c82ffdab359dcb6ee4979e` |
| ledger 1, 2, 3 | `camera-ledger.toml` | 19,517; 21,153; 17,577 | in each try's `setup.json` |
| ledger-cut 1, 2, 3 | `camera-ledger.toml` | 17,118; 17,830; 14,869 | in each try's `setup.json` |

- **The two declaration texts are 455 bytes larger than the table of arms says.** The 17 files joined with no line between them are 13,547 and 51,671 bytes, which are the sizes above. The 17 lines `// <its name>` add 455 bytes. The texts a subject gets have those lines, as the plan says.
- **The texts of the library are not in this repository** and not in a kept try. The keeper checks that the text in a try's `app` still has the sha256 it was handed over with, writes that into `record.json`, and removes the copy. It does the same for a ledger, which is in the reader test's `guides`.
- **The box** of a try is `/home/user/work/<six random hex digits>`. `setup` stops if a request holds `types-a`, `types-b`, `ledger-cut`, `ceiling`, a text's own file name, or a task's name as a word, or if a part of the box's path is the name of an arm or a task. The words `ledger` and `type declarations` are in the request's own paragraph, as the plan gives it.
- **A ceiling** is kept under `tries/ceiling-<text>/<task>/<n>`. For a ledger, n is 1, 2 or 3 and picks the ledger, as in an arm.

Commands, each run on 2026-11-15:

```sh
python3 text.py texts --texts T
python3 text.py check-tasks --pristine P --runner R/node_modules
python3 text.py simulate
```

- **`check-tasks`:** every reference answer passed, every second right answer passed, every plain answer failed. 24 lines, all `ok`.
- **`simulate`,** the reader test's table of made-up subjects, nine tasks and three tries each, 400 made-up runs a line:

| made-up subjects | shown | cannot tell | no difference as large as a quarter |
|---|---|---|---|
| both pass every task 9 times in 10 | 0% | 33% | 67% |
| both pass every task half the time | 7% | 80% | 13% |
| both: three tasks never, six always | 0% | 0% | 100% |
| first 0.9, second 0.6, on every task | 67% | 31% | 2% |
| first 0.9, second 0.4, on every task | 98% | 2% | 0% |
| first 1.0 and second 0.0 on three tasks, both 0.9 on six | 53% | 47% | 0% |
| first 1.0 and second 0.0 on one task, both 0.9 on eight | 4% | 96% | 0% |

So when two arms are the same and pass half the time, the rule says *shown* in about 7 runs of 100. That is why `types-a` is set against `types-b` first.

### Two fresh readers, 2026-11-15

A Sonnet model of the kind `bench-subject-closed` got one request with nothing else: `types-a` on `B2`, and `ledger` on `P1` with ledger 3. When each had handed in, I asked it four questions: what it was asked and in what form, what was missing, what did not agree, and what could be read two ways. Their requests, answers, reports and second replies are in `fresh-reader/`. Neither is a try.

- **The reader with the declarations passed `B2`.** It halved `camera.angularSensibility` and called `attachControl`. Its second reply did not take my four questions one by one. It gave what it was unsure of.
  - *Missing:* "the .d.ts only shows internal modules, so I assumed `@babylonjs/lite` exports `attachControl` under that name." The declarations are of `src/camera` and do not hold the package's own list of exports.
  - *Two readings:* "I halve whatever value the camera has now. If the app has already changed the sensibility, that differs from setting it to 500." The ask says "twice as far as the library's default controls turn it".
- **The reader with the ledger failed `P1`.** It wrote `false` for all three, and the answer is `false`, `false`, `true`. It followed the ledger's note: "the only support is an unchecked note in the ledger". So the false note did to a Sonnet model what guess 6 says it will do to a Haiku model.
  - *Missing:* "The ledger has no checked row on what happens when `attachControl` gets no scene", and "The ledger says nothing separate about wheel or pinch handling."
  - *Two readings:* "Nothing on that page runs a render loop" could mean the page's own code or no loop at all. "Change the camera's alpha, beta or radius" could mean the stored values or what is seen on screen. The reader said both readings give the same answer under the note.
- **Both subjects' records give the working directory `/home/user/Kung-Fu`.** The harness puts this session's shell back in the repository after each command that ends outside it, so `cd /home/user` does not hold.

**Two stop conditions are met,** and no try has been sent: a subject's working directory is inside this repository, and a fresh reader found something missing and something that can be read two ways. The session that wrote the plan has been asked.

### The working directory: a stop, and the designer's choice, 2026-11-15

- **The stop.** The plan says this session works from `/home/user` when it sends a try. It cannot. After each shell command that ends outside the repository the harness prints "Shell cwd was reset to /home/user/Kung-Fu". The two fresh readers' records give `cwd` as `/home/user/Kung-Fu`. I stopped and asked the session that wrote the plan.
- **The designer chose to go on,** with the working directory at the repository's root, as a written limit. It said it would tell the maintainer. It ruled out a change to this session's settings.
- **What a subject is told.** I sent one Haiku model of the same kind a probe, with no task, that asked it to quote every line it had been given about its place. This is one model's account of its own instructions, and not a record. It quoted: "Primary working directory: /home/user/Kung-Fu/bench/runs/2026-11-15-text-only", "Is a git repository: true", the platform, the shell, a scratch directory of this session that it is told to use for temporary files, the date, two paths of the network proxy, and this session's link. It said of a branch, a commit, a commit message and a git status: "not given".
- **The probe's working directory was the run's own directory,** because my shell stood there when I sent it. So the directory a subject is told is where this session's shell stands at that moment. From here on every shell command of mine ends at the repository's root while tries are out, and the keeper prints STOP for a record whose `cwd` is below the root.
- **The limit.** Every subject is told a working directory that holds this project's name, and that it is a git repository. It is the same in every arm. A subject of this kind cannot list or search, so it can reach a file of this repository only by a full path it guesses.
- **A spoiled try,** by the designer's rule: the subject named, in a call, a path outside its box that exists and gave content back, or wrote outside its box other than a scratch file of its own. The keeper writes it into `record.json` under `spoiled`. Each is listed beside the scores. The rules are run once on every try as graded, and the tables are given again with the spoiled tries left out: `tally --without-spoiled`, `compare --without-spoiled`. No try is sent in place of one.
- **My working files** are in a directory under `/var/tmp`, which no subject is told of.

### The fresh readers' findings: the designer's answer, 2026-11-15

The session that wrote the plan answered: go on with the asks as they stand, and mend nothing. Its reasons, in its words as sent to me:

- "The declarations of `src/camera` do not hold the package's list of exports, so a subject has to take it that "@babylonjs/lite" exports each camera function under the name the declarations give. That is so in every arm with a text, and the request says how the library is imported. It is a limit, written down, and the texts stay as the commands make them."
- "'Twice as far as the library's default controls' on B2: the check sets the answer beside the library's own controls on a camera with the default value, so both readings give one answer there. No change."
- "The ledger reader on P1 followed the note that is false and said so. That is what the run is built to count, not a fault in the ask. Its two readings give one answer. No change."

Neither fresh reader is a try, and what the ledger reader did is not counted under the false note.

### The cost of the rest, written before it is sent, 2026-11-15

The ceilings and the first group are kept and graded: 81 tries of an Opus model, then `none` and `types-a`, 54 tries of a Haiku model. No try is spoiled. Every record gives the working directory `/home/user/Kung-Fu`.

- **The first group wrote 259,299 output tokens:** `none` 139,484 and `types-a` 119,815. That is 4,802 a try. The plan's guess was 5,256 a try.
- **The 147 tries still to send should write about 706,000,** and the 201 together about 965,000. That is under the 2.5 million at which the run would stop.
- **The ceilings wrote 277,653 output tokens** in 81 tries.
- **The Opus model with `types` passed 9 of 9,** so that stop condition is not met.

The rest is sent in nine groups, one for each task. A group holds that task's tries in `names`, `types-b`, `doc`, `ledger` and `ledger-cut`: 15 tries, and 21 for `I1` and for `P1`.

