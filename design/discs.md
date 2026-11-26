# Discs: how Kung Fu is laid out

Written by Claude Opus 5.5 on 2026-11-26, from the maintainer's design in conversation, for the maintainer's read before anything moves. Nothing here has moved yet.

## Why

Until now the repository was a lab notebook. It was built fast, in public, in dated steps, and its history is the record of what was written down before each run and what came after. Two theories of where files live followed one another, and neither was written down. Up to 2026-11-13 a thing lived by its kind: tools, task sets, guides and studies each had a folder. After that, each run made things of its own and kept them in its folder. So today `bench/runs` holds both the evidence and things that last, and 55,070 of the 57,337 files.

This note keeps the history as it is, and makes one turn. Everything Kung Fu would hand a model, and the tests of it, moves into **discs**. The record of each run moves into **runs**, in the same shape. The instrument stays in **bench**.

## Three kinds of thing

| Kind | What it is | Where |
| --- | --- | --- |
| Source | What is handed to a model, the drills that test it, the register, and the instrument | `discs/`, `bench/` |
| Evidence | Each run's note, config, tries and grades. It cannot be made again: a model answers differently each time. It is never edited, except by a dated line. | `runs/` |
| Disposable | Boxes, caches, built files | nowhere: they are ignored today |

An installed Kung Fu would hold `discs/` and the glossary, and leave out `runs/` and `bench/`.

## The glossary

A word has one meaning here. The glossary is a Ley Lines ledger, `ley.toml` at the root: `ley show disc` prints what the word means and who said so, and a row with a command shows where the thing lives. These are its first words.

| Word | Meaning |
| --- | --- |
| **disc** | Everything Kung Fu holds for one target: what a model must be told to use it, the drills that test that, and the register. In the film the maintainer named, the operator loads a skill from a disc. |
| **target** | What a disc is about: a tool, a library, or a way of working. |
| **area** | A part of a target with drills and items of its own, such as `outline` or `camera`. |
| **USE** | The area every disc has: the basics a model needs before any other area. |
| **version** | The version of the target that an area's drills and items were written for. |
| **item** | One thing handed to a model: a fact or a note, each with a probe that passes or fails. |
| **drill** | One test case: an ask, a check, a reference answer, and wrong answers the check must fail. |
| **check** | The test that grades a drill's answer. |
| **register** | For one disc: which items a model needs, in which setting, at which versions, and the runs that show it. |
| **operator** | Whatever puts items in front of a model: the bench, a harness, later Ley Lines' delivery. |
| **subject** | The model under test, in a run. |
| **arm** | One way of running drills, which differs from the others in what the subject is given. |
| **run** | One experiment as it was written down and done: its note, its config, its tries. |
| **try** | One subject's attempt at one drill. |
| **ceiling** | A run with a stronger subject, to show that each drill can be done with what an arm gives. |
| **outcome** | What a run's rule answered: shown, no difference, or cannot tell. |
| **finding** | An effect shown twice, as `AGENTS.md` defines it. |
| **gives** | What an arm hands the reader. The patch run called this "holds". |

Words that are not used, because they mean too much:

| Word | Why | Say instead |
| --- | --- | --- |
| task | a test case here, and anything at all elsewhere | drill, or disc |
| holds | Ley Lines' word for a row whose command still shows its count | gives |
| result | Ley Lines' word for one line or match a command prints | outcome |
| training | changing a model's weights | for that only |
| program, skill | every program; a Claude skill | disc, item |

## The tree

```text
README.md            what Kung Fu measures, and its findings, with receipts
AGENTS.md            how to measure
FINDINGS.md          what holds across discs, with receipts
ley.toml             the glossary
discs/
  ast-grep/
    README.md
    register.toml
    USE/0.51/
      items/         facts, each with a probe
      drills/<set>/  each set: its drills and the app they run in
    outline/0.51/
  babylon-lite/
    README.md
    register.toml
    camera/1.39/
    scene/1.39/
    animation/1.39/
  editing/           a way of working: patching a file a model holds only part of
    README.md
    register.toml
    USE/1/
bench/               the instrument, its self-checks, and the fixture they use
runs/                the evidence, in the shape of discs/
  ast-grep/USE/…
  ast-grep/outline/…
  babylon-lite/camera/…
  babylon-lite/scene/…
  babylon-lite/animation/…
  editing/USE/…
  _bench/            runs that test the instrument, not a disc
  README.md          every run: date, kind, question, status, outcome
```

Four rules of the tree:

1. **A folder for each axis that owns files: target, area, version.** The other axes, the model, its setting and the items' own versions, are keys in the register, not folders. This is how DefinitelyTyped keeps a library's types at versions, and how MDN's browser-compat-data keeps a register of what works in which browser at which version.
2. **A version folder is made only when something changes,** and it is named as generally as is true: for the minor version it was written for, as `0.51` or `1.39`. What an item holds for is not its folder's name. It is the item's range, below.
3. **A run goes where its drills are.** A run that spans discs goes under `runs/_across/`, and a run that tests the instrument under `runs/_bench/`.
4. **An item a register cites lives in its disc.** The run that used it keeps its own copy, which is the evidence of what was given.

## The register

One file per disc. An entry is one model, in one setting, at one version, given some items, measured in named runs. For example:

```toml
[[need]]
area = "camera"
version = "1.39"
model = "Qwen 3.8 27B at 3.00 bits a weight"
setting = "one message, reasoning effort low"
items = ["notes/union"]
against = "the library's declarations alone"
outcome = "shown: passes more, +0.43 (+0.28 to +0.59); +0.39 by the mended checks"
runs = ["2026-11-17-effort-ladder"]
```

An entry quotes a run's outcome beside the run that made it. A script checks that each named run exists, and that its note holds the quoted words.

## Ranges

The worthier part of a version is not its name but its range: the versions of the target at which an item is true. Each item carries one.

- **Its earliest known version, and its latest.** Each is the furthest version at which the item's probe was run and passed.
- **Whether each end was seen.** An end is seen when the probe was run at the next version past it and failed there. Otherwise it is only as far as anyone has looked.
- **The versions it was checked at,** each with the outcome: holds, differs, or could not run.

Finding the true range is a job that comes back: run each item's probe at more versions, older and newer, and move its ends. `runs/babylon-lite/animation/2026-11-19-notes-at-pins` did it once, for 67 notes at seven commits of the library. Ley Lines' `ley since` does the one-sided form of it for a row, back through history. Findings get the same treatment: each carries the earliest run that showed it, and a later run can only move that date earlier.

## Where each thing goes

| Now | After |
| --- | --- |
| `bench/sets/first` | `discs/ast-grep/USE/0.51/drills/first` |
| `bench/guides/facts` | `discs/ast-grep/USE/0.51/items/facts` |
| `bench/sets/outline`, `bench/sets/pairs` | `discs/ast-grep/outline/0.51/drills/outline`, `…/drills/pairs` |
| `bench/guides/outline`, `bench/guides/outline2` | `discs/ast-grep/outline/0.51/items/outline`, `…/items/outline2` |
| `bench/sets/camera` | `discs/babylon-lite/camera/1.39/drills/camera` |
| the notes the camera runs gave, as the register cites them | `discs/babylon-lite/camera/1.39/items/` |
| `bench/sets/scene` | `discs/babylon-lite/scene/1.39/drills/scene` |
| `bench/sets/animation` | `discs/babylon-lite/animation/1.39/drills/animation` |
| `bench/runs/2026-11-18-animation/notes/merged` and `one.md` | `discs/babylon-lite/animation/1.39/items/` |
| `bench/sets/patch` | `discs/editing/USE/1/drills/patch` |
| `bench/sets/pair-example` | `bench/fixtures/pair-example`, as the self-check's fixture |
| `pilot/` | `runs/ast-grep/USE/2026-11-10-pilot` |
| `bench/studies/first.md` to `fourth.md` | beside the run each one planned, as `STUDY.md` |
| `bench/checks/2026-11-13-fourth-a` | `runs/ast-grep/outline/2026-11-13-fourth-a/checks` |

The 51 runs, by their own sets and notes:

| Into | Runs |
| --- | --- |
| `runs/ast-grep/USE/` | the pilot; 2026-11-11 ceiling, first, first-ceiling, first-ceiling-2; 2026-11-12 probe-known, second-a, second-b, second-c, second-ceiling |
| `runs/ast-grep/outline/` | 2026-11-12 third-a, third-b, third-c, their three controls, third-ceiling; 2026-11-13 third-label-a, -b, -c, third-shell, third-shell-ceiling, fourth-a, fourth-ceiling |
| `runs/babylon-lite/camera/` | 2026-11-14 map-camera, map-rules; 2026-11-15 reader, camera-notes, camera-union, screen, text-only; 2026-11-16 one-shot, small-screen; 2026-11-17 effort-ladder; 2026-11-18 mended-notes; 2026-11-19 camera-regrade |
| `runs/babylon-lite/scene/` | 2026-11-15 scene; 2026-11-16 known-case |
| `runs/babylon-lite/animation/` | 2026-11-18 animation, animation-ceiling; 2026-11-19 animation-docs, animation-docs-ceiling, doc-lint, notes-at-pins, probe-payload |
| `runs/editing/USE/` | 2026-11-20 patch, patch-ceiling |
| `runs/_bench/` | 2026-11-11 check; 2026-11-13 runner-check, runner-check-b, workflow-inner, workflow-smoke |

## How the move is done

All in one pull request, in this order. Each step is checked before the next.

1. **The glossary,** `ley.toml`, and `ley check` holds it.
2. **The move, by a map.** One file maps each old path to its new one, and a script does every `git mv` from it, so that git follows each file.
3. **The paths that code reads:** each `run.json`'s `set`, the two scripts that import from other runs, and the tools' default paths.
4. **The links in the notes,** rewritten from the same map. Each note that changes gets one dated line saying so. A link check then proves that nothing points nowhere. Old commits keep their old paths, so every receipt still holds at its own commit.
5. **Every check there is:** each tool's self-check, `check-tasks` on each drill set, `holds.py check` on the patch set, the pilot's build and grade in its new place, the link check, and `ley check` on the glossary.
6. **The front pages:** the README, `AGENTS.md`, `FINDINGS.md`, each disc's README and register, and `runs/README.md`.

The 27B's patch run is pinned to its own commit, so the move does not touch it. When its tries come back, they go into `runs/editing/USE/2026-11-20-patch`.

## Tools to promote out

Some of what the bench does is useful beyond Kung Fu. Each of these would move out of a run or a bench tool, into a place other tools can use, once the move is done:

| What | Where it is now | Why it is general |
| --- | --- | --- |
| Finding an item's range: run its probe at many versions, and sort each into holds, differs or could not run | `bench/notes.py check` | any fact with a probe has a range; Ley Lines' rows with a command that passes or fails would need the same |
| The rule that compares two arms, with the task as the unit, and its trial on made-up subjects | `bench/box.py`, `passes_rule` and `simulate` | any comparison of two ways of briefing a model |
| Reading edits in the search-and-replace form, and applying them | `bench/small.py`, `parse_edits` and `apply_edits` | any harness that takes a model's patch |
| What a reader is given of a file: its outline, and the lines of the declarations an ask names | `bench/holds.py` | the operator's side of editing; Ley Lines' rows for a working tree need the same |
| The scan for what must not be committed | `bench/box.py`, `private_in` | any repository that keeps a model's output |

## Decided, 2026-11-26

1. **Version folders are named as generally as is true,** for the minor version. The real work is each item's range.
2. *Open:* `editing` as a disc.
3. *Open:* more than one drill set in a version.
4. **`FINDINGS.md`** holds what holds across discs; `runs/_across/` and `runs/_bench/` hold runs that belong to no single disc.
5. **The pilot moves whole** into `runs/ast-grep/USE/`. A tool that could serve other tools is promoted out, as listed above.
6. **The glossary's sources:** `disc` and `USE` carry the maintainer's name, and the rest carry mine until the maintainer approves them.
