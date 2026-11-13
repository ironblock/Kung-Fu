# 2026-11-13-workflow-inner: one try launched by a workflow that a subagent starts

This was written before the run.

- **What.** The Haiku model, as a subject of the kind `bench-subject`, on T02 of the set `outline`, in variant 0, with the tool and no guide: one try. It is the same try as `../2026-11-13-workflow-smoke/none/T02/v0`, with the same request but for the path, which is as long. The workflow script is the smoke test's, not a character changed. What differs is who starts it: there the session that runs the study called the workflow itself; here that session starts one subagent of the general kind, and the subagent calls the workflow.
- **Why.** The smoke test found that a workflow hands each subject the maintainer's last message before the request. The installed program, read and not tried, leaves that message out when a workflow is started from inside a subagent. On 2026-11-13 the maintainer said to try it, so that it is clear whether that way is open.
- **It measures nothing about a guide.** One try, one arm, no comparison.
- **It will not be kept.** By what the program says, the request still reaches the subject inside the harness's frame, each line set in by two spaces, so the first thing the subject is sent is not `request.md` and `keep.py` will refuse it, rightly. That is known beforehand and is not what is checked.

**What is checked, and what each outcome changes.**

1. **Whether it can be started at all.** The subagent is told to call the workflow with the smoke test's script and this one try. If it has no such tool, or the harness refuses, that is the answer. No other way is then tried.
2. **What the subject is sent.** Expected, from the program's text: one turn only, the frame and then the request; no turn with the maintainer's message; no words of the session's, and none of what the launching subagent was told. If any of those words reach the subject, this way is closed. If none do, it is open, and what it would still take stands: `keep.py` taught to read the framed turn, one way of launching throughout a study, and the knowledge that all of it is what one version does and is promised nowhere.
3. **The same kind of subject.** The record names `bench-subject`, its tools, the Haiku model, and the effort. By hand and in the smoke test that was medium.
4. **Where it starts.** A subject's first request was 7,065 tokens by hand and 7,584 in the smoke test, and the harness handed it 8,401 characters after its first message. Expected here: between the two, since one turn is gone and the frame stays.
5. **What comes back.** The launching subagent is told to hand back the workflow's own result and nothing of the answer. Whether the subject's words reach the session by that way is looked at.
6. **Whether the workflow outlives its starter.** A workflow runs behind the one that started it. If the subagent's run ends before the subject's does, the subject may be cut off. What happens is written down.
7. **The answer.** Not scored, since the try is not kept. It is set beside the kept answer of the same try in `../2026-11-13-fourth-a`, as in the smoke test.

- **What it should cost:** about 3,700 output tokens of the Haiku model for the subject, as in the smoke test. The launching subagent runs on the stronger model, reads much and writes little: a guess of 2,000 output tokens.

## What came, 2026-11-13: it could not be started

The subagent of the general kind has no workflow tool. No workflow ran and no subject was started, so checks 2 to 7 have nothing to say.

- **What the subagent said:** the tool was not in its list, and one search for it by name came back with "No matching deferred tools found". It did nothing else, as told.
- **What its record shows,** read after: the same. The tools it was handed do not name the workflow tool, nor do the tools it could ask for. They do not name the tool that starts a subagent either.
- **The subject's directory is untouched,** and no new record of a workflow lies beside the smoke test's.
- **What it cost:** two calls by the launching subagent, on the stronger model. No Haiku tokens.

So for a subagent of the general kind this way is closed: it cannot start a workflow at all.

## A second start, written before it runs: a fork of the session

The note above said that if the subagent had no such tool, no other way would be tried. This goes past that, and here is why. The maintainer asked for this check so that it is clear whether starting a workflow from inside a subagent is open. One kind of subagent is left that may hold the tool: a fork, which is a copy of the session that runs the study, with that session's own tools. If it is not tried, the answer stays half given. It is one more try, on the try already set up, which no subject has touched.

- **What.** The session forks itself. The fork calls the workflow with the same script and the same one try, waits until the subject's answer file is there, and hands back the workflow's own result.
- **What differs from a real round.** Nothing for the subject, if the program does what its text says. The fork knows everything the session knows, but the fork is not the subject.
- **What is checked.** Checks 1 to 7 above, as they stand. For check 2 there is more that must not reach the subject: anything of the session's whole conversation, which the fork carries.
- **If the fork cannot start a workflow either,** the way is closed, and nothing further is tried: no other kind of subagent, no setting, no change to the script.
- **What it should cost:** about 3,700 output tokens of the Haiku model for the subject. The fork reads the whole of the session's conversation each time it acts, at the price of text read before, and writes little: a guess of 2,000 output tokens on the stronger model.
