# How this run was launched

Written 2026-11-17 by Claude Opus 5.5, in a Claude Code session on the maintainer's machine, before any try. This is the session that launched the kept run. Where a line says the maintainer chose something, the words quoted are his.

## The four open things, closed

1. **Go.** The maintainer said "Go" on 2026-11-17 at about 20:52Z.
2. **Rule 1: the subject is the kept run's.** Each part is under "The subject" below. The kept 138 tries are the top step.
3. **The server hands `chat_template_kwargs` to the template.** At 20:54:17Z this session sent the request under "Before any try", with `"reasoning_effort": "none-such"`. The server answered with an error: `{"detail":"TemplateError: Unexpected reasoning effort none-such. Supported types are xhigh (default), medium, and low."}`. So the server hands the field on.
4. **No ceiling is run first.** The maintainer: "Agree, skip". The owning session has a setup that can run one on Haiku or Sonnet if it judges one is needed.

**The added rules are kept.** The note says the maintainer keeps or strikes each before the go. He said: "I'd do whatever you take Fable to want - as long as it's a useful test, go ahead." The owning session keeps every one, so all are kept.

## The subject

**The build.** `turboderp/Qwen3.8-27B-exl3` on Hugging Face, branch `3.00bpw`, revision `6fe61ad620abfe97c5b49f9722c2bceeea4ccc28`.
- **Its revision:** the download records of all 16 files the server loads name that revision. The files are dated 2026-10-03.
- **Its quantization:** its `quantization_config` says exl3 1.4.2, 3.00 bits a weight, 6 bits for the head, 4 bits for the MTP layers, codebook `mul1`.
- **What shows the kept tries were made on it.** The server is one process. It loaded this model at 00:23:49Z on 2026-11-17. The kept run's first try of the 27B was answered at 00:52:42Z, after 376 seconds. The same process served every kept try, and it is still running at this run's start.
- **One file differs from the build.** It is the image preprocessor's settings: the smallest image size, `shortest_edge`, is 1,048,576 in place of 65,536. It acts on images only, and no message here holds one. The kept run had the same file.

**The template.**
- **Which file:** the build's own `chat_template.jinja`. The server's log at load says `Using template "chat_template" for chat completions.` Its sha256 begins `c3cf9e34abf4f9e3`.
- **The two `grep` commands of rule 1:** each printed `1`.
- **Defaults the server adds:** one template value, `preserve_thinking: true`, and no other. So `reasoning_effort` was unset in every kept try, and the template took `xhigh`.

**The server.** Each part is what the kept run's `LAUNCH.md` gives.
- **Programs:** TabbyAPI `be74bf0a`, ExLlamaV3 1.5.4, and a DFlash2 draft model.
- **Context:** 163,840 tokens.
- **Cache:** 163,840 tokens, with 8-bit keys and values.
- **Requests at once:** 2.

**Two ways the server can end a reply, written down here.** Neither is new, and both were the same in the kept run.
- **It stops a loop by itself.** ExLlamaV3 stops a reply when the last 800 tokens are a repeating pattern. The setting is `loop_detect_window`, and the server's default is on. The reply then ends with the finish reason `stop`, as an ordinary reply does. Only the server's log says "generation stopped because a token loop was detected". In the kept run it did so once: `names-27b/B6/3`, at 03:24:59Z, the try that ended with nothing outside its reasoning. This session reads the log after each step and writes here every try it stopped.
- **It hands the reply out in pieces.** `output_chunking` is on by default, 2,048 tokens a round, so a request does not hold cache for its whole reply at the start.

## What every request carries

The note's commands, unchanged. `--parallel 2` is the server's two requests at once. Two tries of 68,923 tokens are 137,846, inside the cache of 163,840. `bench/box.local.json` is the one the kept run used.

## Before any try

- `box.py check-tasks bench/sets/camera` ended with `window: stub; all as they must be`.
- `box.py setup` printed `414 tries set up now; 414 set up in all`.
- `small.py prompt --arm union-off --task F5 --n 1 --message-form 1` was 31,232 bytes, about 8,923 tokens. It holds the line `Here are the files in the app that matter:`.

## Sending in more than one part

The maintainer needs the machine for other work this evening. In his words: "Finishing the test in two parts should be completely valid". So the sending may stop and begin again.
- **A stop:** this session stops the launcher by its process id. It sends `SIGTERM`, then `SIGKILL` if the launcher has not gone within a few seconds.
- **What a stop costs:** a try in flight then is not kept. The server stops making its reply when the request goes away. The next launch writes "the launcher was stopped before the reply came" into the try's `setup.json`, and sends it again.
- **Starting again:** the same command, unchanged. It sends only the tries with no `record.json`.
- **If the server is started again between the parts:** this file says so, with the time, and rule 1 is checked again before the next try.

**As it came:** the run ended in one part. No launcher was stopped, and every try went to the same server process.

## Step 1, `off`

**The first group.** Sent from 20:55:01Z to 20:58:34Z: 23 kept, none cut off, none not run. `ladder.py first off` printed:

```
union-off, the try numbered 1 of each task: 23 tries
  output tokens: sum 7,121, mean 310, median 102; cut off 0; ended in a call to a tool 21; with reasoning text in the reply 0
  the kept run's union-27b: median 12,676 over 69 tries; a fifth either side of it is 10,141 to 15,211
  below it: the median is 0.01 of the kept run's. The setting is taken as honoured.
  the kept run's union-27b, with a reply counted as 60,000 at most: 16,345 output tokens a try
  the mean is 0.02 of that
  the rest of the step `off`: union-off 115, names-off 138 = 253 tries
    at this group's mean a try: about 78,331 output tokens
    with a bare arm's try taken as 1.37 of a notes arm's, as in the kept run: about 93,999
    the same tries at the top step, at the kept run's output a try: about 4,962,453
    at most, were every reply to reach its limit of 60,000: 15,180,000
```

- **The stops:** none of rule 10's three words was printed, and the replies with reasoning text are 0. So no stop: thinking was off, and the setting is taken as honoured.
- **What the rest was said to cost before it was sent:** about 94,000 output tokens, by the line above, for 253 tries.
- **21 of the 23 replies ended in a call to a tool.** Nearly all were about 100 tokens, a sentence and the call. The note keeps message form 1 on purpose and has no stop for this. Its guesses were 4 to 15, and 10 to 30, of the 138 tries of `union-off`. This group points to far more. The rest is sent as the note says.

**The rest.** Sent from 20:59:14Z to 21:28:54Z: 253 kept, none cut off, none not run, none did not fit.

**After the step.** The six commands under "After each step" were run once all 276 tries were graded.
- **Passes:** `names-off` 2 of 138, `union-off` 11 of 138.
- **Calls to a tool:** 133 and 119 of 138 replies ended in one.
- **Replies that gave a file:** 4 and 19.
- **Server log: one loop stopped by the server in this step.** It is `names-off/G5/5`, logged at 21:08:25Z, the second its `record.json` was written. Its finish reason is `stop`. It wrote 5,674 output tokens and no file. Its reply ends in a few short lines over and over: "Let me write.", "I'll write the file.", "Creating.", "Done.". It is a failure, as a loop is.

By rule 5, nothing the rules say is acted on after step 1.

## Step 2, `low`

**The first group.** Sent from 21:41:56Z to 21:50:47Z: 23 kept, none cut off, none not run. `ladder.py first low` printed:

```
union-low, the try numbered 1 of each task: 23 tries
  output tokens: sum 70,250, mean 3,054, median 2,900; cut off 0; ended in a call to a tool 0; with reasoning text in the reply 23
  the kept run's union-27b: median 12,676 over 69 tries; a fifth either side of it is 10,141 to 15,211
  below it: the median is 0.23 of the kept run's. The setting is taken as honoured.
  the kept run's union-27b, with a reply counted as 60,000 at most: 16,345 output tokens a try
  the mean is 0.19 of that
  the rest of the step `low`: union-low 46, names-low 69, union-low-b 69 = 184 tries
    at this group's mean a try: about 562,000 output tokens
    with a bare arm's try taken as 1.37 of a notes arm's, as in the kept run: about 639,282
    the same tries at the top step, at the kept run's output a try: about 3,421,070
    at most, were every reply to reach its limit of 60,000: 11,040,000
```

- **The stops:** none of rule 10's three words was printed, so the setting is taken as honoured.
- **No reply ended in a call to a tool.**
- **What the rest was said to cost before it was sent:** about 640,000 output tokens, for 184 tries. At this group's rate, two requests at once wrote about 470,000 output tokens an hour, so the rest takes about an hour and a half.

**The rest.** Sent from 21:51:07Z to 23:06:47Z: 184 kept, none cut off, none not run, none did not fit.

**After the step.** The six commands under "After each step" were run once all 207 tries of the step were graded.
- **Server log:** no loop was stopped in this step.
- **Rule 5, in block 1 of `ladder.py rule`:** `union-low` against `union-low-b` reads "no difference as large as a quarter" (+0.07, from -0.03 to +0.20). So the rule does not tell the two rounds apart, and what it says below counts.
- **Rule 8:** under "Are the passes kept", `union-low` against `union-27b` reads "no difference as large as a quarter" (+0.01, from -0.10 to +0.13). So step 3 is not run.

## Step 3, `medium`: not run

By rule 8. Its tries stay set up and are not launched: 23 of `union-medium` and 69 of `names-medium`. `run.json` still gives `union-medium` one try a task. No try was sent after 23:06:47Z.

## Changes during the run

None. Every command was the note's, as written.
