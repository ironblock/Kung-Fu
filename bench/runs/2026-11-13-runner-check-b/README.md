# 2026-11-13-runner-check-b: the runner's try again, with the project's instructions left out of a subject

This was written before the run.

- **What.** The same one try as `../2026-11-13-runner-check`: the Haiku model as a `bench-subject` on T02 of the set `outline`, variant 0, with the tool and no guide, launched by hand from a runner, a second session on a machine of its own. A new runner is made for it.
- **Why.** The first runner's subject was handed `AGENTS.md`, this repository's rules for measuring, because a runner starts at the repository's root. The harness's documents name a setting for a kind of subject, `omitClaudeMd`, that starts it without a project's instructions, and they count a file like this one among those. Both kinds of subject in `.claude/agents/` now carry it. This run finds out whether it does what the documents say.
- **What else is changed from the first run,** each for a thing that run showed:
  - The request is sent without the newline at its end, as it always was by hand.
  - The try is committed as set up before the subject is launched, which is the repository's rule.
  - The runner's report is short. The texts are asked for only if a mark here is not the one expected.
- **The session that runs the study keeps its own copies of the two kinds, unchanged.** A subject launched from it is what it was.
- **It measures nothing about a guide.**

**What is expected,** set against `hand.start.json` (a try launched by hand) and `../2026-11-13-runner-check/none/T02/v0/start.json` (the first runner's):

1. **No note of the project's instructions before the subject's first message.** This is the check. If the note is still there, the setting does not do for this file what the documents say, and this way is closed: tries stay launched by hand from the session that runs the study, and no further way is tried without the maintainer's word.
2. **The same four pieces of instructions,** by their marks. The setting is not part of what a subject is told.
3. **The request with the mark `b9213952dca1aec0`,** which is the request by hand. The reminder of how to hand back, the notes of the model, the date, the account and the session with the marks they had by hand. The note of the surroundings with the first runner's mark, `37c68dbbe4fad257`. No reminder from this session's past.
4. **A first request between 6,980 and 7,040 tokens.** By hand it was 7,065. The request is 134 characters shorter for its shorter path, the absent reminder is 53, and the note of the surroundings is 7 longer: 180 characters less, which at the rate the first run showed is about 57 tokens.
5. **8,475 characters after the first message,** with the first runner's mark, `f4bed26e10f7c3a9`.
6. **Haiku, medium, in the background, at depth 1, with seven tools.**
7. **Kept by the bench on the runner's machine, scored here, and handed over** by a commit and one message that holds nothing of the subject's answer or report.

**What it changes.** If all seven hold, the next round of the fourth study is launched by one runner for the whole round, so that every arm of the round starts in one place. What then still differs from a subject launched by hand is bound to the session and not to the subject: the path, one reminder, and the names of the connected services. If check 1 fails, see there. If another fails, it is read before anything is decided.

- **What it should cost:** about 3,000 output tokens of the Haiku model. The runner: a guess of 5,000 output tokens of the stronger model, and about 1.5 million tokens read at the price of text read before.

## What the runner does

Do these in order, from the root of the repository, on the branch you were started on. Change nothing outside `bench/runs/2026-11-13-runner-check-b/`. If a step fails or shows something this note does not expect, stop there and report it. Do not mend it, do not work around it, and do not launch a second subject.

1. **The tool.** In a directory outside the repository, run `npm install @ast-grep/cli@0.51.1`. The program is `node_modules/.bin/ast-grep` under that directory, and `--version` must say `ast-grep 0.51.1`. Call its full path BINARY.
2. **The bench.** `python3 bench/selfcheck.py BINARY` must end with `the instrument does what it says`.
3. **The tasks.** `python3 bench/build.py BINARY --set outline` builds the set's variants under `bench/built/`, which is not kept in the repository. It stops if what it built is not what the set says.
4. **The try.** WORK, the directory for subjects' files, is `/tmp/kf-work`: the first runner used it, and with it the request is as long as that runner's. Run:
   `python3 bench/setup.py BINARY WORK 2026-11-13-runner-check-b none T02 --set outline --variant 0 --subject bench-subject`
   It writes `bench/runs/2026-11-13-runner-check-b/none/T02/v0/request.md`.
5. **Commit the try as set up, and push.** Only files under `bench/runs/2026-11-13-runner-check-b/`. Push to the branch you were started on. Open no pull request.
6. **The subject.** Launch one subagent with the harness's tool for that: its kind `bench-subject`, its model `haiku`, a description of a few words that says nothing of the task, and as its prompt the text of `request.md`, word for word, without the newline at the file's end, and with nothing before or after. Leave it to run in the background, which is how that tool starts one unless told otherwise. If there is no kind `bench-subject`, stop and report. Use no other kind and no other model.
7. **Wait** until the harness says the subject has finished.
8. **Keep it.** RECORDS is the directory named `subagents` under `/root/.claude/projects/` that holds this session's `agent-*.jsonl` files.
   `python3 bench/claude_code.py 2026-11-13-runner-check-b --records RECORDS --wait 580 --need 1 --model-starts claude-haiku --model-as "a Haiku model"`
   `python3 bench/lines.py bench/runs/2026-11-13-runner-check-b --records RECORDS`
   `python3 bench/start.py bench/runs/2026-11-13-runner-check-b/none/T02/v0 --records RECORDS > bench/runs/2026-11-13-runner-check-b/none/T02/v0/start.json`
9. **Commit and push.** Only files under `bench/runs/2026-11-13-runner-check-b/`. No file may hold the full name of a model, and `start.json` may hold no id of the shape 8-4-4-4-12: each of these must find nothing:
   `grep -rnE "claude-(haiku|fable|opus|sonnet)-[0-9]" bench/runs/2026-11-13-runner-check-b`
   `grep -nE "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" bench/runs/2026-11-13-runner-check-b/none/T02/v0/start.json`
10. **Report** in one short message to the session that started you: the two commits; for each step, whether it went as written; and anything this note does not speak of. Do not send the texts that `start.py --show` prints unless asked, and send nothing of what the subject answered or reported.

## What came, 2026-11-13: the subject starts where one launched by hand starts, but for what is bound to the session

The runner did every step. One subject ran and was kept. Its start was set against what was written above.

1. **No note of the project's instructions.** It is gone. The setting does what the documents say, for `AGENTS.md` too.
2. **The same four pieces of instructions,** by their marks.
3. **Every turn and note with the mark that was expected:** the request, the reminder of how to hand back, the surroundings, the model, the date, the account, the session. No reminder from this session's past.
4. **The first request was 6,974 tokens, six below what was expected.** The miss is this note's. It took the rate of tokens to characters from `AGENTS.md`, which is prose. What is absent here is mostly a long path with an id in it, twice, and such text costs more tokens for each character. By hand the start was 7,065: the 91 tokens between go with 176 characters, all of them in the three pieces known to differ. No program here can count them one by one.
5. **8,475 characters after the first message,** with the first runner's mark.
6. **Haiku, medium, in the background, at depth 1, with seven tools.**
7. **Kept, scored and handed over.** Scored here it passes: 7 calls on the task's code, the fifth the first right one, 4,216 output tokens. Two commits came, and three messages with nothing of the subject's answer in them.

**The runner stopped once more, and rightly.** While keeping the try, `claude_code.py` printed five signs that the subject had left its directory, which the steps had not spoken of. They are read here: each of the five commands names only the subject's own directory. Four begin by putting `bin` on the path before they change directory, and one reads `task.md` by its full path. `keep.py` marks any command that does not begin inside the directory, for a reader to judge. The runner's own harness then told it to commit what was not yet committed, and it did, saying so.

**One thing more from the runner.** Its machine had the branch's newest commit checked out by its id, and the branch's own name still pointed at an older one. It moved the name to the newest commit before it began. A round's steps must say to do that.

**What it changes.** Checks 1 to 3 and 5 to 7 hold, and the one number that missed did so by this note's arithmetic and not by any text that differs. So, as written beforehand: **the next round of the fourth study is launched by one runner for the whole round.** What a runner's subject still does not share with one launched by hand is bound to the session: a shorter path, one reminder that is absent, and the names of the connected services. That is 91 tokens fewer at the start and 74 characters more after the first message. A round is compared inside itself, and every arm of it comes from the one runner.

**What a round's steps must hold, that these two runs taught:** start at the branch's newest commit; build the set; commit the tries as set up before any subject is launched; send each request without the newline at its end; expect the signs that `claude_code.py` prints and leave them to be read; let only one session push at a time; keep the report short. They are written into `bench/README.md`.

**What it cost.** The subject: 4,216 output tokens of the Haiku model, against a guess of 3,000. The runner's own tokens were not read: its account of itself is long, and reading the first runner's cost this session more than that runner's subject had cost. The first runner's figures stand as the guide: about 10,000 output tokens of the stronger model and 2 million tokens read at the price of text read before, for one try.
