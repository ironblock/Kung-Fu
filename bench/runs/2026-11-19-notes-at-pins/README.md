# The animation notes at several commits

## What is asked

The 67 merged notes in `bench/runs/2026-11-18-animation/notes/merged/facts.json` were written at one commit of Babylon Lite: the 1.39.0 release, `2dddc888f6695e433ab29ae5918bee221375d86f`. Each note has a probe, a vitest file that runs the library and asserts what the note says. The writers ran the probes at that commit only.

The question: how many of the 67 notes hold at other commits of the library? A note holds at a commit when every test of its probe passes there.

The tool is `bench/notes.py check`. It sorts each note into one of three states: holds, differs, could not run. `python3 bench/notes.py check --help` says how it decides.

## The commits, and why

The library's history comes from a clone whose history starts at 2026-07-20. Dates are commit dates, as `git log` gives them.

| commit | date | why |
|---|---|---|
| `2dddc888` | 2026-11-07 | The release the notes were written at. Every note should hold here; if one does not, the tool or the copy is at fault, not the note. |
| `8e6c320f` | 2026-11-13 | The clone's head, 17 commits after the release. No commit between the two touches `src/animation`, so a note that fails here would point at code outside that directory. |
| `d7f16481` | 2026-10-06 | The last commit on or before 2026-10-07: about one month before the release. |
| `c9958540` | 2026-09-07 | The last commit on or before 2026-09-07: about two months before. |
| `7184feda` | 2026-08-07 | The last commit on or before 2026-08-07: about three months before. |
| `0b2f4b8c` | 2026-07-20 | The oldest commit the clone holds. |

The commit `a9cfda1b` (2026-06-21) was asked about too. The clone does not hold it: `git cat-file -t a9cfda1b` says "Not a valid object name". I left it out. A fetch of it would need its full id, which I do not have, and a fetch with `--depth 1` into a clone with a shallow history writes the clone's list of shallow commits. I was not sure that is harmless, so I did not try the fetch.

## How each commit is checked

For each commit, `git archive <commit> packages/babylon-lite/src packages/babylon-lite/shaders packages/babylon-lite/package.json` writes that commit's files into a scratch directory outside this repository. Then:

```sh
python3 bench/notes.py check bench/runs/2026-11-18-animation/notes/merged/facts.json \
  --probes bench/runs/2026-11-18-animation/notes/merged/probes \
  --library <scratch copy> --runner <directory with node_modules> \
  --helpers bench/runs/2026-11-15-reader/checks/helpers.ts \
  --json bench/runs/2026-11-19-notes-at-pins/pins/<short commit>.json
```

Four probes import a helpers file that the writers' box held as `app/checks/helpers.ts`. That file is not under the merged notes. `bench/runs/2026-11-15-reader/checks/helpers.ts` is the same file, byte for byte, so it is passed with `--helpers`. The runner is vitest 5.1.0 on node 22, with the library's own dependencies installed beside it. They were installed for the release; an older commit may want other versions of them.

## What each outcome would mean

- **A note holds** at a commit: its probe passed there. That says the library did what the probe asserts on that commit. It says nothing about a commit not checked, and nothing wider than the probe's tests.
- **A note differs**: the probe loaded and an assertion failed. The library ran and did something else there. To say what, I read the code of that commit beside the release's.
- **A note could not run**: the probe did not get as far as its own assertions. Usually a name the probe imports is not in the library at that commit. If the animation manager is missing at an old commit, most notes land here. That is a result: the notes speak of code that did not exist yet. It is not a fault of the notes or of the tool.
- If every note holds at every commit, the notes have been true for as long as the clone's history shows, and the check cannot tell them from notes that are hard to break. If many differ one month back, the notes are pinned to the release, and a reader on an older version should not be handed them.

## A change after the first runs (2026-11-19)

The plan above first said to take `packages/babylon-lite/src` alone. With only that, all 67 notes could not run at every commit, the release included: each probe file failed to load with `ENOENT: no such file or directory, open '../../shaders/scene-uniforms.wgsl'`. The library reads its shader files from `packages/babylon-lite/shaders` when it is loaded. That was a fault of my copy, not a result. I added `shaders` and `package.json` to the archive and ran every commit again. The files in `pins/` are from the second runs; the first runs' files were overwritten.

## Results

| commit | date | holds | differs | could not run |
|---|---|---|---|---|
| `2dddc888` (release) | 2026-11-07 | 67 | 0 | 0 |
| `8e6c320f` (head) | 2026-11-13 | 67 | 0 | 0 |
| `d7f16481` | 2026-10-06 | 67 | 0 | 0 |
| `c9958540` | 2026-09-07 | 51 | 14 | 2 |
| `7184feda` | 2026-08-07 | 50 | 14 | 3 |
| `0b2f4b8c` | 2026-07-20 | 50 | 14 | 3 |

Each row is one run of `notes.py check`, kept as `pins/<short commit>.json`. At the release, the same command on the full checkout also gave 67 of 67.

At the three newer commits every note holds. Between `c9958540` and `d7f16481`, three commits change `src/animation`. `c3745ff4` touches only the weighted glTF mixer. `22b600df` (2026-09-21, "feat(animation): add native easing and compat delegation") adds `easing.ts` and changes the property group's tick, the group order and `animation-group.ts`. `9e3cfb10` (2026-09-22, OpenUSD loading) also changes `animation-group.ts` and `property-animation.ts`. I did not run the check at each of these, so which of the last two made each change, apart from easing, is not checked.

At `c9958540` the animation manager is there, and most notes hold. The 16 that do not, by number, with what the library does there instead (from the code at `c9958540` beside `d7f16481`):

- note 4 (differs): a non-looping property group clamps at `toTime` and keeps `isPlaying` true. Its tick never sets it false or marks the group stopped.
- note 6 (differs): `goToFrame` on a property group clamps the time to the play range (`fromTime`..`toTime`), not to 0..clip duration. The probe's frame 2 with `fromFrame: 5` reads 0.5 s, not 0.2 s.
- note 7 (differs): a paused property group still writes its value on each update. The old tick writes whether or not it is playing.
- note 17 (differs): after `loopAnimation = false`, the group reaches its end and `isPlaying` stays true, as in note 4.
- note 19 (differs): there is no easing. `easing.ts` is not there, and a track's `easing` option is ignored, so the span is linear.
- note 24 (differs): the same: a track's easing function is ignored, so the probe's track reads 5, the linear value, where the probe expects -1000. `createBackEase` is not there either; that test died of a TypeError, and the assertion in the other test decides the state.
- note 29 (differs): `addAnimationGroup` appends the group at the end. A group removed and added again goes last, not back to its first place.
- note 30 (differs): the owner of a dotted path is looked up once, at creation. Writes go to the old `target.position` after it is replaced.
- note 39 (differs): a finished non-looping group is not ended, as in note 4, so the probe's "ended" state never comes.
- note 46 (differs): the probe also asserts that the easing functions are exported. `quadraticEase` is not. The part of the note about `INTERP_*` and `PATH_*` was not what failed.
- note 53 (differs): a non-looping group that reaches its end is not stopped, so after the probe sets `currentTime = 0` and `isPlaying = true`, the next update moves it to 0.5 s.
- note 54 (differs): a paused property group writes on each update, as in note 7.
- note 55 (differs): a 1 s non-looping group never sets `isPlaying` false, so the probe's "it ends on the next update" fails.
- note 58 (could not run): the easing functions do not exist. The probe calls one and gets "f is not a function".
- note 59 (differs): `goToFrame` past the end of a property group clamps to the play range, as in note 6.
- note 65 (could not run): `bezierCurveEase` does not exist.

At `7184feda` and at `0b2f4b8c`, the same 16, and one more:

- note 61 (could not run): `createAnimationGroups` returns no group for clips that only animate `weights` and have no morph bindings, nor node write-back. The probe takes the first group of such a clip, gets undefined, and dies of a TypeError. Commit `632fe596` (2026-08-24) removed that early return. This is a change of behaviour that the tool reports as "could not run", because the probe died before an assertion of its own. The state names how the probe ended, not why.

## What the results mean

The notes are pinned to the library as it has been since about 2026-09-21. On a version from early September or before, about a quarter of them are false, and two or three cannot be tried. Most of the false ones are about property groups (pause, end, `goToFrame`) and easing. A reader on such a version should not be handed these notes.

This says nothing about commits not checked, and nothing about versions after the clone's head. A note that holds at a commit holds only as far as its probe's tests go.

## What I did not read or check

- I did not check `a9cfda1b`; the clone does not hold it, and I did not fetch it.
- I did not find, commit by commit, where each change came in between `c9958540` and `d7f16481`, or between `7184feda` and `c9958540`. I read the diffs of `src/animation` across each span, not each commit.
- For each differing note I read the first failing test only, and the code it touches. A probe file may have more failing tests; the JSON names the first.
- I did not read the library's tests, its changelog or its pull requests.
- The runner's packages were installed for the release. I did not check whether an older commit asks for other versions. No failure here pointed at them.
- I read none of the task set, and none of the tries of the animation run.

Written by a Claude Opus agent for the owning session, 2026-11-19.

## How many of the notes a count of search results can show

Added by Claude Fable 5.2, the owning session, on 2026-11-19, from a second agent's work.

Ley Lines, the sibling tool, checks a fact by running a search and counting its results. It runs no test. Its own list of things left for later holds "commands that pass or fail", to return "when a fact is found that no count can express". So an Opus agent took each of the 67 notes and asked whether rows of that kind can show it: if the code changed so that the note became false, would some row's count change, and would a reader who ran the rows see the fact itself?

| Can a count show the note? | Notes |
|---|---|
| Yes, the whole note | 15 |
| Part of it: rows point at the code or show one clause | 52 |
| No | 0 |

The 15 are notes about names, constants, defaults and guards that throw: 5, 8, 14, 15, 20, 26, 31, 34, 36, 37, 41, 46, 58, 61 and 63. The other 52 are behaviour: what happens over later updates, in what order, to which value. `ley-rows.toml` holds the rows it wrote, 134 of them, each named for the notes it serves. `ley check` reports "134 rows: 134 hold" with the release's `src` beside the file; I ran that again myself.

- **So about a fifth of these notes fit the ledger as it is today,** and about four fifths need a command that passes or fails.
- **The agent judged from reading the code.** It ran no probe. Its "yes" for a note was not tested by breaking the code and watching a count change.
- **The agent that cut short probes found note 5 too wide.** The note says the package exports no function whose name begins with `_`. That holds for the animation code. The package's index exports two such functions from other parts.

