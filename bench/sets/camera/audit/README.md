# Can a wrong answer pass these checks?

Written by Claude Opus 5.5 on 2026-11-18, from an audit by five Opus agents. No check, ask or grade was changed by it. This file says what they found, and what is to be done once the tries now being sent are graded.

## Why

G1's check wrote `camera.radius` and `camera.yaw` and read them back. Six answers had passed it by putting their own accessors on the camera, so the check read back what they wrote while the camera never moved. That was found by chance. So every other check was audited for the same kind of gap: a check that an answer can pass without doing, on the real library, what the ask asks.

## How

- **Four auditors** took a share of the 23 tasks each. For each code task they wrote answers meant to pass the check without doing the work, and ran each against the check with `box.py check-tasks` on a copy of the set. They sorted each such answer: plausible, if a subject who never saw the check could well write it as a design; contrived, if it needs to know the check.
- **They searched every kept passing answer** of every run under `bench/runs` for the same routes. Each suspect was run against a probe that reads the library's real state, not what the answer reports.
- **For each question task** they checked that `proof.test.ts` proves each expected value on the library.
- **A fifth agent** reran every finding in a fresh copy of the set, with probes of its own, on the hollow answer and on each kept answer listed. Each of the 15 findings held.

`findings.json` holds every agent's report. `hollow/` holds one hollow answer for each code task. `probes/` holds the fifth agent's probes, and `out/` their output.

## What they found

**The eight question tasks are sound:** A4, A5, C3, C5, F5, G5, I1 and P1. Each proof proves each value. A4's ask says "exactly the same view", which holds up to rounding: the two world matrices differ by about 6e-16.

**Every one of the 15 code tasks has a check that some wrong answer passes.**

| Task | What passes it | Plausible | Kept passes a probe shows wrong |
|---|---|---|---|
| A1 | Accessors on the camera's world matrix that report a second camera | no | 0 of 65 |
| A3 | Shift measured in backing pixels; the ask says CSS pixels, and the check's canvas has as many of each | yes | 1 of 72 |
| B1 | A clamping accessor with its own storage on `camera.radius` | yes | 0 of 112 |
| B2 | Accessors with their own storage that double each turn | yes | 0 of 99 |
| B3 | Its own fly controls whose mouse look never turns the view; the check sends no pointer event | yes | 0 |
| B4 | Its own pitch accessor, and a pose set with the heading the check always has | no | 0 |
| B5 | Positions in backing pixels; the ask says CSS pixels | yes | 2 |
| B6 | The line of sight worked out once, at creation | yes | 58: see below |
| C4 | Its own tween in place of the library's easing, which the ask names | yes | 0 |
| F1 | Raising `camera.speed` while a key is held; a drag while W is held loses its glide | yes | 1 |
| F2 | Its own controls in place of the library's, which the ask names | no | 0 of 54 |
| G1 | Wrapping the setters to clamp by the new limits object; the camera still clamps by its own, so a mode wider than its defaults is cut | yes | 54: see below |
| G2 | Writing the centre's fields in place, so nothing re-orbits | yes | 0 of 44 |
| G3 | Comparing yaw with no wrap, so a place with a yaw past π never settles true | yes | 3 of 71 |
| K1 | Its own key handlers; the library's keyboard module is never turned on | yes | 0 of 100 |

Where the table gives no count of kept passes probed, the agent's report does not give one.

**B6 is a fault of the ask more than of the check.** 57 of the 58 fail only once the app moves `camera.position` and `target` with the car. "Rides behind the car" implies that, but the ask never says it, and the set's own second right answer, `other.ts`, fails the same way. By the ask as written those 57 answers are not wrong. The 58th, `2026-11-16-small-screen/names-flash/B6/1`, is wrong by any reading: it leaves `getViewMatrix` with a stale view even for a still camera.

**G1 has two groups.** 34 answers wrap the setters and pass even the check as mended on 2026-11-18, because every mode in the check lies inside the camera's own default limits. 20 put their own storage on the camera. Those fail the mended check, but they still hold "passed" grades from the old check in the runs that were not graded again: `2026-11-15-camera-notes`, `2026-11-15-camera-union`, `2026-11-15-screen` and `2026-11-16-one-shot`. Of the 56 kept G1 passes, two pass every probe, both in a ceiling arm of `2026-11-15-screen`.

## What it does to the two runs on the small model

Counted from the fifth agent's lists, with B6 left as the ask has it apart from the one answer that is wrong by any reading. No try was graded again.

| Run | Arm | Passes now | Passes a probe shows wrong | Passes left |
|---|---|---|---|---|
| `2026-11-16-small-screen` | `names-27b` | 29 | B5/1, G1/2 | 27 |
| | `union-27b` | 51 | none | 51 |
| | `names-flash` | 43 | B6/1, F1/3, G1/1 | 40 |
| | `union-flash` | 59 | G1/1, G1/2 | 57 |
| `2026-11-17-effort-ladder` | `names-low` | 21 | G3/1, G3/2, G3/3 | 18 |
| | `union-low` | 51 | none | 51 |
| | `union-low-b` | 46 | B5/3 | 45 |

Most wrong passes are in the arms that had no notes. The notes arms of the 27B lose none or one. So the gains of the notes reported for those runs would grow a little, and no answer of the rule would turn the other way. That is a reading of these counts, and not a grade: a mended check may find more.

## What is to be done, and when

Nothing here is done before the tries of `bench/runs/2026-11-18-mended-notes` are graded, so that they and the 138 tries they are set beside are graded by the same checks. Then:

1. **Mend each check** by its "mend" in `findings.json`, and add its hollow answer to the task as an answer that `check-tasks` must fail. That needs a small change to `check-tasks`.
2. **B6:** make the ask say that the app moves the camera with the car, as a new version of the task, and mend `other.ts`. The tries already kept answered the old ask, and are graded by it.
3. **Grade again** every kept try of the runs on the small model, and of the mended-notes run, with the mended checks. Report each score as it stood during its run beside the score now, as `AGENTS.md` asks.
4. **Older runs** are not graded again. Their wrong passes are listed in `findings.json`.
