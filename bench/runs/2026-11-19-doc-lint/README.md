# The makers' animation document, linted

Written by Claude Fable 5.2 on 2026-11-19, from the work of six Opus agents. I ran none of these probes myself.

## What was asked

The library's makers ship a document on its animation code, `docs/lite/architecture/07-animation.md` (44,002 bytes, 771 lines, at release 1.39.0). `bench/runs/2026-11-19-animation-docs` hands it to a small model in place of the notes. Nobody had checked it against the code it ships with. The notes are checked by their probes; this does the same for the document: every sentence that says how the released code behaves gets a probe that runs the library and asserts what the sentence says.

## How

- **Three agents,** a third of the document each, listed every checkable claim: what a function does to state, a default, an order, a clamp, a wrap, a throw, and that a public name or signature exists. Each wrote one probe a claim and ran it against the release.
- **They were told to be fair to the document:** where a sentence can be read two ways, probe the reading most favourable to it, in the case it plainly speaks of.
- **Three more agents,** one a part, were given each sentence that differed and told to try to clear the document, and to clear it when unsure.
- **None of the six read a task, a try or a mark** of the animation set.

Each part's folder holds its probes and `claims.json`: every claim with its line, its words, its kind, its probe and its result.

## What came

294 claims listed; 280 have a probe.

| Kind of claim | Holds | Differs | No probe |
|---|---|---|---|
| Behaviour | 165 | 3 | 0 |
| A public name or signature | 67 | 13 | 1 |
| A default value | 5 | 1 | 0 |
| Internal design | 26 | 0 | 9 |
| Not checkable | 0 | 0 | 4 |
| All | 263 | 17 | 14 |

The 17 that differ, after the second agents tried to clear them:

| Verdict | Claims |
|---|---|
| The document is wrong here | 4: a-12, a-47, b-71, c-04 |
| Right for one case and wrong for another | 11 |
| The probe was unfair to the sentence | 2: b-31, c-31 |

- **Ten of the eleven have one cause.** The document's "Public API Surface" lists constants, types and a function of `src/animation` that the package's index does not export (`INTERP_*`, `PATH_*`, `evaluateSampler`, and types such as `AnimationSampler`). They exist in the source; an app cannot import them. This is the fault `bench/runs/2026-11-19-animation-docs-ceiling` found in this bench's own declarations text.
- **The four wrong outright:** `TargetPath` is given without its fifth value; `MorphTargetData` is given a `texture` field it does not have; and "All groups auto-play by default" is false, since only the first clip's group starts, which also makes the document's skeleton blend example mix nothing.
- **One verifier found a fault in the library** while clearing b-31: one easing function returns NaN at an end point in one mode. It is in that part's verdict and was not followed up.

## How this sits beside the earlier count

`bench/runs/2026-11-19-animation-docs-ceiling/README.md` says an agent found the code contradicts 13 of 17 sentences that two markers had quoted as misleading. Seven of those sentences are in this lint, and **all seven hold here**: the STOPPED and PAUSED lines, the loop formula, the `goToFrame` line, "apply the exact final pose once, then stop", "paused property groups do not evaluate", and "weighted sums".

Both counts are right about what they asked.

- **This lint asked:** is the sentence true in the case it plainly speaks of, read most favourably? For 263 of 280 claims it is.
- **The earlier check asked:** does the code contradict the sentence anywhere a reader would apply it? "STOPPED: currentTime = 0" is true of a clip that starts at 0 and false of one with a play range. The loop formula is true forward and false backward.

So the document is mostly true, sentence by sentence, and misleads by not naming where a sentence stops being true. That is the fault the notes showed on AP7 and AM8, where a note stated a rule and not the case the check tested. My earlier line, "the document is wrong about this release in many places", was too strong, and is corrected where it stands.

## What this does not show

- **Fairness was one agent's judgement a claim,** checked by a second only where the probe failed. A probe that passes because it is too kind to its sentence was not looked for.
- **Coverage is by the agents' reading.** A claim they did not list was not checked. One part says which sentences it left out and why.
- **I read the agents' reports and counted `claims.json`.** I read no probe.
