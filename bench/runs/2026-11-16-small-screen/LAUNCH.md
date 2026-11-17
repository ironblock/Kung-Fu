# How this run was launched

Written 2026-11-17 by Claude Opus 5.5, in a Claude Code session on the maintainer's machine, before any try. The maintainer said go on 2026-11-16. The choices below that differ from the README are his, except where a line says it is this session's.

## The servers

Both are TabbyAPI at commit `be74bf0a` with ExLlamaV3 1.5.4. Each separates the reasoning into its own field of the reply (`reasoning: true`).

| | The 27B | Flash Next |
|---|---|---|
| Model | Qwen 3.8 27B, EXL3 at 3.00 bits a weight | Qwen 3.8 Flash Next, EXL3 at 2.05 bits a weight, YaRN factor 2 |
| Context the server allows | 163,840 tokens | 524,288 tokens |
| Cache | 8-bit keys and values, 163,840 tokens | 8-bit keys and values, 524,288 tokens |
| Requests at once | 2 | 4 |
| Speculative decoding | a DFlash2 draft model | none |

Both model cards give a native context of 262,144 tokens.

## What every request carries

- **Sampling: the model card's thinking mode, sent explicitly.** `--temperature 1.0`, with `top_p` 0.95, `top_k` 20, `min_p` 0, `presence_penalty` 0 and `repetition_penalty` 1.0 in `--extra`. Each server's own default preset holds the same values, so nothing is changed. Sending them puts them in every `record.json`.
- **Thinking on, and kept.** `chat_template_kwargs: {"enable_thinking": true, "preserve_thinking": true}`. Both models use the same chat template, and the template already treats both as true when they are unset. A try here is a single turn, so `preserve_thinking` has nothing to keep. It is sent so that the setting is on the record.
- **Context: 131,072 tokens, half the native context.** It is enforced by `--context-limit 131072`.
- **No cap on the reply below that context.** `--max-tokens 120000`. The largest message is about 8,923 tokens by `small.py`'s estimate (F5, `union`), so a reply is bounded only by the context. The README planned a lower cap, to be raised when replies were cut off. The maintainer chose this instead, with the run watched closely, because both models reason at length.
- **Timeout: 10,800 seconds.** At these lengths a try can run for an hour, and a request that times out goes on running on the server.

## The order, changed

The README says to run one try a task of `names` first, 23 requests, and to read the tally before going on. `small.py launch` has no option for one try of each task, so this session's change, agreed by the maintainer, is the following.

1. All 69 tries of `names` are launched on both servers at once.
2. Flash Next's replies arrive first. They are read against rule 1 as they land.
3. If rule 1 fails on them (more than one reply in five cut off, or missing the reply's form), the 27B's launch is stopped before it goes further.

## Requests at once, chosen by this session

- **The 27B: one.** Two tries that each fill 131,072 tokens do not fit together in its cache of 163,840.
- **Flash Next: four.** Four such tries fill its cache of 524,288 exactly.

## Labels

- `--label "Qwen 3.8 27B at 3.00 bits a weight"`
- `--label "Qwen 3.8 Flash Next at 2.05 bits a weight"`

## Changes during the run

- **2026-11-17, 02:55Z: a loop counts as a failure.** The maintainer ruled this after the 27B's `names-27b/A3/2`. That reply reached 120,000 tokens with no file. Its reasoning repeats one sentence pattern from character 171,952 of 474,092 on: "Now, think about if camera changes are in `camera.X` etc. Good." So it was a loop, and more room would not have ended it. No cut-off try is launched again. There is no room left to give: the reply's limit already fills the 131,072-token context. `box.py tally` and `compare` leave cut-off tries out of the passes by default. So each count here is given two ways: over every try, with a cut-off counted as failed, and as `tally` prints it. The sampling stays the card's. No presence penalty is added.
- **2026-11-17, 06:40Z: a cut-off that is not a loop.** Flash Next's `names-flash/G1/2` reasoned for 510,262 characters, about 117,000 tokens. It then began its file in the reply and was cut off 2,990 characters into it, at 120,000 tokens. The reasoning does not repeat. It ends on a decision: "Ensure line `FILE: app/src/mode-limits.ts`. final." So this try ran out of room rather than looping. The 131,072-token context leaves none to give. How such a try is counted is the maintainer's ruling and is asked for. Until he answers it is not launched again, and its counts are given both ways.
- **2026-11-17, 08:40Z: a near-loop, counted as a loop.** Flash Next's `union-flash/A3/1` reasoned for 514,130 characters with no reply and was cut off at 120,000 tokens. Its last stretch lists variant after variant of one sentence, "Potential issue: If `copyMatrix` ... Good.", and reaches no decision. No 300-character passage repeats exactly, so this session counts it as a loop in kind, and so as a failure under the maintainer's ruling. A3 is the task where a reply runs away most often: here, in `names-27b/A3/2` and in `union-27b/A3/1`.
- **2026-11-17, 11:05Z: a second near-loop, counted as a loop.** Flash Next's `union-flash/B5/1` reasoned for 524,174 characters with no reply and was cut off at 120,000 tokens. In its last 40,000 characters, 27 lines open "Need if point finite but projection resu…" and 21 more open "Need if `projectWorldToScreen` returns o…". It reaches no decision.
- **2026-11-17, 13:15Z: a third near-loop, counted as a loop.** Flash Next's `union-flash/G1/3` reasoned for 480,851 characters with no reply and was cut off at 120,000 tokens. In its last 40,000 characters, 90 lines open "Potential hidden requirement: If app wri…" and 78 more open "Could maybe if tests check that code doe…". The second kind runs through the library's names one at a time ("Could maybe if tests check that code doesn't call `FULL_VIEWPORT`. no."). It reaches no decision.
