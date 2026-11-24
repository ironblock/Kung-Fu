Module `moorings`, 3 tasks, written in /home/build/patch/moorings/set. Every command of the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited (git status is clean).

## The module: files/moorings.ts
- 146 lines (`wc -l`), no line over 120 columns, four spaces, no import, no clock, no random number. `tsc --strict` passes.
- Exports: types `BerthId`, `Boat`, `Berth`, `Move`; functions `fits`, `bestBerth`, `berthOf`, `assign`, `release`, `shift`, `lastMove`, `berthOn`, `nightlyFee`, `stayFee`, `quayLoad`, `boardLine`.
- Not exported: constants `ROPE_ROOM`, `NARROW_BEAM`, `NIGHT_RATE` (a table), `POWER_FEE`, `LONG_STAY`, `LONG_STAY_OFF`; helpers `isFree`, `metres`. No class (this is one of the four small modules).

## Conventions a guess would get wrong, and where each shows
Body only (not in any first line):
1. The log is kept newest first: `log.unshift` in `assign` (line 76) and `release` (line 85); `find` from the front in `lastMove` (98) and `berthOn` (103); comment at line 22.
2. Fit rule: length plus 60 cm rope room may equal the berth's length, beam must be strictly less: `fits` body, line 51.
3. A free berth has `boatId` `""`: `isFree` body (42), comment at 18. `""` also stands for "off the quay" in a `Move` (comment at 26) and is what `release` returns for a boat not on the quay (83).
4. `berthOf` finds nothing for the id `""`, though free berths hold it (66).
5. `assign`, `release` and `shift` change the berths and the log they are given; `assign` refuses a boat that is on the quay already (74).
6. Money in pence, per started metre: `Math.ceil(length / 100)` (109). A beam of exactly 215 is still narrow (108).
7. Nights: the day of arrival is charged, the day of leaving is not (114); no night costs 0 (115).
8. Long-stay discount from seven nights, rounded down (118 to 120).
9. `bestBerth`: tightest fit, and of equal lengths the earlier in the list (61).
10. `berthOn` counts a move on the day itself (103). `quayLoad` is by length, not by count, rounded to nearest (131). `boardLine` joins with two spaces and shows the id of an unknown boat.
Sizes in centimetres show only in the header comment and in bodies. The outline does show the constants with their values (`ROPE_ROOM = 60`, and so on).

## The regression helper: checks/helpers-moorings.ts
Exports only `unchanged(mod, skip)`. 52 cases, each with its own name, at least 3 for every function. A skip name that matches no case registers a failing case. I changed the module in one place at a time, 71 ways (SCRATCH/moor-tools/mutants.py): the helper fails 69. The two it lets through are `berthOf` returning the last of two berths that hold one boat (a state the module can no longer make) and an `isFree` that also takes the word "none".

## The tasks
- **PA1, beside: "List the berths a boat could take".** Adds `berthsFor(boat, berths, needPower): BerthId[]`. It turns on calling `fits` and reading `Berth`'s members, all in the outline; the ask says what "free" means. Reference adds at the end with an empty SEARCH. Hollows: `lost` (`lastMove` from the other end), `order`, `power`, `sorted` (sorts the caller's list), `ownrule` (own fit rule).
- **PA2, inside: "Charge the first week of a long stay in full".** Changes `stayFee` so the discount comes off the nights after the seventh only. It turns on the body: how nights are counted, that the rate holds the power fee, and that the discount is floored once on a total. Reference changes two lines inside the function. Hollows: `lost` (`bestBerth` tie), `pernight`, `round`, `whole`, `nopower`.
- **PA3, leans: "Log a shift along the quay as one move".** `shift` now logs two entries through `release` and `assign`; it must log one. It turns on the end of the log an entry goes to: the front (`assign` line 76). The first lines of `assign` and `release` show only `log: Move[]`. Natural wrong guess: `log.push`. Hollows: `guess` (push), `lost` (`nightlyFee` rounds to nearest), `from` (entry says from off the quay), `popped` (takes two from the end and pushes).

Every `hollow-lost` fails only through `unchanged`. Eight right answers written other ways (two or three a task, kept in the scratchpad, not in W) all pass.

## Last lines
- tsc on the module and on each `reference.ts`: no output, exit 0.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PA3   leans          146       117      1965      2418      5379   shift` (PA1 region 2254, names `fits`; PA2 region 2484, names `stayFee`; outline 1965 and whole 5379 bytes for all three)

## Rules I could not keep to the letter
None that I know of. Two notes: the module has no time in minutes (it has days, pence and centimetres); and my scratch tools live in the scratchpad, outside W.

## Unsure

1. PA3 can be answered right without knowing the fact. An answer may call `release` and `assign` on the caller's log, find the two entries they added by comparing with a copy taken before, and put one entry in their place. It lands at the right end and the check passes it (I tried it). It needs real care, but the fact is then not strictly needed. `where.md` says so.

2. PA3 holds a second thing the region does not show. An answer that frees the old berth by hand must write `boatId = ""`, and that `""` means free is only in `isFree`'s body and a comment. It is the natural guess for a `string`, and calling `release` and `assign` with a log of its own goes round it. A region failure on this would not be about the log's order, so whoever sorts failures should look for it.

3. PA2 from the outline alone: a reader could put a whole new `stayFee` in place of the first line (renaming the old one) and pass if it guesses right that nights are `toDay - fromDay`, that no night costs 0, and that the discount is floored. Each is a plausible guess, so "cannot be written from the first line" holds only as "must be guessed". The ask deliberately says "rounded the way it is rounded now" and does not say how.

4. PA1's region text shows the body of `fits`, because the ask names `fits` in a code span and the rule takes it. That is by the rule, not a choice of mine, but it means the region arm holds the fit rule on this task.

5. PA3's check asserts the new entry is at index 0. The ask says only "logged in the same way as every other move, so that the log reads as it always has". I read that as fixing the place; a reader who disagrees would call the check stricter than the ask.

6. PA2's expected values were tried against ten ways of writing "a tenth, rounded down" in floating point and all agree, but I did not try every form. An answer that rounds per night is failed on purpose.

7. The helper pins that `assign` refuses a boat already on the quay. I added that guard to the module after the first mutant run showed the double booking was unpinned; all task files were rebuilt from the module after it.

8. The git log shows a commit at 21:26 that is not mine; I ran no git command that writes.