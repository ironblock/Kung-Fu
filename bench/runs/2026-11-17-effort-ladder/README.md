# How little reasoning does the 27B need on the camera tasks?

Written on 2026-11-17, before any try, by Claude Fable 5.2. The session that owns this run fixed the design. An agent of the same model wrote it down and tried the tools. A fresh agent checked it. The owning session then read it, checked what could only be checked over the network, and changed three things. The last section lists every change.

## Where this run comes from, and what is still open

The design was fixed in a brief that the owning session gave to the agent that wrote this note. This note calls it the brief. The brief is not in the repository. Everything it fixed is written out here, and nothing here needs it to be read.

Two voices say "I" in this note. In this section, under "The owning session's" in "My guesses", and at the end of the last section, it is the owning session. Everywhere else it is the agent that wrote the note. That agent had no network and no server, and it says what it could not check.

A rule marked "the brief's" was in the design. A rule marked "added" was added by the writing agent for a case the design left open. I have read each added rule, and I keep them all. Three things are changed from the brief, by me, on 2026-11-17: rule 8, the sampling of `off`, and one request that is sent to the server before any try. The last section says why.

What the writing agent could not check, and I did, on 2026-11-17:

- **The chat template.** I read `chat_template.jinja` on three branches of `turboderp/Qwen3.8-27B-exl3` on Hugging Face: `SCP_3.00bpw` at `550c12cf`, `3.00bpw` at `6fe61ad6` and `SC_3.00bpw_H4` at `86b95530`. Each holds both phrases that rule 1 looks for. With thinking on, and no tools and no system message, the template writes a system message of one sentence. When nothing is sent it takes `xhigh`, and the sentence is "Reasoning effort is set to xhigh. Please think carefully through the task, validate key assumptions, consider plausible alternatives, and prioritize correctness, consistency, and clarity in the final answer." At `low` it is "Reasoning effort is set to low. Keep your thinking brief and focused, moving directly to the conclusion without unnecessary elaboration." At `medium` there is no sentence and no system message. With thinking off there is none either, and the template opens the reply with an empty block of reasoning. So every kept try of the 27B began with the `xhigh` sentence, if the server used this template.
- **The model card.** `Qwen/Qwen3.8-27B` gives two samplings: "Thinking Mode: `temperature=1.0`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=0.0`, `repetition_penalty=1.0`" and "Instruct (or non-thinking) mode: `temperature=0.7`, `top_p=0.80`, `top_k=20`, `min_p=0.0`, `presence_penalty=1.5`, `repetition_penalty=1.0`". The kept run used the first. `off` is run with the second.

Nobody has checked that this server hands `chat_template_kwargs` to the template. One request under "Before any try" asks it.

**Open before any try.** Nothing is sent until each of these is closed. `LAUNCH.md` says how each was closed, and when.

1. The maintainer has not said go.
2. Rule 1 has not been applied. Nobody has written down which build is loaded, or read the template the server uses.
3. The server has not been asked whether it hands `chat_template_kwargs` to the template.
4. No ceiling was ever run for these messages, and no fresh reader has read one. "What was checked before any try" says what stands in their place. Whether one is run first is the maintainer's to say.

## Why

The first run on a small model is `bench/runs/2026-11-16-small-screen`. This note calls it the kept run. It ran Qwen 3.8 27B, an EXL3 build served by TabbyAPI on the maintainer's machine, on 23 camera tasks, three tries each, in two arms. `names-27b` got the task and the bare type declarations. `union-27b` got the same and a merged list of 78 notes. They passed 30 and 51 of 69 tries. This note calls the model the 27B.

The kept run also ran a second model, Qwen 3.8 Flash Next, in two arms of its own, `names-flash` and `union-flash`. This run does not use them. This note names them only where it needs one of their tries.

Every one of the 27B's 138 requests carried `chat_template_kwargs: {"enable_thinking": true, "preserve_thinking": true}`, and nothing about reasoning effort. The brief says the model's chat template holds "reasoning_effort|default('xhigh')" and "Supported types are xhigh (default), medium, and low." It says where that was read, on 2026-11-17: the build on Hugging Face, `turboderp/Qwen3.8-27B-exl3`, branches `SCP_3.00bpw` and `3.00bpw`, files `chat_template.jinja` and `tokenizer_config.json`. If that is the template the server used, those tries ran at the highest of three settings, and nobody chose it. The brief gives no revision for either branch, and I have not read either file. Rule 1 has the template read on the server before any try.

Nearly all of the output was reasoning. Of the bytes the model wrote in the 138 tries, 98 in 100 are reasoning. A try wrote a median of 18,654 output tokens with the bare declarations and 12,676 with the notes. For each passed try the arms spent 53,434 and 23,290 output tokens.

The project's README says what a cost is: "The cost is what comes before the first correct answer. That is the output the model spends, its reasoning included, and the tries that failed."

**The question.** What is the lowest reasoning setting at which the 27B keeps the passes it had with the notes? And does the notes' gain over the bare declarations survive there?

## The top step, as the kept run left it

The kept run's 138 tries are the top step of the ladder. Nothing is run again at that setting. These counts are from each try's `grade.json` and `record.json`, by `ladder.py counts`.

| | `names-27b` | `union-27b` |
|---|---|---|
| Passed, of tries | 30 of 69 | 51 of 69 |
| Tasks where every try passed, of 23 | 5 | 13 |
| Tasks where no try passed | 9 | 3: A4, C3 and G1 |
| Output tokens, summed | 1,603,030 | 1,187,812 |
| Output tokens of a try, median | 18,654 | 12,676 |
| Output tokens for each passed try | 53,434 | 23,290 |
| Output up to and including the first passing try | 519,170, over 14 tasks | 503,331, over 20 tasks |
| Output on the tasks with no pass | 417,063 | 91,639 |
| Tries cut off, at 120,000 tokens | 1 | 1 |
| Replies over 60,000 tokens | 2, neither passed | 1, not passed |
| Replies that ended in a call to a tool | 0 | 3 |

The kept run let a reply have 120,000 tokens. This run lets it have 60,000. With each of the three long replies counted as 60,000, the sums are 1,541,383 and 1,127,812. A try then costs 22,339 and 16,345 on average, each passed try costs 51,379 and 22,114, and the output up to the first passing try is 519,170 and 443,331. `ladder.py counts` prints both forms.

By the kind of thing a task turns on, as the kept run counted it. Judges who knew no result gave each task its kind (`bench/runs/2026-11-15-camera-notes/coverage/judged.json`).

| Kind | Tasks | `names-27b` | `union-27b` |
|---|---|---|---|
| a step or a setting that silently does nothing | 9: A1 B1 B4 B6 F2 F5 G1 K1 P1 | 14 of 27 | 21 of 27 |
| a number, a formula, a sign, a default or a key binding | 8: A4 A5 B2 B3 C3 C4 F1 G2 | 4 of 24 | 15 of 24 |
| when or in what order a thing takes effect | 3: C5 G5 I1 | 5 of 9 | 8 of 9 |
| other | 3: A3 B5 G3 | 7 of 9 | 7 of 9 |

The rule that compares, asked of the two kept arms: `union-27b` is above `names-27b` by 0.30 (0.12 to 0.49), more on 14 tasks and less on 3. Its answer is "shown: the first passes more". The kept run asked no rule. I asked this one on 2026-11-17, after its tries, so that the ladder has a gain at the top to lose.

The 138 tries took 9.5 hours of generation, sent one at a time, at about 81 output tokens a second.

## What is run

The same model, on the same server, in the same build. `low` and `medium` have the sampling the kept run's `LAUNCH.md` gives. `off` has the model card's sampling for a reply with no thinking. Rule 1 says how that is checked, and what is done if it does not hold. The same request, the same two texts with the same sha256, the same 23 tasks. One thing is changed at each step: what `chat_template_kwargs` says about reasoning.

Four words, as this note uses them.

- **A try** is one message sent and one reply.
- **An arm** is what goes into the message beside the task. A `names` arm gets the bare declarations, 14,002 bytes. This note also calls it the bare arm. A `union` arm gets them and the merged notes, 15,260 bytes. This note also calls it the notes arm.
- **A box** is the directory that `box.py setup` makes for one try. The request names the box's path, because it was written for a subject that can open files. This subject cannot. The files follow in the same message.
- **The form of the message** is the line that stands over the files in it. `small.py` has two. Form 1 is "Here are the files in the app that matter:". The kept run had it. Form 2 is "You cannot open files or run anything from where you are, so here is each of those files, whole:". It is the tool's own choice since 2026-11-17. This run sends form 1, so that the message is the kept run's, and `--message-form 1` is on every command.

| Step | `chat_template_kwargs` | Arms | Tries a task | Tries |
|---|---|---|---|---|
| `off` | `{"enable_thinking": false}` | `names-off`, `union-off` | 6 | 276 |
| `low` | `{"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "low"}` | `names-low`, `union-low`, `union-low-b` | 3 | 207 |
| `medium` | `{"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "medium"}` | `names-medium`, `union-medium` | 3 | 138 |
| the top, kept | `{"enable_thinking": true, "preserve_thinking": true}` | `names-27b`, `union-27b` | 3 | 138, not run again |

`union-low-b` is `union-low` run a second time with nothing changed, so that the rule that compares can be tried on two rounds of one arm.

Every request of every step carries:

- at `low` and `medium`: `--temperature 1.0`, and in `--extra` the kept run's `top_p` 0.95, `top_k` 20, `min_p` 0.0, `presence_penalty` 0.0 and `repetition_penalty` 1.0;
- at `off`: `--temperature 0.7`, and in `--extra` `top_p` 0.8, `top_k` 20, `min_p` 0.0, `presence_penalty` 1.5 and `repetition_penalty` 1.0;
- `--max-tokens 60000` with `--context-limit 131072`;
- `--message-form 1`;
- `--label "Qwen 3.8 27B at 3.00 bits a weight"`, the kept run's label;
- `--timeout 10800`, the kept run's.

Four things differ from the kept run beside the setting. The brief chose the first two. The third came with the tool. The fourth is the owning session's.

- **A reply may have 60,000 tokens, not 120,000.** In the kept run no reply of the 27B over 60,000 tokens passed. There were three, and two of them ran to 120,000. The longest reply that passed had 57,516.
- **Two requests at once, not one.** The server has two slots by the kept run's `LAUNCH.md`. Tokens and grades do not depend on it. Seconds do. The kept run sent one at a time because two replies of 120,000 tokens did not fit in the server's cache of 163,840. Two tries of this run do: the largest message is about 8,923 tokens by the estimate, and twice 68,923 is 137,846. If the server has another number of slots now, `--parallel` is that number, and the launch record says so.
- **The launcher reads one kind of reply differently.** A file is given as a line `FILE: app/<path>` over a fenced block. Since the kept run, `small.py` also takes a `FILE:` line that stands as the first line inside its fence. The kept run's launcher wrote no file for such a reply, so the try failed. Now the file is written and graded. Rule 14 says how this is kept from tilting the comparison.
- **`off` has another sampling.** The model card gives one sampling for a reply with thinking and another for a reply without. `off` has the second: temperature 0.7, `top_p` 0.8 and `presence_penalty` 1.5. A setting is run as its makers give it. So a fall at `off` may come from the missing reasoning, from the sampling, or from both, and this run cannot part them.

## What the tools cannot do, and what stands in its place

- **`small.py launch` picks tries by arm and by task. It has no option for a try's number.** So it cannot send the first try of each task and hold the others back. `box.py setup` makes the tries that `run.json` asks for, and leaves alone each try that is already set up. So `run.json` gives the notes arm of each step one try a task at first: `union-off`, `union-low` and `union-medium` stand at `"tries": 1`. A launch of that arm then sends 23 tries, one of each task. When that first group has been read, the number is raised to 6, 3 and 3, setup is run again, and it makes the other tries. The rest of a step cannot be sent before someone raises the number. The brief asks for this first group at `low`. Its rule for a setting that was not honoured speaks of the first 23 tries of a step, so `off` and `medium` begin the same way. I tried this on a copy: 414 tries, then 115 more, then 46, then 46, which is 621 in all, and the tries already there were not touched.
- **`box.py compare` reads one run's directory.** The kept arms are in another. `ladder.py rule`, in this directory, asks the same rule of both. It calls `box.passes_rule`, the function `compare` calls, with the same seed, the same size and the same number of draws.
- **`box.py compare` leaves a try cut off out of its task, and has no option to count it as a failure.** The brief counts such a try as failed. So block 1 of `ladder.py rule` counts it as a failure of its task, and that block decides. Block 2 asks the rule as `box.py compare` asks it, and decides nothing. For the pairs the tool prints, it gives the tool's numbers. Rule 4 says why.
- **`box.py tally` does not print a median, the output for each passed try, or the output up to the first passing try.** `ladder.py counts` does, for this run's arms and for the two kept arms.
- **`box.py tally --strict` does not see a try cut off.** It passes while such a try has no `whose.txt`. `ladder.py sorted` reads every try that did not pass.
- **No tool has a rule for output tokens.** `ladder.py cost` is one. Rule 12 says what it is.
- **`box.py simulate` tries the rule at one size and on its own six cases.** `ladder.py made-up`, `made-up-kept`, `made-up-kinds` and `made-up-cost` try the rules at the sizes of this run and on the cases this run asks about.

`ladder.py` changes no file. It was written before any try and tried on made-up tries.

## The order

1. Before anything is sent: the open things above are closed, the server is asked its one question, the tasks are checked, the tries are set up, one message is looked at, and the launch record is begun.
2. `off`. The first group of `union-off`, 23 tries. Then the rest, 253 tries. It goes first because it is the cheapest. The brief says the server is already known to honour this switch. I have seen nothing that shows it: the kept run sent `true` in every request. So the first group checks it as well.
3. `low`. The first group of `union-low`, 23 tries. From them, whether the setting took effect, and what the rest will cost. Then the rest, 184 tries.
4. The rule is asked. `medium` is run unless `low` keeps the passes by it: rule 8. If it is not run, the note says so, and its tries stay set up and not launched.
5. `medium`, if it is run: the first group of `union-medium`, 23 tries, then the rest, 115 tries.
6. Every try is graded. The session that writes "What came" reads every answer and sorts every failure, as `AGENTS.md` asks. Then it writes "What came" into this note.

The sizes are fixed. No try is added before the rule has answered. A try that did not run is sent again by the same command. No kept try is sent again: `--again-cut-off` and `box.py forget` are not used.

## The commands

All are run at the repository's root, on the machine that has the server, by the session that launches. A launch says in its first line how many tries it sends. The numbers given below are for a run where every try was kept the first time it was sent. `bench/box.local.json` is the one the kept run used. `bench/SMALL-MODEL.md` says what it holds. The declarations text is not in the repository. Setup stops if its sha256 is not the one in `run.json`.

### Before any try

```sh
python3 bench/box.py check-tasks bench/sets/camera
```

Its last line must be `window: stub; all as they must be`.

```sh
python3 bench/box.py setup bench/runs/2026-11-17-effort-ladder
```

It must print `414 tries set up now; 414 set up in all`.

```sh
python3 bench/small.py prompt bench/runs/2026-11-17-effort-ladder --arm union-off --task F5 --n 1 --message-form 1
```

That is the largest message. It must hold the line `Here are the files in the app that matter:`. It names the box's path four times, so its size turns on how long that path is. With a path of 29 characters, as in the kept run, it is 31,232 bytes. That is about 8,923 tokens by the tool's estimate, the bytes divided by 3.5.

The template the server uses is read, for rule 1. It may be a file of the build, or a file of TabbyAPI's own that its configuration names in the build's place.

```sh
export KF_TEMPLATE=the-file-that-holds-the-template-the-server-uses
```

```sh
grep -c -F "reasoning_effort|default('xhigh')" "$KF_TEMPLATE"
```

```sh
grep -c -F "Supported types are xhigh (default), medium, and low." "$KF_TEMPLATE"
```

Each must print 1 or more. If one prints 0, the template is not the one the brief quotes, and by rule 1 no try is sent.

```sh
export KF_URL=the-base-url-of-the-27B-server
```

```sh
export KF_MODEL=the-name-the-server-knows-the-model-by
```

If the server asks for a key, add `--api-key-env` and the name of the variable that holds it to each launch.

The server is asked once whether it hands `chat_template_kwargs` to the template. The template stops with an error when `reasoning_effort` is not one of its three words. So a request that sends a fourth word fails if the server hands it on, and is answered if the server drops it. This is the owning session's, and it could not be tried here: there is no server.

```sh
curl -sS "$KF_URL/v1/chat/completions" -H "Content-Type: application/json" \
  -d '{"model": "'"$KF_MODEL"'", "messages": [{"role": "user", "content": "Say yes."}], "max_tokens": 20, "chat_template_kwargs": {"enable_thinking": true, "reasoning_effort": "none-such"}}'
```

If `KF_URL` already ends in `/v1`, leave the `/v1` out. If the server asks for a key, add `-H "Authorization: Bearer <the key>"`.

- The reply is an error that speaks of the reasoning effort: the server hands it on. Go on.
- The reply is an answer: the server drops it. No try is sent, and the maintainer is asked. The server may know this field by another name. If it does, that name stands in place of `chat_template_kwargs` in every `--extra` below, and `LAUNCH.md` says so.
- Anything else: no try is sent, and the maintainer is asked.

The session that launches writes `LAUNCH.md` in this directory before the first try, as the kept run did. It holds:

- how each of the open things was closed, and the time the maintainer said go;
- what the request that asks the server about `chat_template_kwargs` returned;
- **the build that is loaded: its repository, its branch and its revision,** and what shows that the kept run's tries were made on it. The kept run wrote "EXL3 at 3.00 bits a weight", and there are three builds at that figure;
- the template the server uses: which file, and what the two `grep` commands printed;
- the server: the TabbyAPI commit, the ExLlamaV3 version, the context and the cache it allows, its slots, its draft model, and whether each is what the kept run's `LAUNCH.md` gives;
- what each `ladder.py first` printed, and what was said about the cost of the rest before it was sent;
- every stop, with what the maintainer answered;
- every change, with its date and time.

### Step 1, `off`

The first group:

```sh
python3 bench/small.py launch bench/runs/2026-11-17-effort-ladder \
  --base-url "$KF_URL" --model "$KF_MODEL" \
  --arm union-off \
  --message-form 1 --temperature 0.7 --max-tokens 60000 --context-limit 131072 \
  --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
  --extra '{"top_p": 0.8, "top_k": 20, "min_p": 0.0, "presence_penalty": 1.5, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": false}}'
```

Its first line must begin `launching 23 tries`.

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py first off
```

It prints the group's output tokens beside the kept run's, what rule 10 makes of them, and what the rest of the step will cost. Stop if it says `WITHIN A FIFTH`, `ABOVE IT` or `THE MEAN IS NOT BELOW THE TOP'S`. Stop as well if it does not say `with reasoning text in the reply 0`: thinking was then not off. Rule 15 says what a stop is. Write what it printed into `LAUNCH.md`. Then raise the arm to its six tries and set them up:

```sh
python3 -c 'import json, sys; p = sys.argv[1]; c = json.load(open(p)); c["arms"][sys.argv[2]]["tries"] = int(sys.argv[3]); json.dump(c, open(p, "w"), indent=1)' bench/runs/2026-11-17-effort-ladder/run.json union-off 6
```

```sh
python3 bench/box.py setup bench/runs/2026-11-17-effort-ladder
```

It must print `115 tries set up now; 529 set up in all`. The rest:

```sh
python3 bench/small.py launch bench/runs/2026-11-17-effort-ladder \
  --base-url "$KF_URL" --model "$KF_MODEL" \
  --arm names-off --arm union-off \
  --message-form 1 --temperature 0.7 --max-tokens 60000 --context-limit 131072 \
  --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
  --extra '{"top_p": 0.8, "top_k": 20, "min_p": 0.0, "presence_penalty": 1.5, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": false}}'
```

Its first line must begin `launching 253 tries`. The launcher takes the arms in the order of their names.

### After each step: grade, count, and ask the rules

```sh
python3 bench/box.py grade bench/runs/2026-11-17-effort-ladder
```

```sh
python3 bench/box.py tally bench/runs/2026-11-17-effort-ladder
```

```sh
python3 bench/box.py compare bench/runs/2026-11-17-effort-ladder
```

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py rule
```

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py cost
```

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py counts
```

Nothing the rules say is acted on after step 1. Rule 5 says why.

### Step 2, `low`

The first group:

```sh
python3 bench/small.py launch bench/runs/2026-11-17-effort-ladder \
  --base-url "$KF_URL" --model "$KF_MODEL" \
  --arm union-low \
  --message-form 1 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
  --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
  --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "low"}}'
```

Its first line must begin `launching 23 tries`.

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py first low
```

Stop if it says `WITHIN A FIFTH`, `ABOVE IT` or `THE MEAN IS NOT BELOW THE TOP'S`. Write what it printed into `LAUNCH.md`, with the cost of the rest. Then:

```sh
python3 -c 'import json, sys; p = sys.argv[1]; c = json.load(open(p)); c["arms"][sys.argv[2]]["tries"] = int(sys.argv[3]); json.dump(c, open(p, "w"), indent=1)' bench/runs/2026-11-17-effort-ladder/run.json union-low 3
```

```sh
python3 bench/box.py setup bench/runs/2026-11-17-effort-ladder
```

It must print `46 tries set up now; 575 set up in all`. The rest:

```sh
python3 bench/small.py launch bench/runs/2026-11-17-effort-ladder \
  --base-url "$KF_URL" --model "$KF_MODEL" \
  --arm names-low --arm union-low --arm union-low-b \
  --message-form 1 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
  --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
  --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "low"}}'
```

Its first line must begin `launching 184 tries`.

### After step 2: is `medium` run

The six commands under "After each step" are run again. `ladder.py rule` prints three blocks. The first begins `== 1. THIS BLOCK DECIDES`. Nothing is decided from the other two. In the first block, read the line of `union-low` against `union-low-b` first, by rule 5. Then read the line of `union-low` against `union-27b` under "Are the passes kept". Step 3 is run if that line ends `shown: the first passes less` or `cannot tell`. It is not run if that line ends `no difference as large as a quarter` or `shown: the first passes more`.

### Step 3, `medium`, only if the rule says so

The first group:

```sh
python3 bench/small.py launch bench/runs/2026-11-17-effort-ladder \
  --base-url "$KF_URL" --model "$KF_MODEL" \
  --arm union-medium \
  --message-form 1 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
  --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
  --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "medium"}}'
```

Its first line must begin `launching 23 tries`.

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py first medium
```

Stop if it says `WITHIN A FIFTH`, `ABOVE IT` or `THE MEAN IS NOT BELOW THE TOP'S`. Write what it printed into `LAUNCH.md`, with the cost of the rest. Then:

```sh
python3 -c 'import json, sys; p = sys.argv[1]; c = json.load(open(p)); c["arms"][sys.argv[2]]["tries"] = int(sys.argv[3]); json.dump(c, open(p, "w"), indent=1)' bench/runs/2026-11-17-effort-ladder/run.json union-medium 3
```

```sh
python3 bench/box.py setup bench/runs/2026-11-17-effort-ladder
```

It must print `46 tries set up now; 621 set up in all`. The rest:

```sh
python3 bench/small.py launch bench/runs/2026-11-17-effort-ladder \
  --base-url "$KF_URL" --model "$KF_MODEL" \
  --arm names-medium --arm union-medium \
  --message-form 1 --temperature 1.0 --max-tokens 60000 --context-limit 131072 \
  --parallel 2 --timeout 10800 --label "Qwen 3.8 27B at 3.00 bits a weight" \
  --extra '{"top_p": 0.95, "top_k": 20, "min_p": 0.0, "presence_penalty": 0.0, "repetition_penalty": 1.0, "chat_template_kwargs": {"enable_thinking": true, "preserve_thinking": true, "reasoning_effort": "medium"}}'
```

Its first line must begin `launching 115 tries`. Then the six commands under "After each step" are run again.

### When every failure has been sorted

```sh
python3 bench/box.py tally bench/runs/2026-11-17-effort-ladder --strict
```

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py sorted
```

The second must end `every try that did not pass has one sort, and no passed try has any`. Rule 17 says why both are run.

### What the launching session sends back

It commits the run's directory on a branch of the maintainer's repository, as the kept run's launching session did, and tells the maintainer the branch's name. `bench/SMALL-MODEL.md` says what the directory holds under "What to send back". Here that is `run.json` as it then stands, `LAUNCH.md`, and the whole of `tries/`.

## The rules, fixed now

A rule marked "the brief's" was fixed by the brief. A rule marked "added" is mine, and the maintainer keeps or strikes it before the go.

1. **The kept tries are the top step only if the subject is the same.** Added. The brief says the model, the server and the build are the same, and gives no rule for when they are not. Before any try, `LAUNCH.md` says of each of these whether it is what the kept run had.
   - The build: its repository, its branch and its revision. The kept run did not write its build down. So this rests on the maintainer's word that the model's files on the server have not changed since the kept run's tries, or on the dates of those files.
   - The template the server uses. It holds both phrases the brief quotes.
   - The server's programs: the TabbyAPI commit, the ExLlamaV3 version and the draft model. The kept run's `LAUNCH.md` gives `be74bf0a`, 1.5.4 and a DFlash2 draft model.

   If each is the same, the kept 138 tries are the top step. If one is not the same, or nobody can say, no try is sent and the maintainer is asked. The run as written then has no top step. A round at the top setting on the server as it now stands would give it one: the two arms with the kept run's `chat_template_kwargs`, 138 tries, about 2.7 million output tokens if they cost what the kept tries cost. That round is not written down here. It is the maintainer's to ask for.

   The context, the cache and the slots may differ. They are written down. `--parallel` is the number of slots, and that many tries of 68,923 tokens must fit in the cache together.

2. **The size that matters is a quarter: 0.25.** The brief's. It is 0.25 in the share of tries passed, as a mean over the tasks. It is not a count of tries: a task with three tries has no quarter of them. It is the size of every run so far, and `run.json` holds it. The task is the unit, and a try is not.

3. **The rule that compares is the one `box.py compare` uses.** The brief's. It is the function `box.passes_rule`. For each task it takes the share of tries the first arm passed, less the share the second passed. It takes the mean of that over the tasks. Then it draws the 23 tasks again 10,000 times and takes the middle 95 in 100 of the means. That is the interval. It has four answers. The brief counts the first two as one, "a difference was shown".
   - "shown: the first passes more": the mean is 0.25 or more, and the interval does not reach nothing.
   - "shown: the first passes less": the mean is -0.25 or less, and the interval does not reach nothing.
   - "no difference as large as a quarter": the whole interval is within a quarter of nothing.
   - "cannot tell": anything else.

4. **A try cut off at 60,000 tokens is a failure of its task.** The counts are the brief's. The form of the rule is the nearest the tools allow. Such a try is not sent again. It is not passed in any count here, and its count stands beside the passes. In the rule that decides it is a failure of its task: block 1 of `ladder.py rule`. Four things say so.
   - The brief's own counts of the kept run, 30 and 51 of 69, count a try cut off as failed.
   - The maintainer ruled in the kept run that a reply that runs in a loop counts as a failure (its `LAUNCH.md`, 2026-11-17, 02:55Z).
   - The limit is 60,000 because no kept reply of the 27B over 60,000 tokens passed.
   - `box.py compare` leaves a try cut off out of its task. A step that is cut off often would then be judged on the few tries that are left. I tried it on a made-up fill of a copy. In `union-low`, try 1 of each task was the kept arm's and tries 2 and 3 were cut off: 47 of 69 cut off, 16 passed. With the tries cut off left out, the rule said of `union-low` against `union-27b`: -0.02 (-0.14 to +0.11), over 22 tasks, "no difference as large as a quarter". With each counted as a failure it said: -0.51 (-0.61 to -0.39), over 23 tasks, "shown: the first passes less".

   So no limit is set on how many tries may be cut off. None is needed: a step that is cut off often loses its passes by the rule. `box.py compare` is still run, and block 2 of `ladder.py rule` prints what it prints. It decides nothing. Where its answer differs from block 1's, the note says so.

5. **One arm twice comes first.** The brief's. If the rule answers "shown" for `union-low` against `union-low-b`, its interval is too narrow to set one round beside another. Then nothing it says in this run counts. `medium` is then not decided by it, and the maintainer is asked. No answer of the rule is acted on before this line has been read. The rule for output tokens, rule 12, is tried on the same two arms in the same way.

6. **Whether the notes' gain survives at a step** is the rule's answer for that step's `union` arm against its `names` arm. The first line is the brief's. The other three are added, because the rule has four answers.

   | The rule's answer | What is said of the step |
   |---|---|
   | "shown: the first passes more" | the gain survives |
   | "no difference as large as a quarter" | the gain is gone: no gain as large as a quarter is left |
   | "shown: the first passes less" | the gain is gone, and the notes arm passes less than the bare arm |
   | "cannot tell" | cannot tell: the gain is not said to survive, and is not said to be gone |

7. **Whether the passes are kept at a step** is the rule's answer for that step's `union` arm against the kept run's `union-27b`. The brief's. This table is the only test.

   | The rule's answer | What is said of the step |
   |---|---|
   | "no difference as large as a quarter", or "shown: the first passes more" | the passes are kept |
   | "shown: the first passes less" | the passes are lost |
   | "cannot tell" | cannot tell: the passes are not said to be kept, and are not said to be lost |

   The brief's sentence is that the passes are kept when the arm is "not below the kept run's union-27b by a quarter or more", and that the rule has three answers. Read by the measured mean alone, that sentence would call a mean of -0.17 kept. This note does not read it so. A mean alone is a direction, and `AGENTS.md` asks for three answers. So the interval is asked too, and a mean of -0.17 with an interval that reaches -0.25 is "cannot tell".

   "The passes are kept" does not say that nothing was lost. It says that no loss as large as a quarter is there. The notes' gain at the top is 0.30. A step can lose half of that and be called kept. The second table under "The rules, tried on made-up subjects" shows how often. Rule 6 is asked at the same step, and it is the check on that: a notes arm that lost half its gain, beside a bare arm that lost nothing, is not far enough above it for "the gain survives".

8. **`medium` is run unless `low` keeps the passes.** Changed from the brief by the owning session. It is run when the answer for `union-low` against `union-27b` is "shown: the first passes less" or "cannot tell". It is not run when that answer is "no difference as large as a quarter" or "shown: the first passes more", and the note says so. The brief ran it only on "shown: the first passes less". A "cannot tell" at `low` then left the run with no setting and nothing more to send, and the second table under "The rules, tried on made-up subjects" shows that a loss of 0.13 to 0.22 ends at "cannot tell" nearly every time.

9. **The working setting for later runs** is the lowest step whose passes are kept: `off` before `low` before `medium`. If none is, it stays at the top. The brief's, and it reads passes alone. Two things are said beside the name. They are added.
   - What the step spends, by rule 12. If rule 12 does not say "shown: the first spends less", the setting is named with the words "and no saving was shown". The maintainer then says whether later runs use it.
   - Each kind of task, by rule 13.

10. **A setting the server did not honour.** The first stop is the brief's. The other two are added. A step's first group is the try numbered 1 of each task of its `union` arm, 23 tries. `ladder.py first` reads their output tokens and prints which of these holds.
    - `WITHIN A FIFTH`. The group's median is set beside the kept run's median for `union-27b`, 12,676. If it is within a fifth of that, from 10,141 to 15,211, the server is taken as not honouring the setting. Stop, and say so.
    - `ABOVE IT`. The median is above 15,211. A lower setting is not for that. Stop, and say so.
    - `THE MEAN IS NOT BELOW THE TOP'S`. The group's mean is 16,345 or more, the kept notes arm's output a try. The rest would then cost what the top step cost. Stop, and say so. A median can be low while a few long replies hold most of the tokens.

    For `off` there is a fourth: a reply that holds reasoning text. Thinking was then not off. Stop, and say so.

    A first group can pass these and the setting can still have changed nothing. The made-up server below passes them 4 times in 100. So when a step is complete, rule 12 is asked over all its tries. If it answers "no difference as large as a fifth" or "shown: the first spends more" for the step's notes arm, the note says that the setting may not have been honoured, whatever the first group said.

11. **The cost of the rest is said before it is sent.** The brief's. `ladder.py first` gives the first group's mean a try, times the tries the step still has. It gives the same with a bare arm's try counted as 1.37 of a notes arm's, as in the kept run. And it gives what the same tries cost at the top step. The session that launches writes all three into `LAUNCH.md` before the rest is sent. The third stop of rule 10 is the figure that holds the rest back. A guess for `medium` cannot be made from tries of `low`.

12. **What a step spends.** Added. The run asks how little reasoning is enough, and the brief names no rule for what is spent. So "its tries cost less" had nothing to decide it, and a step that keeps the passes and spends as much as the top was not covered.

    For each task, an arm's output a try is the output tokens of its tries, summed, over their number. A try cut off counts with what it wrote. A kept reply of more than 60,000 tokens counts as 60,000, this run's limit. The share is the first arm's output a try, summed over the tasks, over the second's. The 23 tasks are drawn again 10,000 times, and the middle 95 in 100 of the shares is the interval. The size that matters is a fifth, the size of rule 10. It has four answers.
    - "shown: the first spends less": the share is 0.8 or less, and the interval stays below 1.
    - "shown: the first spends more": the share is 1.2 or more, and the interval stays above 1.
    - "no difference as large as a fifth": the whole interval is between 0.8 and 1.2.
    - "cannot tell": anything else.

    `ladder.py cost` asks it for `union-low` against `union-low-b` first. If it answers "shown" there, nothing it says in this run counts. Then it asks it for each step's notes arm against `union-27b`, for each bare arm against `names-27b`, and for each step's notes arm against its bare arm.

    What it decides is words, and one question to the maintainer. "Its tries cost that much less" is said of a step only when the answer for its notes arm against `union-27b` is "shown: the first spends less". The share and its interval are then given. On any other answer the note says "no saving was shown", and rule 9 says what follows. It changes no step and names no setting.

    The measure is the output of a try, because the brief's words are "its tries cost that much less". The output for each passed try is printed beside it. Where the passes are kept, the two move together.

13. **Each kind of task.** Added. `AGENTS.md` asks for a rule for each thing the tasks test, and not only for their sum. The four kinds are in the table under "The top step". For each of the two kinds that have eight tasks or more, block 1 of `ladder.py rule` asks the rule on that kind's tasks alone: each step's notes arm against the kept notes arm, and against its bare arm. For the two kinds of three tasks it gives the passes and asks no rule. Three tasks drawn again say nothing.

    What it changes: nothing in rules 8 and 9, which are asked over the 23 tasks. Where rule 7 says the passes are kept, and the rule on a kind says "shown: the first passes less" for the same two arms, the setting is named with the words "and it loses the tasks of that kind". The maintainer then says whether later runs use it. Any other answer on a kind is reported and changes nothing.

14. **A file taken from inside its fence.** Added. `record.json` counts such a reply under "file lines inside their fence". Each arm's count of such tries is reported, and how many of them passed. Block 1 of `ladder.py rule` takes such a file as the tool now takes it. That is like for like. I read the 138 kept replies of the 27B again with today's launcher. They give the same files, but for one: `union-27b/F2/3`, which had no file and now has one. The kept run's README says that file fails two of its check's five cases. So the kept arms count the same either way: 30 and 51 of 69. If a passed try of this run is such a try, block 3 asks the rule again with it counted as failed, and the note says where an answer differs. Block 1 decides.

15. **A stop ends the sending.** Added. The brief says "stop, and say so". It does not say what is stopped, or who is told. Here: nothing more is sent, of that step or of a later one, until the maintainer has read what was printed and has said what is done next. What was printed, his answer and the time go into `LAUNCH.md`. This holds at `off` too. After a stop at step 1, step 2 is not begun on this note's word: a server that ignores one switch may ignore the other.

16. **What is reported for each arm,** by `ladder.py counts`, `ladder.py cost` and `box.py tally`. The brief's. Seconds are written down and decide nothing.
    - Each task's passes, first. Then the passes by the kind of task.
    - Passes of tries.
    - Tasks where every try passed.
    - Output tokens: the sum, the median of a try, the mean of a try, and the sum for each passed try.
    - The output up to and including the first passing try. For each task that has a passing try, it is the output of its tries up to that one, by the tries' numbers. These are summed over those tasks.
    - The output on the tasks that have no passing try.
    - Tries cut off.
    - Replies that ended in a call to a tool.
    - Replies whose file was taken from inside its fence.
    - Every failure, sorted in `whose.txt`.

17. **Every failure is sorted,** by the rule under "How a failure is sorted". The brief's. A try cut off is a failure, and is sorted too. `box.py tally --strict` must pass, and `ladder.py sorted` must pass, before "What came" is written. Both are needed. The first does not see a try cut off: I gave it a made-up fill where 59 tries cut off had no `whose.txt`, and it passed. The second sees them. It also stops while a kept try is not graded.

## The rules, tried on made-up subjects

### The rule that compares, with both arms made up

Each made-up try passes by chance at a rate that is chosen. The first arm is the one that is tested. The sizes are this run's: 23 tasks, and 3 tries against 3, 6 against 3, and 6 against 6. Each cell is 1,000 made-up runs, with 1,000 draws of the tasks in each where `compare` makes 10,000, as `box.py simulate` does. Each cell gives how often the rule said: the first passes less / cannot tell / no difference as large as a quarter. After a `+` it gives how often the rule said the first passes more.

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py made-up
```

| Made-up subjects | 3 tries against 3 | 6 tries against 3 | 6 tries against 6 |
|---|---|---|---|
| the same: both pass every task 9 times in 10 | 0% / 1% / 99% | 0% / 0% / 100% | 0% / 0% / 100% |
| the same: both 0.75 | 0% / 13% / 87% | 0% / 5% / 95% | 0% / 0% / 100% |
| the same: both one half | 0% / 29% / 71% | 0% / 14% / 86% | 0% / 3% / 97% |
| the same: both have the kept notes arm's share on each task | 0% / 0% / 100% | 0% / 0% / 100% | 0% / 0% / 100% |
| a quarter lower on every task: 0.65 against 0.9 | 48% / 48% / 4% | 52% / 44% / 4% | 50% / 46% / 4% |
| a quarter lower on every task: 0.5 against 0.75 | 46% / 52% / 3% | 53% / 44% / 4% | 50% / 47% / 3% |
| a quarter lower on every task: 0.25 against 0.5 | 50% / 47% / 3% | 49% / 48% / 4% | 51% / 46% / 3% |
| 0.4 lower on every task: 0.5 against 0.9 | 98% / 2% / 0% | 99% / 1% / 0% | 100% / 0% / 0% |
| 0.4 lower on every task: 0.35 against 0.75 | 97% / 3% / 0% | 98% / 2% / 0% | 100% / 0% / 0% |
| 0.4 lower on every task: 0.1 against 0.5 | 98% / 2% / 0% | 98% / 2% / 0% | 100% / 0% / 0% |
| the kept notes arm's shares, and the first never passes 6 of its 13 sure tasks (0.26 lower in all) | 57% / 43% / 0% | 61% / 39% / 0% | 65% / 35% / 0% |
| the kept notes arm's shares, and the first never passes 9 of its 13 sure tasks (0.39 lower in all) | 100% / 0% / 0% | 100% / 0% / 0% | 100% / 0% / 0% |
| the gain as the kept run had it: the kept notes arm's shares against the kept bare arm's (0.30 higher in all) | 0% / 13% / 0% + 87% | 0% / 10% / 0% + 90% | 0% / 6% / 0% + 94% |

A cell can sum to 99 or 101, because each share is rounded. A sure task is one where the kept notes arm passed every try.

- **Two arms that are the same.** The rule never says "shown". It says "no difference as large as a quarter" 71 to 100 times in 100, and "cannot tell" the other times.
- **A loss of 0.4.** It shows it 97 to 100 times in 100.
- **A loss of a quarter.** It shows it about one time in two, 46 to 53 in 100. It says "cannot tell" nearly all the other times.
- **The gain, if a lower step keeps it whole.** The rule shows a gain of the kept run's size 87 to 94 times in 100. The other times it says "cannot tell".

### A made-up notes arm against the kept notes arm: a loss smaller than a quarter

Rule 7 sets a step's notes arm beside the kept notes arm. The kept arm is not run again. So here it stands as it was graded, 51 of 69, and only the tested arm is made up. This table tries the losses the first table leaves out.

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py made-up-kept
```

Each cell: the first passes less / cannot tell / no difference as large as a quarter. By rule 7 those are: lost / cannot tell / kept.

| Made-up notes arm | 3 tries a task | 6 tries a task |
|---|---|---|
| the kept notes arm's own shares: no loss | 0% / 0% / 100% | 0% / 0% / 100% |
| never passes 1 of its 13 sure tasks: 0.04 lower, 14 in 100 of the notes' gain | 0% / 0% / 100% | 0% / 0% / 100% |
| never passes 2 of its 13 sure tasks: 0.09 lower, 29 in 100 of the notes' gain | 0% / 21% / 79% | 0% / 9% / 91% |
| never passes 3 of its 13 sure tasks: 0.13 lower, 43 in 100 of the notes' gain | 0% / 90% / 10% | 0% / 96% / 4% |
| never passes 4 of its 13 sure tasks: 0.17 lower, 57 in 100 of the notes' gain | 1% / 99% / 0% | 0% / 100% / 0% |
| never passes 5 of its 13 sure tasks: 0.22 lower, 71 in 100 of the notes' gain | 12% / 88% / 0% | 7% / 93% / 0% |
| never passes 6 of its 13 sure tasks: 0.26 lower, 86 in 100 of the notes' gain | 58% / 42% / 0% | 67% / 33% / 0% |
| every task's share times 0.9: 0.07 lower, 24 in 100 of the gain | 0% / 3% / 97% | 0% / 0% / 100% |
| every task's share times 0.8: 0.15 lower, 49 in 100 of the gain | 2% / 44% / 54% | 0% / 21% / 79% |
| every task's share times 0.75: 0.18 lower, 61 in 100 of the gain | 10% / 60% / 30% | 3% / 58% / 40% |
| every task's share times 0.67: 0.24 lower, 80 in 100 of the gain | 44% / 53% / 4% | 43% / 54% / 2% |
| halfway between the kept notes arm and the kept bare arm: 0.15 lower | 2% / 67% / 31% | 0% / 65% / 35% |
| the kept bare arm's shares: 0.30 lower, the whole gain | 93% / 7% / 0% | 98% / 2% / 0% |

What the run can say of a step's passes, and what it cannot:

- **No loss, or a loss under 0.1.** "Kept", 79 to 100 times in 100.
- **The whole gain lost, 0.30.** "Lost", 93 to 98 times in 100.
- **Whole tasks lost, 0.13 to 0.22 in all.** "Cannot tell", 88 to 100 times in 100. By rule 8 `medium` is then run, and by rule 9 the working setting is read from the steps whose passes are kept.
- **A loss of 0.15 spread over every task.** That is half of the notes' gain. "Kept", 54 times in 100 with three tries and 79 with six.
- **A loss of a quarter.** "Lost" about one time in two.

So for a true loss between about 0.13 and a quarter the run has no answer about that step, or the wrong one. `AGENTS.md` says: "If it cannot tell a difference you care about from none, the run is too small." For a loss of 0.3 or more this run is large enough. For a quarter it is at the edge. For less it is too small, and the brief says so in its own words: three tries a task cannot place a difference smaller than a quarter. Six tries do no better. The interval comes from the spread between the 23 tasks, and more tries a task do not narrow that. More tasks would. I did not change the sizes: the brief fixed them. The owning session changed rule 8 after it read this table, so that a "cannot tell" at `low` sends the run on to `medium`.

### The rule on one kind of task

For rule 13. As in the table above, the kept notes arm stands as it was graded, but for the two lines that say "both drawn".

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py made-up-kinds
```

A step or a setting that silently does nothing: 9 tasks. The kept notes arm passed 21 of 27 on them.

| Made-up arms | 3 tries a task | 6 tries a task |
|---|---|---|
| a notes arm with the kept notes arm's own shares, against the kept notes arm | 0% / 2% / 98% | 0% / 0% / 100% |
| a notes arm with every share times 0.67 (0.26 lower), against the kept notes arm | 58% / 39% / 4% | 54% / 42% / 3% |
| a notes arm with every share times 0.5 (0.39 lower), against the kept notes arm | 96% / 4% / 0% | 99% / 1% / 0% |
| a notes arm with every share times 0.25 (0.58 lower), against the kept notes arm | 100% / 0% / 0% | 100% / 0% / 0% |
| a notes arm that never passes, against the kept notes arm | 100% / 0% / 0% | 100% / 0% / 0% |
| both drawn: the kept notes arm's shares against the kept bare arm's (0.26 higher) | 0% / 70% / 0% + 30% | 0% / 74% / 0% + 26% |
| both drawn: the kept bare arm's shares in both | 0% / 49% / 50% + 1% | 0% / 13% / 87% |

A number, a formula, a sign, a default or a key binding: 8 tasks. The kept notes arm passed 15 of 24 on them.

| Made-up arms | 3 tries a task | 6 tries a task |
|---|---|---|
| a notes arm with the kept notes arm's own shares, against the kept notes arm | 0% / 7% / 93% | 0% / 0% / 100% |
| a notes arm with every share times 0.67 (0.21 lower), against the kept notes arm | 39% / 54% / 8% | 27% / 65% / 8% |
| a notes arm with every share times 0.5 (0.31 lower), against the kept notes arm | 82% / 17% / 0% | 91% / 9% / 0% |
| a notes arm with every share times 0.25 (0.47 lower), against the kept notes arm | 100% / 0% / 0% | 100% / 0% / 0% |
| a notes arm that never passes, against the kept notes arm | 100% / 0% / 0% | 100% / 0% / 0% |
| both drawn: the kept notes arm's shares against the kept bare arm's (0.46 higher) | 0% / 14% / 0% + 86% | 0% / 6% / 0% + 94% |
| both drawn: the kept bare arm's shares in both | 0% / 21% / 79% | 0% / 3% / 97% |

- **A loss on one kind.** The rule shows a loss of 0.39 or more on a kind 96 to 100 times in 100, and a loss of 0.31 on the smaller kind 82 to 91 times. A loss near a quarter it shows 27 to 58 times in 100.
- **No loss on a kind.** It never says "the first passes less".
- **The gain on one kind.** On the kind of 8 tasks the kept gain is 0.46, and the rule shows it 86 to 94 times in 100. On the kind of 9 tasks the kept gain is 0.26, and the rule shows it 26 to 30 times in 100. The kept arms themselves give "cannot tell" there: +0.26 (-0.04 to +0.52). So "cannot tell" for the gain on that kind is what to expect at every step, and it says nothing against the notes.
- **Two bare arms that are the same, on the kind of 9 tasks, with three tries.** The rule said "the first passes more" once in 100 made-up runs. That is the one place in these tables where two arms that are the same were told apart.

### The rule for output tokens

For rule 12. A made-up try of a task writes what one of the kept notes arm's three tries of that task wrote, picked by chance, times a share that is chosen. In the first two columns the second arm is the kept notes arm as it stands. In the third both arms are made up, as for an arm run twice. Each cell: the first spends less / cannot tell / no difference as large as a fifth. After a `+`, how often the rule said the first spends more.

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py made-up-cost
```

| A made-up arm that writes | 3 tries a task, against the kept notes arm | 6 tries a task, against the kept notes arm | 3 tries a task, against a made-up arm that writes what the kept arm wrote |
|---|---|---|---|
| the kept arm's own output | 0% / 6% / 94% | 0% / 0% / 100% | 0% / 31% / 69% |
| 0.9 of it | 0% / 32% / 68% | 0% / 10% / 90% | 4% / 50% / 47% |
| 0.8 of it | 53% / 43% / 4% | 48% / 47% / 5% | 50% / 46% / 4% |
| 0.65 of it | 100% / 0% / 0% | 100% / 0% / 0% | 100% / 0% / 0% |
| one half of it | 100% / 0% / 0% | 100% / 0% / 0% | 100% / 0% / 0% |
| a quarter of it | 100% / 0% / 0% | 100% / 0% / 0% | 100% / 0% / 0% |
| a twentieth of it | 100% / 0% / 0% | 100% / 0% / 0% | 100% / 0% / 0% |
| 1.3 times it | 0% / 10% / 0% + 90% | 0% / 3% / 0% + 97% | 0% / 17% / 0% + 83% |
| 0.75 of it in the try numbered 1 of each task, and 1.3 times it in the others | 0% / 50% / 48% + 2% | 0% / 62% / 4% + 34% | 0% / 64% / 28% + 8% |

- **A step that writes what the top wrote.** The rule never says it spends less. Set against the kept notes arm, it says "no difference as large as a fifth" 94 to 100 times in 100. This is also what a server that ignored the setting looks like over a whole step.
- **A saving of a third or more.** Shown every time.
- **A saving of just a fifth.** Shown about one time in two.
- **Two rounds of one arm.** Never told apart.
- **The last line** is a step that looks cheap in its first group and is dear after it. In the fill of that kind that I tried, the first group passed rule 10: its median was 0.62 of the top's. The rule never says such a step spends less.

A made-up try here can only write what one of three kept tries wrote. A real second round varies more. The kept notes arm's own three rounds, the tries numbered 1, 2 and 3, wrote 15,941, 16,287 and 16,807 tokens a try. They are within 3 in 100 of their mean, while their medians run from 10,466 to 13,342. So the sum over 23 tasks is the steadier measure, and that is why rule 12 reads it.

### The tool's own table

`box.py simulate` on this run's `run.json` tries its own cases at 23 tasks and six tries in each arm, with 400 made-up runs a line:

```sh
python3 bench/box.py simulate bench/runs/2026-11-17-effort-ladder
```

| Made-up subjects | shown | cannot tell | no difference as large as a quarter |
|---|---|---|---|
| both pass every task 9 times in 10 | 0% | 0% | 100% |
| both pass every task half the time | 0% | 2% | 98% |
| first 0.9, second 0.6, on every task | 86% | 14% | 0% |
| first 0.9, second 0.4, on every task | 100% | 0% | 0% |
| first 1.0 and second 0.0 on 7 tasks, both 0.9 on the rest | 98% | 2% | 0% |
| first 1.0 and second 0.0 on one task, both 0.9 on the rest | 0% | 0% | 100% |

### The rule for a setting that was not honoured, tried on a made-up server

For rule 10. A server that ignores the setting gives tries like the kept run's own. Its first group is then one kept try of each task.

```sh
python3 bench/runs/2026-11-17-effort-ladder/ladder.py ignored
```

- The kept run's own tries numbered 1, 2 and 3 of `union-27b`, one of each task, have medians of 10,466, 12,984 and 13,342 output tokens. All three are within a fifth of 12,676. The first is so by 325 tokens.
- One kept try of each task, drawn 20,000 times: the median was within a fifth 90 times in 100, below it 4 times, above it 6 times. The mean was not below the kept arm's 50 times in 100. One of the three stops caught the group 96 times in 100.

So rule 10 takes a server that ignores the setting for one that honoured it about 4 times in 100. The third stop does not lower that. Rule 12 is the second check: over a whole step it says "no difference as large as a fifth" of such a server 94 to 100 times in 100.

The rule can also be wrong the other way. A setting that took effect, and still left the median at four fifths of the top's or more, is taken as ignored. Nothing here says how far `low` or `medium` lowers the output, and `medium` may well lower it by less than a fifth. Then the step stops, and the maintainer decides.

The first group must be one try of each task for this rule to work. For an arm of six tries a task, the first 23 tries in the launcher's own order are the tries of the first four tasks, and twelve of them are tries of A1 and A3. Every kept try of those two tasks in `union-27b` wrote more than 34,000 output tokens. So such a group from a server that ignores the setting has a median above the fifth, and never within it.

## How a failure is sorted

As the kept run's readers sorted them, and in the words of `bench/runs/2026-11-15-camera-union`: by whether the text the try was given states what the task turns on. For a `names` arm the text is the bare declarations. For a `union` arm it is the declarations and the 78 notes.

- **The text's.** Nothing in the try's text states what the task turns on. Or a note states it wrongly or too widely, and the answer follows the note.
- **The subject's.** The text states it, and the answer goes against it or leaves it out. Or the reply gives no answer, and nothing in the request sent it that way: it stops with no file, or it runs in a loop to its limit.
- **The test's.** The check fails on something the ask does not say. Or the request's own words sent the reply the wrong way. Or the try broke for a reason outside the subject.
- **Not known.** The answer, the text and the check's output do not settle it.

The first line of a try's `whose.txt` begins with one of those four names and a colon. A try cut off is sorted like any other try that did not pass.

Tried on made-up failures of the kinds this run may give:

| Made-up failure | Sorted as |
|---|---|
| `names-off`, B2: the answer doubles `angularSensibility` to turn faster. The declarations give its name and its type, and not what it means. | the text's |
| `union-off`, G1: the answer assigns a new limits object, which the camera ignores. Note 37 says a change to the limits applies at the next write, and the answer goes by it. | the text's |
| `union-off`, C4: note 56 says both angles take the shortest arc. The answer makes one call with the whole turn. | the subject's |
| `union-low`, B6: the reply is one sentence, "I'll read the two files first", and ends in a call to a tool. The request says "Read them first". | the test's |
| `names-low`, A3: the reply repeats one sentence to 60,000 tokens and gives no file. It is cut off. | the subject's, by the maintainer's ruling of 2026-11-17 in the kept run's `LAUNCH.md` that a loop counts as a failure |
| `union-low`, B5: the reply reaches 60,000 tokens, its reasoning does not repeat, and it had begun its file. | not known. The kept run had one try of that kind, by its second model, `names-flash/G1/2`, and sorted it so. |
| `union-off`, F1: the reply holds two sentences about the task and no file. Its finish reason is `stop`. | the subject's |
| `union-off`, A5: the check fails, and reading the answer does not show which of the ask's sentences it breaks. | not known |

With thinking off there is no reasoning to read. A failure of `off` is sorted from its answer, its text and the check's output alone, and the note says so.

The sorts bear on one outcome below, "Both fall together". Its reading is that reasoning is needed to apply a note. If that is so, the notes arm fails more often with the note in hand: more of its failures are the subject's. No try of this run is paired with a kept try, so no failure can be called new. What can be set side by side is the count of each sort. The kept `union-27b` had 18 failures: 10 the text's, 4 the subject's, 4 the test's. The note gives the same four counts for the step's notes arm, as shares of its tries, and says which rose. No size is fixed for this, and no rule is asked. It is a description, and it is not a finding. If the rise is in the text's count and not in the subject's, the sorts do not support that reading, and the note says so.

## My guesses

Two sets, so that each of us can be wrong in writing.

### The writing agent's

Written on 2026-11-17 before any try, by the agent that wrote this note, before rule 8 and the sampling of `off` were changed. It says: I have little ground for them.

1. **`off` is honoured.** No reply of its first group holds reasoning text, and the group's median is under 2,000 output tokens.
2. **`off` loses some passes, and less than a quarter.** `union-off` passes 70 to 100 of 138, where the top's share would give 102. `names-off` passes 35 to 60, where the top's share would give 60. The rule's answer for `union-off` against `union-27b` is "cannot tell". My second guess is "no difference as large as a quarter".
3. **The gain survives at `off`.** "shown: the first passes more".
4. **`low` is honoured.** Its first group's median is between 2,000 and 8,000 output tokens.
5. **`low` keeps the passes.** `union-low` passes 45 to 54 of 69, and the rule says "no difference as large as a quarter". So `medium` is not run. `names-low` passes 24 to 34.
6. **Both steps spend less.** `ladder.py cost` says "shown: the first spends less" for `union-off` and for `union-low` against `union-27b`.
7. **More replies are only a call to a tool with thinking off.** 4 to 15 of the 138 tries of `union-off`, where the top had 3 of 69.
8. **Fewer tries are cut off than at the top.** None at `off`, and at most 2 in any arm of `low`.
9. **The working setting comes out as `low`,** with `off` at "cannot tell".

### The owning session's

Written on 2026-11-17 before any try, after I had read the guesses above. So mine are not independent of them. I have little ground for them either.

1. **`off` is honoured.** No reply holds reasoning text, and the first group's median is under 1,500 output tokens.
2. **`off` loses more than the agent guesses.** `union-off` passes 55 to 90 of 138, and `names-off` 25 to 50. The rule's answer for `union-off` against `union-27b` is "cannot tell" or "shown: the first passes less", and I hold the two about equal. I do not expect "no difference as large as a quarter".
3. **The gain survives at `off`, at about the size it had at the top:** 0.2 to 0.35. I give one chance in four that it is larger there, which is the outcome "the bare arm falls and the notes arm holds".
4. **More replies of `off` are only a call to a tool:** 10 to 30 of the 138 tries of `union-off`.
5. **`low` is honoured and keeps the passes.** Its first group's median is 3,000 to 9,000 output tokens. `union-low` passes 44 to 54 of 69. `medium` is not run.
6. **The working setting comes out as `low`.**
7. **What would surprise me most:** `off` keeping the passes. The notes would then hold nearly all that these tasks need, and the reasoning would have been spent for nothing.

## What each outcome would change

Three answers are read for a step. `ladder.py rule` prints each in block 1.

- **The notes arm**, against the kept `union-27b`, under "Are the passes kept". It holds when the passes are kept, as rule 7 has it. It falls when they are lost.
- **The bare arm**, against the kept `names-27b`, under "The bare arm against the kept run's". It holds and falls by the same table.
- **The gain** at that step, the notes arm against the bare arm, as rule 6 has it: it survives, or it is gone.

The first four outcomes are the brief's, and what each changes is the brief's. The test for each is how I read the brief's words. The last two are added: the brief's four leave them out.

| The outcome | Its test | What it changes |
|---|---|---|
| **The passes are kept at a lower step.** | The notes arm holds at `off`, `low` or `medium`. | Every later run on this model uses the lowest such setting. More tries a task become affordable. "Its tries cost that much less" is said only when rule 12 shows it. |
| **With thinking off the bare arm falls and the notes arm holds.** | At `off`: the bare arm falls, and the notes arm holds. | The notes stand in for reasoning. That is the strongest form of what this project asks. |
| **Both fall together.** | At a step: the bare arm falls, the notes arm falls, and the gain survives. | Reasoning is needed to apply a note as much as to do without one. The cost of a correct answer is then the model's, and not the text's. |
| **The notes arm falls to the bare arm.** | At a step: the notes arm falls, and the gain is gone. | The notes only help a reader that reasons at length. The text's form is then the next thing to change: recipes, or fewer notes. |
| **The rule cannot tell whether `low` keeps the passes.** Added. | At `low`: "cannot tell" for the notes arm. | `medium` is run, by rule 8. The working setting is the lowest step whose passes are kept, by rule 9. If `medium` is at "cannot tell" as well, it stays at the top, and the run has not answered its question. More tasks could. That is a new run, and the maintainer's to ask for. |
| **A step keeps the passes and no saving is shown.** Added. | The notes arm holds, and rule 12 does not say "shown: the first spends less". | Rule 9 names the setting with the words "and no saving was shown". The maintainer says whether later runs use it. |

Any other set of answers is reported as the three answers, and is given no name. Two of them are likely enough to say now. The notes arm falls, the bare arm falls, and the rule cannot tell whether the gain survives: that lies between "Both fall together" and "The notes arm falls to the bare arm", and the note says so. The notes arm is at "cannot tell" at `off`: nothing is said of `off`, and the working setting is read from `low`.

## What it does not cover

- **Another model, another library, tasks larger than one small file, or a subject that can run code.**
- **A difference smaller than a quarter.** Three tries a task cannot place one. A loss of just a quarter is shown one time in two. For a loss between about 0.13 and a quarter the run mostly ends at "cannot tell", as the second table shows.
- **One round.** Each arm is run once, but for `union-low`. One round is data, and not a finding.
- **A kind of three tasks.** Rule 13 asks the rule on the two larger kinds. On the two kinds of three tasks a setting may hold or fail, and only the passes say which.
- **Three tasks where the top has nothing to lose.** The kept notes arm passed no try of A4, C3 and G1. No step can pass fewer there.
- **Message form 1.** The request says "Read them first", and three replies of the kept `union-27b` were only a call to a tool. The form is kept so that the setting is the one thing changed. A setting that does better or worse in this form may not do so in form 2. Each arm's count of such replies is reported.
- **Two samplings, each the model card's.** `low` and `medium` use the kept run's, which the card gives for a reply with thinking. `off` uses the one the card gives for a reply without. So `off` differs from the top in two things at once.
- **The model as its makers published it.** The subject is an EXL3 build, a smaller copy of that model at 3.00 bits a weight. No try was run on the model it was built from, here or in the kept run.
- **The cost in anything but output tokens and tries.**

## What is not known

- **Which of the three builds at 3.00 bits a weight the kept run used.** Its `LAUNCH.md` says "EXL3 at 3.00 bits a weight", and its README says it does not know. Rule 1 says what is done about it.
- **Whether the server uses the template that is in the build.** The top of this note says what that template holds on three branches. Rule 1 has the launching session read the template the server uses, and the two `grep` commands look for the phrases.
- **Whether the server hands `reasoning_effort` in `chat_template_kwargs` to the template.** The request under "Before any try" asks it, and the first group of `low` shows it again, by rule 10.
- **Whether `"enable_thinking": false` turns reasoning off on this server.** The brief says it is known. No kept try shows it. The first group of `off` shows it: `ladder.py first off` counts the replies that hold reasoning text.
- **How much of a fall at `off` is the sampling's.** The card gives another sampling for a reply with no thinking, and `off` is run with it. A fall at `off` then has two causes that this run cannot part.
- **What a try costs at `off`, `low` and `medium`.** Each step's first group says it. For scale: a try of the top step wrote 20,223 output tokens on average. A step whose setting was ignored would cost about that a try: 5.6 million output tokens for `off`, 4.2 million for `low`, 2.8 million for `medium`.
- **Whether the server is as it was.** Rule 1 says what is written down, and what is done if it is not.
- **How a try that ran out of room without looping is sorted.** The kept run's `LAUNCH.md` asks the maintainer, and no answer is written there. Until he rules, such a try is not passed, by rule 4, and is sorted as not known.

## What was checked before any try

By me, on 2026-11-17, with no model launched and no try made.

- **The tasks.** `box.py check-tasks bench/sets/camera` printed 67 lines that begin `ok`, and `window: stub; all as they must be`.
- **The texts and the request.** `texts/union.md` and `request.md` are the kept run's files, byte for byte: sha256 `e604fc54…` and `c5ef8e61…` in both directories. The declarations text is named by its sha256, as in the kept run.
- **The message.** On a copy of this directory outside the repository I set the tries up and printed the message of try 1 of each task in each of the seven arms with `small.py prompt --message-form 1`: 161 messages. Each is the same as the kept run's `sent.md` for that task in the kept arm of the same kind, once the box's path is put aside. Without `--message-form 1` the line over the files is another one.
- **No ceiling was ever run for these messages.** `AGENTS.md` says the ceiling comes first: a stronger subject passes every task, with exactly what the arm's subject is given. None did. `bench/runs/2026-11-15-camera-union`, where these two texts were first run, says of its ceiling: "None is run." The kept run and `bench/runs/2026-11-16-one-shot` ran none. I could launch no subject, so this run does not mend that. What stands in its place is less than a ceiling.
  - Each task's reference answer passes its check, and its plain answer fails: `check-tasks`, above.
  - Three subjects have been sent exactly these messages: the 27B and Flash Next in the kept run, and a Haiku model in `bench/runs/2026-11-16-one-shot`, where the two arms gave 36 and 63 of 69. That is nine tries a task for each message. With the notes, 22 of the 23 tasks were passed at least once. C3 was never passed. With the bare declarations, 19 were passed at least once. A5, C3, G5 and P1 were never passed.

  So a failure on C3 says nothing about a setting. And nothing shows that the bare declarations hold enough for A5, G5 and P1.
- **No fresh reader has read one of these messages.** The READMEs of the kept run, of the one-shot run and of the camera-union run name none. What the kept run's replies showed in a reader's place: the request says "Read them first" and speaks of a box, and three replies of `union-27b` were only a call to a tool. This run keeps that form on purpose.
- **Every command above,** on a second copy, but for `check-tasks`, `grade` and the tables, which are run by hand or need kept replies. Setup in stages gave 414 tries, then 529, 575 and 621. Each launch line was read by `small.py`'s own parser and its own check of `--extra`, with a stand-in in the launcher's place, so that nothing was sent. The six lines would send 23, 253, 23, 184, 23 and 115 tries, and each first group is the try numbered 1 of each of the 23 tasks. The commands that only read were run on that copy, filled with made-up tries.
- **Block 2 of `ladder.py rule` against the tool.** I filled a copy with made-up tries: each arm got the kept grades and records of the kept arm of its kind, and each kept reply of more than 60,000 tokens was marked as cut off. That made 621 tries, 13 of them cut off. Block 2 and the tool's own `compare` gave the same numbers and the same answers, on that fill and on the fill of rule 4.
- **Each added rule, on made-up tries.** The fill of rule 4, with 47 tries cut off in one arm. A fill where `union-low` writes 0.75 of the kept output in its tries numbered 1 and 1.3 times it in the others: `ladder.py first low` said the setting is taken as honoured, and `ladder.py cost` then said 1.13 (1.10 to 1.15), "no difference as large as a fifth". A fill where nine tries of the first group are cut off and the other fourteen write 2,000 tokens: the median is 2,000, the setting is taken as honoured, and the third stop of rule 10 holds the rest back. A fill with no `whose.txt` on the tries cut off: `box.py tally --strict` passed, and `ladder.py sorted` did not. A fill with one try not graded: `ladder.py sorted` did not pass.
- **The two `grep` commands,** on a made-up file that holds the two phrases, and for a phrase it does not hold.
- **The privacy scan.** `box.py scan` says `ok` for every file in this directory.

What the test takes for granted is what the kept run took: one message and one reply, no tools, a file given as a line `FILE: app/<path>` over a fenced block. This run adds one thing: that the server reads `chat_template_kwargs`. Rule 10 is its check.

## What changed on 2026-11-17, after the check and before any try

A fresh reader checked the first form of this note. It found nothing wrong in the commands, the messages or the numbers about the kept run. What it found, and what was done:

- The table of made-up subjects tried no loss between none and a quarter. The second table does. Rule 7 held two tests, and now holds one.
- No rule read what a step spends. Rule 12 is added, with a table, and the third stop of rule 10.
- The form of the rule that decided left a try cut off out. Block 1 now counts it as a failure, by rule 4.
- "My guesses" held no guess. It holds mine. The open things are listed at the top.
- No rule said what is done if the build, the template or the server is not the kept run's. Rule 1 does. Rule 15 says what a stop is.
- The launcher's new reading of a reply was not listed. It is the third thing that differs, and rule 14 covers it.
- `box.py tally --strict` does not see a try cut off. `ladder.py sorted` is added, in rule 17.
- Rule 6 covered two of the rule's four answers. It covers four. Each outcome has a test.
- There was no rule for each kind of task. Rule 13 is added. The note now says that no ceiling was ever run.
- Ten sentences needed what was said elsewhere. Each now says it here.

### Changed by the owning session, the same day, before any try

- **The top of the note.** It now says who fixed the design, who wrote the note, and what was read over the network: the chat template on three branches, and the model card's two samplings. The open things are four. Two are gone: the directory is committed with this change, and the guesses are written.
- **Rule 8.** The brief ran `medium` only when `low` was shown to pass less. The writing agent and the fresh reader each said that a "cannot tell" at `low` then ends the run with nothing. They were right. `medium` is now run unless `low` keeps the passes.
- **The sampling of `off`.** The brief gave `off` the kept run's sampling. The model card gives another for a reply with no thinking, and I had not read it when I wrote the brief. `off` now has the card's. The writing agent had asked whether this was wrong.
- **One request before any try.** It asks the server whether it hands `chat_template_kwargs` to the template, by sending a word the template refuses.
- **"What is not known"** lost two lines about the template and changed one about the sampling, for what I have now read.
- **The guesses** are in two sets: the writing agent's, and mine under them.

I did not run any command of this note again after these changes. The two launch lines of `off` differ from the checked ones in three numbers: the temperature, `top_p` and `presence_penalty`.

## Where the run stands, 2026-11-18

Written by Claude Fable 5.2, the owning session. The tries are in: `LAUNCH.md` says how they were sent and what the tool printed. "What came" is not written yet. Rule 17 asks that every failure be sorted first, and 81 are not. Later the same day every failure was sorted, and "What came" is below this section. This section is left as it was written, so its counts of what is not sorted are those of that hour.

**The counts were counted again.** A fresh agent wrote its own script over each try's `record.json`, `grade.json` and `steps.json`, and did not run `ladder.py`. Every count of `ladder.py counts`, every answer of block 1 of `ladder.py rule` that it was asked for, and the ratios of `ladder.py cost` came out the same. Every record of `off` shows thinking off and the card's sampling, every record of `low` shows the effort `low`, and all 483 show message form 1 and a limit of 60,000.

**What is sorted.** Six agents were set to read and sort the 347 failures.
- **`off`, all 263.** `names-off`: the test's 133, the text's 2, the subject's 1. `union-off`: the test's 119, the text's 7, the subject's 1. The 252 of the test's are the replies that ended in a call to a tool.
- **`low`, 8 of 84:** the failures of `names-low` on C5, F1 and F2.
- **A blind check.** A further agent drew 59 failures and sorted them without opening their `whose.txt`. 30 of them had one. It agreed on 29, and on the last it took the reader's side after reading it. No quote in the 30 lines was made up.

**What is not sorted, and why.** 37 failures of `names-low`, all 17 of `union-low` and all 22 of `union-low-b`, as first graded: 76. The five tries of G1 that fail since the check was mended make 81. The four agents reading the `low` step were stopped by the model service's safeguards before they finished. I did not do their work in their place. The maintainer says how it is finished.

**Found while reading, and to be carried into "What came".**
- **A call to a tool is not kept.** `small.py` keeps a reply's text and its reasoning, and not the call. So a line of `whose.txt` quotes the sentence before the call, and nothing can be said of which tool was asked for.
- **`off` changed two things.** Its sampling is the card's for no thinking. The note says so above.
- **The limit differs from the top's.** The kept tries had 120,000 tokens and these 60,000. The rows "cut at 60,000" are the ones to set beside this run.
- **K1 in `union-low-b`.** All three tries import from paths under the package, such as `@babylonjs/lite/camera/arc-rotate.js`, where the ask says `@babylonjs/lite`. None loads, so no test ran. `union-low` imported from the package's root and passed three of three. It is 3 of the 5 passes between the two rounds.
- **Six passes on G1 were hollow.** The check wrote `camera.radius` and `camera.yaw` and read them back. An answer that puts its own accessors on the camera read back right while the camera never moved. `g1-probe` here holds a probe that reads the camera's real values, and its output for every G1 answer of both runs. Hollow: `names-low/G1/1`, `2` and `3`, `union-low/G1/2`, `union-low-b/G1/1`, and the kept `names-27b/G1/1`. On the same day the check got one more test, as `bench/sets/camera/README.md` says, and G1 was graded again in both runs. Those six now fail, and no other grade changed. So the passes are now `names-low` 21 of 69, `union-low` 51, `union-low-b` 46, and the kept `names-27b` 29. As first graded they were 24, 52, 47 and 30. (This line first said that `LAUNCH.md` gives those four. It does not. `ladder.py counts` printed them before G1 was graded again.) Rule 8 reads the same on the new grades: `union-low` against `union-27b` is +0.00 (-0.12 to +0.12), "no difference as large as a quarter". The six are not sorted yet.
- **One passing try wrote the handed text back.** `names-off/I1/5` gave `camera-api.d.ts` again as a file of its own. Its answer is another file, and the pass stands.
- **Output is not the whole of a try.** A try of `union-low` took 8,148 tokens in and 3,503 out. The kept `union-27b` took 8,160 in and 17,215 out. So the whole of a try is 0.46 of the top's, where the output alone is about a fifth.

**My guesses for `off` were wrong by far.** I gave 55 to 90 passes of 138 for `union-off`, and 25 to 50 for `names-off`. They passed 11 and 2. I gave 10 to 30 replies ending in a call to a tool, and there were 119. The writing agent's guess of 4 to 15 missed as well.

## What came

Written by Claude Fable 5.2 on 2026-11-18. Another session sent the tries, as `LAUNCH.md` says. Agents read and sorted the failures. Every number here is from `ladder.py counts`, `ladder.py rule` and `ladder.py cost`, run after G1 was graded again. So four counts of passes are lower than first graded, by the six hollow passes named above, and `LAUNCH.md`'s answer for rule 8, +0.01 (-0.10 to +0.13), is now +0.00 (-0.12 to +0.12). Three fresh agents then checked this section: one every number, one every sentence about a failure, one whether it says more than the counts carry. What they found is mended in it.

### The tries

483 tries were sent, 276 at `off` and 207 at `low`. All were kept and graded. None was cut off, none did not fit, and none was left unsent. The server stopped one loop, `names-off/G5/5`. `medium` was not run, by rule 8: `union-low` against `union-27b` read "no difference as large as a quarter" on the first grades, and reads so on the new ones.

| Arm | Tries | Passed | Tasks all passed | Tasks none passed | Ended in a call to a tool | No file | Output: median of a try | Output a try | Output a passed try |
|---|---|---|---|---|---|---|---|---|---|
| `names-27b`, kept, cut at 60,000 | 69 | 29 | 5 | 9 | 0 | 2 | 18,654 | 22,339 | 53,151 |
| `union-27b`, kept, cut at 60,000 | 69 | 51 | 13 | 3 | 3 | 5 | 12,676 | 16,345 | 22,114 |
| `names-off` | 138 | 2 | 0 | 21 | 133 | 134 | 59 | 174 | 12,039 |
| `union-off` | 138 | 11 | 0 | 15 | 119 | 119 | 103 | 502 | 6,300 |
| `names-low` | 69 | 21 | 4 | 13 | 0 | 0 | 2,529 | 2,835 | 9,316 |
| `union-low` | 69 | 51 | 16 | 4 | 0 | 0 | 2,902 | 3,503 | 4,740 |
| `union-low-b` | 69 | 46 | 13 | 5 | 0 | 0 | 3,178 | 3,824 | 5,736 |

No file was taken from inside its fence, so rule 14 changes no count. The output up to the first passing try, and on the tasks with none, is in `ladder.py counts`.

```
                     A1   A3   A4   A5   B1   B2   B3   B4   B5   B6   C3   C4   C5   F1   F2   F5   G1   G2   G3   G5   I1   K1   P1
names-27b, kept     3/3  2/3  1/3  0/3  3/3  0/3  3/3  2/3  2/3  2/3  0/3  0/3  3/3  0/3  1/3  0/3  1/3  0/3  3/3  0/3  2/3  1/3  0/3
union-27b, kept     3/3  2/3  0/3  2/3  3/3  3/3  3/3  3/3  3/3  3/3  0/3  1/3  3/3  3/3  2/3  1/3  0/3  3/3  2/3  2/3  3/3  3/3  3/3
names-off           0/6  0/6  0/6  0/6  0/6  0/6  0/6  0/6  0/6  0/6  0/6  0/6  1/6  0/6  0/6  0/6  0/6  0/6  0/6  0/6  1/6  0/6  0/6
union-off           0/6  1/6  0/6  0/6  0/6  0/6  0/6  1/6  2/6  0/6  1/6  0/6  1/6  0/6  0/6  0/6  0/6  2/6  0/6  2/6  0/6  0/6  1/6
names-low           3/3  2/3  0/3  0/3  3/3  0/3  0/3  2/3  3/3  2/3  0/3  0/3  1/3  0/3  0/3  0/3  0/3  0/3  3/3  0/3  1/3  1/3  0/3
union-low           3/3  3/3  0/3  0/3  3/3  3/3  3/3  3/3  3/3  3/3  1/3  0/3  3/3  1/3  3/3  3/3  0/3  3/3  3/3  1/3  3/3  3/3  3/3
union-low-b         3/3  3/3  0/3  1/3  3/3  3/3  3/3  3/3  3/3  3/3  1/3  0/3  3/3  2/3  2/3  1/3  0/3  3/3  3/3  0/3  3/3  0/3  3/3
```

| Arm | A step or a setting that silently does nothing, 9 tasks | A number, a formula, a sign, a default or a key binding, 8 tasks | Other, 3 tasks | When or in what order, 3 tasks |
|---|---|---|---|---|
| `names-27b`, kept | 13 of 27 | 4 of 24 | 7 of 9 | 5 of 9 |
| `union-27b`, kept | 21 of 27 | 15 of 24 | 7 of 9 | 8 of 9 |
| `names-off` | 0 of 54 | 0 of 48 | 0 of 18 | 2 of 18 |
| `union-off` | 2 of 54 | 3 of 48 | 3 of 18 | 3 of 18 |
| `names-low` | 11 of 27 | 0 of 24 | 8 of 9 | 2 of 9 |
| `union-low` | 24 of 27 | 11 of 24 | 9 of 9 | 7 of 9 |
| `union-low-b` | 18 of 27 | 13 of 24 | 9 of 9 | 6 of 9 |

### What the rule says

Block 1 of `ladder.py rule`, where a try cut off is a failure of its task.

| Asked | The pair | The answer |
|---|---|---|
| One arm twice, rule 5 | `union-low` against `union-low-b` | +0.07 (-0.03 to +0.20): no difference as large as a quarter |
| Are the passes kept, rule 7 | `union-low` against `union-27b` | +0.00 (-0.12 to +0.12): no difference as large as a quarter |
| | `union-off` against `union-27b` | -0.66 (-0.80 to -0.51): shown: the first passes less |
| Does the gain survive, rule 6 | `union-low` against `names-low` | +0.43 (+0.28 to +0.59), 15 tasks up and none down: shown: the first passes more |
| | `union-off` against `names-off` | +0.07 (+0.01 to +0.12): no difference as large as a quarter |
| The gain at the top | `union-27b` against `names-27b` | +0.32 (+0.14 to +0.49): shown: the first passes more |
| The bare arm | `names-low` against `names-27b` | -0.12 (-0.23 to -0.01): no difference as large as a quarter |
| | `names-off` against `names-27b` | -0.41 (-0.57 to -0.25): shown: the first passes less |
| The kind of 9 tasks, rule 13 | `union-low` against `union-27b` | +0.11 (+0.00 to +0.26): cannot tell |
| | `union-low` against `names-low` | +0.48 (+0.22 to +0.74): shown: the first passes more |
| | `union-off` against `union-27b` | -0.74 (-0.93 to -0.50): shown: the first passes less |
| | `union-off` against `names-off` | +0.04 (+0.00 to +0.09): no difference as large as a quarter |
| | `union-27b` against `names-27b` | +0.30 (+0.07 to +0.56): shown: the first passes more |
| The kind of 8 tasks, rule 13 | `union-low` against `union-27b` | -0.17 (-0.42 to +0.04): cannot tell |
| | `union-low` against `names-low` | +0.46 (+0.17 to +0.79): shown: the first passes more |
| | `union-off` against `union-27b` | -0.56 (-0.83 to -0.25): shown: the first passes less |
| | `union-off` against `names-off` | +0.06 (+0.00 to +0.15): no difference as large as a quarter |
| | `union-27b` against `names-27b` | +0.46 (+0.12 to +0.79): shown: the first passes more |
| What a step spends, rule 12 | `union-low` against `union-27b` | 0.21 (0.16 to 0.30): shown: the first spends less |
| | `names-low` against `names-27b` | 0.13 (0.10 to 0.16): shown: the first spends less |
| | `union-off` against `union-27b` | 0.03 (0.02 to 0.05): shown: the first spends less |
| | `names-off` against `names-27b` | 0.01 (0.00 to 0.02): shown: the first spends less |
| | `union-low` against `names-low` | 1.24 (0.95 to 1.70): cannot tell |
| | `union-off` against `names-off` | 2.88 (1.20 to 7.87): shown: the first spends more |
| | `union-27b` against `names-27b` | 0.73 (0.55 to 0.93): shown: the first spends less |
| | `union-low` against `union-low-b` | 0.92 (0.81 to 1.03): no difference as large as a fifth |

The rule does not tell the two rounds of `union-low` apart, so its answers count.

**The working setting, by rule 9, is `low`.** Beside the name, as the rule asks: its tries spend less, 0.21 of the top's output a try. On each of the two larger kinds of task the rule cannot tell whether the passes are kept.

**Which outcome.** "The passes are kept at a lower step" holds at `low`. At `off` the three answers are: the notes arm falls, the bare arm falls, and the gain is "no difference as large as a quarter". The table names that "The notes arm falls to the bare arm", and says it means the notes only help a reader that reasons at length. That reading is not carried here, for the reason under "The failures".

### The failures

Every failure has one sort. `ladder.py sorted` and `box.py tally --strict` pass, and the strict tally of the kept run passes too.

| Arm | Failures | The text's | The subject's | The test's | Not known |
|---|---|---|---|---|---|
| `names-27b`, kept | 40 | 37 | 3 | 0 | 0 |
| `union-27b`, kept | 18 | 10 | 4 | 4 | 0 |
| `names-off` | 136 | 2 | 1 | 133 | 0 |
| `union-off` | 127 | 7 | 1 | 119 | 0 |
| `names-low` | 48 | 46 | 0 | 2 | 0 |
| `union-low` | 18 | 13 | 5 | 0 | 0 |
| `union-low-b` | 23 | 14 | 6 | 3 | 0 |

**`off` cannot be read as a step of reasoning.** 252 of its 263 failures end in a call to a tool, and 249 of those are one sentence and then the call. The subject had no tool. The request says "Read them first" and names each file by its path, and by the rule fixed above that is the request's doing: the test's. One reply says so itself, `union-off/F1/1`: "even though you've pasted their contents, to make sure I'm working from the actual files on disk". Every pass of `off` is among the 23 replies that gave a file: 11 of 19 with the notes, and 2 of 4 without. That is too few to read. `off` also had other sampling. So this run does not say whether the notes help a subject that does not reason.

**With the notes at `low`, the failures sit in few tasks.** Of the 41 failures of the two rounds, 27 are the text's, and they are on six tasks.
- **A4, 6 tries.** No note gives where the eye is. The answers use a formula from memory of Babylon.js.
- **A5, 5 tries.** The answers give the aspect of the clamped rectangle. Note 13 clamps one function only, and note 36 says "to match what is rendered".
- **G1, 6 tries.** Note 37 says a change to the limits applies at the next write. All six answers assign a new limits object, which the camera ignores. Four do only that. Two also put their own accessors on the camera.
- **G5, 5 tries.** No note says that an empty call to `setGeospatialOrientation` applies the limits again.
- **C3, 3 tries.** Note 9 says held keys are "normalised" and does not except the Alt key.
- **F5, 2 tries.** The notes do not say where a drag's distance is read from.

11 are the subject's. Three tries of C4 set note 56 aside for note 58, and a fourth takes steps of exactly half a turn. Three tries of K1 import from paths under the package, where the request names the package. One try of F1 leaves the library's control for one of its own, and one reads note 65 and goes against it. One try of C3 reads "normalised" as frame time, and one of F2 never sets `scene.camera`. 3 are the test's: two answers of C4 and one of F1 that drive their own frame loop, which the check has no browser for.

**Beside the top, as the note said it would set them.** The kept `union-27b` had 18 failures in 69 tries: the text's 10, the subject's 4, the test's 4. `union-low` has 13, 5 and 0, and `union-low-b` 14, 6 and 3. The text's count rose most. No size was fixed for this and no rule is asked. It is a description.

**Without the notes at `low`,** 46 of 48 failures are the text's, as at the top. The other two put their `FILE:` line in a fence of its own, so the file taken began with a fence and did not parse. The JSON of `names-low/C5/3` is the expected one. The code of `names-low/B6/2` was not run.

### Each guess beside what came

| The guess | Whose | What came |
|---|---|---|
| `off` is honoured | both | It was. The first group's median was 102 output tokens, and no reply held reasoning text. |
| `union-off` passes 70 to 100 of 138, `names-off` 35 to 60 | the writing agent's | 11 and 2 |
| `union-off` passes 55 to 90, `names-off` 25 to 50 | mine | 11 and 2 |
| The gain survives at `off` | both | "no difference as large as a quarter" |
| Replies of `union-off` that are only a call to a tool: 4 to 15, and 10 to 30 | the agent's, and mine | 119 |
| `low` is honoured, with a first group's median of 2,000 to 8,000, and of 3,000 to 9,000 | the agent's, and mine | It was, at 2,900. That is inside the agent's range and just under mine. |
| `union-low` passes 45 to 54, and 44 to 54 | the agent's, and mine | 52 as first graded, 51 now |
| `names-low` passes 24 to 34 | the agent's | 24 as first graded, 21 now |
| `union-off` against `union-27b`: "cannot tell", and "cannot tell" or "shown: the first passes less" | the agent's, and mine | "shown: the first passes less", -0.66 (-0.80 to -0.51) |
| The gain at `off` is 0.2 to 0.35 | mine | +0.07 (+0.01 to +0.12) |
| Both steps spend less | the agent's | Shown for both. |
| No try cut off at `off`, and at most 2 in an arm of `low` | the agent's | None in any arm. |
| `medium` is not run, and the working setting is `low` | both | So it came. The agent had `off` at "cannot tell" beside it, and it came as "shown: the first passes less". |

Both guessers were wrong about `off` by far, and neither foresaw that nearly every reply there would be a call to a tool. Three such replies were on record at the top, and they were short: 2,923, 1,267 and 190 output tokens, where that arm's median is 12,676.

### What this shows, and what it does not

- **By rules 7 and 9, later runs on this model use `low`.** With the notes it passed 51 and 46 of 69 tries, where the top passed 51. No loss as large as a quarter of a task's tries was found. A smaller loss is not ruled out. On the eight tasks that turn on a number or a formula the rule cannot tell: 11 and 13 of 24, against 15.
- **The notes' gain is shown at `low`:** +0.43 (+0.28 to +0.59). This run cannot say that it is larger there than at the top, where it is +0.32 (+0.14 to +0.49). At `low` a try still reasons: its output has a median near 2,900 tokens.
- **Without the notes at `low`, the rule finds no difference as large as a quarter from the top:** -0.12 (-0.23 to -0.01), on one round. The rule has no answer for a loss smaller than a quarter.
- **By rule 12 a try of `union-low` writes 0.21 (0.16 to 0.30) of the output of a kept try of `union-27b`,** with the kept reply counted as 60,000 at most. No rule was fixed for the input, so what follows is a description. A try took 8,148 tokens in and 3,503 out, and a kept try 8,160 in and 16,345 out. In and out together that is 0.48 of the top's. With the kept replies uncut, at 17,215 out, it is 0.46.
- **It does not show what happens with thinking off.** That needs a request with other words, and then every step sent again in those words.
- **It does not reach past these tasks.** Claude models wrote the tasks and the notes, from briefs that name the same kinds of hidden behaviour. Every try was handed the right part of one library.
- **One round is data.** Only `union-low` was sent twice. Its rounds differ by five passes, and three of those are one guess about an import path on K1.
- **A check here was wrong and was found by chance.** G1's check passed six answers that leave the camera unmoved. I searched the answers of both runs for an accessor put on the camera. Outside G1 there are four, all on G3 in the kept run, on a private field that tells of a cancelled flight. I did not run them, and I did not audit the other checks.

### What I did not read

I read no try's reasoning. I read G1's answers, and the lines of four G3 answers that put an accessor on the camera. I read `LAUNCH.md`, the agents' reports, and some lines of `whose.txt`. The sentences under "The failures" are from the sorting agents' lines. A fresh agent then set each of them beside the tries and the notes, and four were changed for what it found.

- **The readers.** Two Opus agents sorted `off`. Four agents set to `low` were stopped by the model service's safeguards. One of them had sorted eight failures of `names-low` by then, on C5, F1 and F2, and those lines are kept. On the maintainer's word four Sonnet agents then sorted the rest of `low`, with a brief that says whose reasoning they read: the subject's, kept by the bench, as data.
- **The checks on them.** Before `low` was sorted, a blind reader drew 59 failures, 27 of `off` and 32 of `low`. 30 of them had a line then, 27 of `off` and 3 of `names-low`, and it agreed with 29. All 32 of its sorts of `low` agree with the lines as they now stand. A second blind reader agreed with 11 of 12 more. The one dispute, `union-low-b/F1/1`, was settled by a third reader as the test's. Two quotes were not word for word, and I mended them.
- **What they report of the reasoning, which I have not checked.** At `low` a try restates the ask, quotes notes by their numbers, drafts its file and checks it, all before the file. Over the 69 tries of `union-low` the passes name a median of 5 notes and the failures 2. The longest tries at `low` are failures.

### Open

- **`off` in other words.** The request would have to drop "Read them first", name the files without a path, and ask for a reply in place of a file. That changes the message for every step.
- **Two ways an answer is lost before the check.** When a `FILE:` line sits in a fence of its own, `small.py` takes a file that begins with a fence. An import from a path under the package does not load in the grader. Neither is mended.
- **The notes that the failures at `low` point to:** 9, 13, 36 and 37, and the three things no note says, on A4, G5 and F5. Notes 56 and 58 are set against each other in C4, and the lines call that the subject's. Note 66 was read two ways on F5.
