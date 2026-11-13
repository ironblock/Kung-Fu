# 2026-11-13-runner-check: one try launched by hand from a second session

This was written before the run.

- **What.** The Haiku model, as a subject of the kind `bench-subject`, on T02 of the set `outline`, in variant 0, with the tool and no guide: one try. It is the same try as `../2026-11-13-fourth-a/none/T02/v0`, launched the same way, by hand with the harness's tool for subagents. What differs is where: not in the session that runs the study, but in a second session of the same harness, on a machine of its own, made for this and for nothing else. That session is called the runner here.
- **Why.** Each try launched from the session that runs the study leaves its request and its report in that session's memory, and that session reads its whole memory again at every launch. It also sees each report before the tries are kept. A runner would take the launching away and hand back kept tries. Two other ways were tried on 2026-11-13 and are told in `../2026-11-13-workflow-smoke` and `../2026-11-13-workflow-inner`: a workflow changes what a subject is sent. This way should not, and that is what is checked. The maintainer left the choice of way to the session, on 2026-11-13.
- **It measures nothing about a guide.** One try, one arm, no comparison.

**What is checked, and what each outcome changes.**

1. **The runner has the kind of subject.** The two kinds are files in this repository, and the harness's documents say a session loads them. If the runner has no `bench-subject`, it stops, and this way is closed until the kinds reach a runner some other way. Nothing else is tried in this run.
2. **The same instructions.** `start.py` marks each piece of what a subject is given before any turn. `hand.start.json` holds the marks of the try launched by hand. Expected: four pieces with the same four marks. If a piece differs, a subject launched by a runner is another instrument, and no round from a runner is set beside a round from this session.
3. **The same turns and notes before its first message.** Expected: the same kinds in the same order, and the same marks for the request and for the harness's reminder of how to hand a report back. Three notes may differ and still be harmless, since they are bound to the session and not to the subject: the one that names the working directory, the one that names the session, and one reminder that this session carries from its own past. Each difference is read, not guessed at.
4. **Where it starts.** By hand the first request was 7,065 tokens. Expected: within 30 of that, with every token of difference traced to a piece that differs.
5. **What the harness adds later.** By hand: 8,401 characters after the first message, instructions for four connected services. If the runner is connected to other services, its subjects read other text. `score.py` and `compare.py` leave that text out, but it was read all the same.
6. **The same model, effort and way of starting.** Haiku, medium, in the background, at depth 1.
7. **The bench keeps it.** `claude_code.py` and `lines.py`, run by the runner on its own machine. Then `score.py`, run here after the runner has pushed. By hand this try passed in both rounds.
8. **The hand-over.** The runner commits the kept try and pushes it, then sends one message. The message must hold nothing of what the subject answered or reported.

**What it changes.** If 1 to 8 hold, or only the three session-bound notes of check 3 differ, the next round of the fourth study is launched by a runner: one runner for the whole round, so that every arm of a round starts in one place. If the instructions, the tools or the model's effort differ, a runner can still launch a study from its first round on, and is not used inside the fourth.

**What is lost this way.** The harness's own records of a runner's subjects stay on the runner's machine and go when it goes. What remains is what the bench keeps: `record.json`, `lines.json`, and now `start.json`. On 2026-11-13 an independent check found the harness's text in the measure by reading the harness's own records. With a runner, a later check has only what the bench kept.

- **What it should cost:** about 3,300 output tokens of the Haiku model for the subject. The runner works on the stronger model: a guess of 5,000 output tokens.

## What the runner does

Do these in order, from the root of the repository, on the branch you were started on. Change nothing outside `bench/runs/2026-11-13-runner-check/`. If a step fails or shows something this note does not expect, stop there and report it. Do not mend it, do not work around it, and do not launch a second subject.

1. **The tool.** In a directory outside the repository, run `npm install @ast-grep/cli@0.51.1`. The program is `node_modules/.bin/ast-grep` under that directory, and `--version` must say `ast-grep 0.51.1`. Call its full path BINARY.
2. **The bench.** `python3 bench/selfcheck.py BINARY` must end with `the instrument does what it says`.
3. **The tasks.** `python3 bench/build.py BINARY --set outline` builds the set's variants under `bench/built/`, which is not kept in the repository. It stops if what it built is not what the set says. *This step was added on 2026-11-13, after the first runner stopped for want of it: see the end of this note.*
4. **The try.** Pick a directory outside the repository for subjects' files, WORK, and run:
   `python3 bench/setup.py BINARY WORK 2026-11-13-runner-check none T02 --set outline --variant 0 --subject bench-subject`
   It writes `bench/runs/2026-11-13-runner-check/none/T02/v0/request.md`.
5. **The subject.** Launch one subagent with the harness's tool for that: its kind `bench-subject`, its model `haiku`, a description of a few words that says nothing of the task, and as its prompt the whole of `request.md`, word for word, with nothing before or after. Leave it to run in the background, which is how that tool starts one unless told otherwise. If there is no kind `bench-subject`, stop and report. Use no other kind and no other model.
6. **Wait** until the harness says the subject has finished.
7. **Keep it.** RECORDS is the directory named `subagents` under `/root/.claude/projects/` that holds this session's `agent-*.jsonl` files.
   `python3 bench/claude_code.py 2026-11-13-runner-check --records RECORDS --wait 580 --need 1 --model-starts claude-haiku --model-as "a Haiku model"`
   `python3 bench/lines.py bench/runs/2026-11-13-runner-check --records RECORDS`
   `python3 bench/start.py bench/runs/2026-11-13-runner-check/none/T02/v0 --records RECORDS > bench/runs/2026-11-13-runner-check/none/T02/v0/start.json`
8. **Commit and push.** Only files under `bench/runs/2026-11-13-runner-check/`. No file may hold the full name of a model: `grep -rnE "claude-(haiku|fable|opus|sonnet)-[0-9]" bench/runs/2026-11-13-runner-check` must find nothing. Push to the branch you were started on, and open no pull request.
9. **Report** in one message to the session that started you, with: the commit; whether each step went as written; what `start.py` prints with `--show` after its line of dashes, which is for reading and not for the repository; and nothing of what the subject answered or reported.

## The first runner stopped at the try, 2026-11-13: this note had left out a step

The runner installed the tool and the bench's self-check passed on its machine. Then `setup.py` refused: the variants of the set were not built. They are built by `build.py` into a directory that the repository does not keep, and the session that wrote this note had built them days before and no longer thought of it. The runner did as told: it stopped, changed nothing, launched no subject and said so, word for word.

- **What it shows.** The way a round is run was not written down well enough for a session that has only the repository. This was the first time it was asked of one.
- **What was changed.** The step is added above as step 3, and the later steps are numbered anew. Nothing else in the note is changed, and none of the eight checks.
- **What it says of check 1.** The runner reports that the two kinds of subject are in its list. It has not yet launched one.
- **The same runner goes on,** from step 3, after it has fetched this note again. It keeps the tool it installed.

## What came, 2026-11-13: the try was kept, and the subject was handed this repository's own rules

After the missing step was added, the runner did every step as written. One subject ran, and the bench kept it. It is not the same subject as one launched from the session that runs the study.

1. **The runner has the kind of subject.** Yes.
2. **The same instructions before any turn.** Yes: four pieces, the same four marks.
3. **The turns and notes before its first message: not the same, and not harmlessly.**
   - **The request** is the same but for the newline at its end: the runner sent the file whole, and by hand it went without. The steps had not said which.
   - **The reminder of how to hand a report back** is the same.
   - **The note of the surroundings** differs as foreseen: another path for scratch files, and it says the working directory is a repository.
   - **The reminder this session carries from its own past** is absent, as foreseen.
   - **One note was not foreseen: the whole of `AGENTS.md`, 10,401 characters, handed over as the project's instructions.** A runner starts at the repository's root. The harness looks there for such a file and gives it to every subagent. The session that runs the study starts one directory above, where there is none, so no subject launched from it was ever given the file. `AGENTS.md` is this repository's rules for measuring. A subject that has read it knows it is a subject, and how it will be judged.
4. **Where it starts.** 10,302 tokens, against 7,065 by hand. The 3,237 between them go with the 10,222 characters by which the two starts differ, nearly all of them `AGENTS.md`.
5. **What the harness adds later.** 8,475 characters, against 8,401. The same four services, by the runner's account of the four pieces, but three are named by an id of 36 characters where this session names them by a word. That is the 74 characters.
6. **The same model, effort and way of starting.** Yes: Haiku, medium, in the background, at depth 1, with the same seven tools.
7. **The bench keeps it.** Yes, on the runner's machine. Scored here: it passes, with 4 calls, the first of them right, and 2,837 output tokens.
8. **The hand-over.** The commit came, and one message, with nothing of the subject's answer or report in it.

**Was any kept try given that file?** No sign of it. In every run kept so far, the subjects of one kind start within 35 tokens of each other, and the start of the try launched by hand, in `hand.start.json`, holds no such note.

**What it changes.** By what was written beforehand, a runner started like this one is not used inside the fourth study. It is more than that: it is not used for any study, since what it adds is about the measuring itself. The harness's documents name a setting of a subject's kind that leaves a project's instructions out. That is tried next, in `../2026-11-13-runner-check-b`, written down before it runs.

**Three smaller things this try showed.**

- **`start.py` wrote three ids into the repository.** In the runner the connected services are named by ids, and `start.py` kept the names as they were. They are ids of the maintainer's connected services, not keys. They are masked in `start.json` now, and `start.py` masks such names from here on. The commit that first held them was written anew on 2026-11-13, at the maintainer's word, and the branch's history holds them no more.
- **A runner is not small.** Its own requests ran from 83,000 to 114,000 tokens, about half of what the session that runs the study reads at each step, not a small part of it. For this one try it wrote 9,672 output tokens on the stronger model, against a guess of 5,000, much of that the long report it was asked for.
- **The runner's own harness asked it, while the subject ran, to commit the files the set-up had made.** It waited, as the steps said. A round's steps should have the set-up committed before any subject is launched, which is the repository's rule anyway.

**What it cost.** The subject: 2,837 output tokens of the Haiku model, against a guess of 3,300. The runner: 9,672 output tokens of the stronger model, and about 1.9 million tokens read at the price of text read before.
