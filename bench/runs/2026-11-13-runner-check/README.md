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
3. **The try.** Pick a directory outside the repository for subjects' files, WORK, and run:
   `python3 bench/setup.py BINARY WORK 2026-11-13-runner-check none T02 --set outline --variant 0 --subject bench-subject`
   It writes `bench/runs/2026-11-13-runner-check/none/T02/v0/request.md`.
4. **The subject.** Launch one subagent with the harness's tool for that: its kind `bench-subject`, its model `haiku`, a description of a few words that says nothing of the task, and as its prompt the whole of `request.md`, word for word, with nothing before or after. Leave it to run in the background, which is how that tool starts one unless told otherwise. If there is no kind `bench-subject`, stop and report. Use no other kind and no other model.
5. **Wait** until the harness says the subject has finished.
6. **Keep it.** RECORDS is the directory named `subagents` under `/root/.claude/projects/` that holds this session's `agent-*.jsonl` files.
   `python3 bench/claude_code.py 2026-11-13-runner-check --records RECORDS --wait 580 --need 1 --model-starts claude-haiku --model-as "a Haiku model"`
   `python3 bench/lines.py bench/runs/2026-11-13-runner-check --records RECORDS`
   `python3 bench/start.py bench/runs/2026-11-13-runner-check/none/T02/v0 --records RECORDS > bench/runs/2026-11-13-runner-check/none/T02/v0/start.json`
7. **Commit and push.** Only files under `bench/runs/2026-11-13-runner-check/`. No file may hold the full name of a model: `grep -rnE "claude-(haiku|fable|opus|sonnet)-[0-9]" bench/runs/2026-11-13-runner-check` must find nothing. Push to the branch you were started on, and open no pull request.
8. **Report** in one message to the session that started you, with: the commit; whether each step went as written; what `start.py` prints with `--show` after its line of dashes, which is for reading and not for the repository; and nothing of what the subject answered or reported.
