The `tides` module, its regression helper and the three tasks are written in /home/build/patch/tides/set, and every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited. Every rule in the brief was kept.

## The module
/home/build/patch/tides/set/files/tides.ts is 149 lines (`wc -l`). It has no import, four-space indent, no line over 120 columns and no line the bench reads as a mark. It passes `tsc --strict`.

**Exports**
- Interfaces: `HighWater {at, height}`, `LockWindow {opens, closes, depth}`, `Departure {leave, enter, clear, held}`.
- Constants: `DAY = 1440`, `SILL = 310`.
- Functions: `clock`, `windowFor`, `windowsFor`, `isOpen`, `fits`, `deepEnough`, `nextEntry`, `lastLeave`, `spare`, `boardLine`, `lockDues`, `closeFor`, `planDeparture`.
- Not exported: `pad`, and the constants `LOCKING = 12`, `KEEL_MARGIN = 25`, `MAX_BEFORE = 150`, `MAX_AFTER = 110`, `KEEPER_FROM = 360`, `KEEPER_UNTIL = 1200`, `DUES_PER_METRE = 85`.

**Conventions a guess would get wrong, and where each shows**
1. Times are minutes from midnight and heights are centimetres: the header comment only.
2. A window includes `opens` and excludes `closes`: the bodies of `isOpen` and `spare`.
3. A boat may enter while `entry + LOCKING <= closes`, so the last entry at `closes - 12` is included: the bodies of `nextEntry`, `lastLeave`, `spare` and `boardLine`.
4. "None" for `nextEntry` is `DAY` (1440), not -1: its body, lines 93 and 94, with a comment that says so.
5. `windowFor` gives 2 minutes a centimetre before high water and 1.5 after, rounded down, capped at 150 and 110, kept inside the day, and null under 25 cm: body only, apart from `| null` in the first line.
6. `windowsFor` copies the table before sorting, joins windows that only meet, and keeps the greater depth and later closing: body.
7. `closeFor` changes the caller's list in place and returns the minutes lost, and it makes new pieces without altering a window object: body.
8. `deepEnough` returns a new list holding the same window objects: body and comment.
9. `planDeparture` holds the boat at the yard, so `leave = entry - cruise` and `held = leave - ready`: body.
10. `lockDues` is in pence, charges by the metre rounded up, and adds a half rounded down outside keeper's hours, which run from 360 up to but not including 1200: body and comment.
11. `clock` shows "--:--" outside the day, and `spare` is 0 when the lock is shut: bodies.

## The helper
/home/build/patch/tides/set/checks/helpers-tides.ts exports `unchanged(mod, skip)`. It registers 60 uniquely named cases covering every export, with at least two per function, and it throws if a skip name matches no case. I ran 55 one-line mutants of the module against it: 54 fail, and the one that passes is equivalent by construction.

## The tasks
All three are in /home/build/patch/tides/set/tasks/.

- **PB1 (beside): "Minutes the lock is open in a stretch of the day".** It adds `openMinutes(windows, from, to)` with an empty-SEARCH edit at the end of the file. It turns on cutting each window to the stretch, windows in any order, 0 for a backward stretch, and leaving the list alone. It needs only `LockWindow.opens` and `closes`, which the outline shows. Hollows: `lost` (`isOpen` includes the closing minute), `whole` (no cutting), `sorted` (stops early, assuming opening order).
- **PB2 (inside): "Drop the slivers a closure leaves behind".** It changes `closeFor` at lines 136 and 137: a piece left of a cut window is kept only at 12 minutes or more, and otherwise its minutes are added to the return. Windows the closure does not touch stay. Hollows: `lost` (`windowsFor` does not join windows that only meet), `kept` (minutes not counted), `edge` (drops a piece of exactly 12), `all` (sweeps out untouched short windows). The check skips one pinned case, "closeFor keeps a piece of a few minutes".
- **PB3 (leans): "No plan when the lock is done for the day".** `planDeparture` returns `null`, with return type `Departure | null`, when the boat cannot enter again that day. It leans on `nextEntry`, whose first line shows only `: number`. The ask does not state the fact and does not name `nextEntry`. Hollows: `guess` (`entry === -1`), `lost` (`windowFor` rounds to nearest), `shut` (tests only whether a window is still open on arrival). The check skips "planDeparture gives a plan even when nothing is left".

Right answers written another way pass: three for PB1 and PB2 together, four for PB3 (`entry >= DAY`, a hedge over both guesses, `entry + LOCKING > DAY`, and an own test of the windows).

## Last line of each command
- `tsc` on the module and on each `reference.ts`: no output, exit 0. Every hollow file type-checks too.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`. It reports 0 cut first lines, and that PB1's region text is the outline text.
- `box.py check-tasks W --window none`: `window: none; all as they must be`. All 3 references pass, and all 3 plain and 10 hollow answers fail at assertions with nothing failing to load.
- `holds.py sizes`: `PB3   leans          149       114      1837      2387      6175   planDeparture`. The sizes are name 114, outline 1837 and whole 6175 bytes for all three; region is 1837 for PB1, 2670 for PB2 and 2387 for PB3.

## Unsure

1. PB3 can be passed without the fact. A reader holding only the region can hedge with `entry < 0 || entry >= DAY`, and the outline shows `export const DAY = 1440;`, which may prompt `entry >= DAY`. Both pass and both are right. This may lift the region arm on this task; `where.md` says to read such a try as a hedge.
2. PB2's `unchanged` pins that `closeFor` does not alter a window object that was in the list. An answer that drops slivers correctly but edits the cut window in place fails through that pin. I think this is fair, because the module shares window objects between lists and the ask says everything else stays; a sorter might call it strict. It is noted in PB2's `where.md`.
3. PB1 needs no convention of the module, only the two member names. That fits the brief, but it means its outline arm tests little beyond names and placement. Its region text equals its outline text, since the ask names nothing the file declares.
4. The outline prints the unexported constants with their values (for example `LOCKING = 12`). A rewrite from the outline gets those right; it would still fail on the rates 2 and 1.5, the rounding, the board string, the dashes and the `DAY` sentinel, which are only in bodies.
5. The "rewrite from the outline must fail" claim was not tested by a blind rewriter. I tested it with the 55 mutants, and I know the bodies.
6. `lockDues` (money in pence) and `boardLine` go a little beyond the given subject of windows and planning a departure. I added them to reach the size and to carry more conventions. There is no "list kept newest first" convention; I found no sensible place for one.
7. "Sparse comments" is a judgment: 10 of the 13 exported functions have a one-line comment above them.
8. PB1's ask is 156 words counted by whitespace, including the title and the fenced signature; PB2 is 143 and PB3 is 96.
9. I left /home/build/patch/tides/set/app/src empty apart from its `.gitkeep`, as the brief does not ask for the module there. My generator and attack scripts are in the session scratchpad under `tides-gen`, not in W.