Module `manifest` and tasks PH1, PH2, PH3 are written in /home/build/patch/manifest/set. Every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module: /home/build/patch/manifest/set/files/manifest.ts

859 lines by `wc -l` (the brief allows 720 to 880; it is at the high end). No import, no clock, no random number, no locale call. Four spaces, no line over 120 columns, every function header on one line. `holds.py check` counts 0 first lines cut in the outline.

Exports:
- Types: `Role`, `Stowage`, `AgeBand`, `Severity`, `ProblemCode`.
- Interfaces: `Leg`, `Person`, `LoadItem`, `BoatLimits`, `LegTimes`, `LegLoad`, `Problem`, `Amendment`, `Summary`, `ReadResult`.
- Constants: `TO_END`, `NO_LEG`, `NO_TIME` (all -1), `DAY_MIN`, `DAY_GUEST_PENCE`, `BOAT_CLASSES`.
- Functions: `ageBand`, `personWeightKg`, `isAboard`, `headcount`, `tidyPerson`, `comparePeople`, `legMinutes`, `legTimes`, `parseClock`, `formatClock`, `formatStamp`, `formatDuration`, `formatDistance`, `formatPence`, `gearKg`, `legSpan`, `parseLegLine`, `parsePersonLine`, `parseLoadLine`, `checkLegs`, `guestPence`, `summarise`, `renderLegLine`, `renderPersonLine`, `renderLoadLine`, `renderProblemLine`, `renderManifest`, `readManifest`.
- Class `Manifest`, with state (legs, people, load, log, sealer) and 16 public members: `legCount`, `isSealed`, `sealedBy`, `addLeg`, `addPerson`, `removePerson`, `addLoad`, `legList`, `loadList`, `roster`, `aboardOn`, `headcountOn`, `loadOn`, `problems`, `amend`, `amendments`, `seal`, `reopen`. Three private methods.
- Not exported: `squash`, `pad`, `two`, `compareText`, `wholeNumber`, `isRole`, `isStowage`, `parseLegSpan`, `compareProblems`, `problem`, and the timing and age constants.

Conventions a guess would get wrong, and where each shows:
1. `leaveLeg` is the first leg a person is NOT aboard for, and -1 means to the end. Body of `isAboard` (lines 227-233). Body only.
2. Infants (under 2) are not counted against the people limit. Body of `headcount`. Body only.
3. A weight of 0 means "not stated" and takes a standard weight by age band; a stated weight is rounded up. Body of `personWeightKg`. Body only (a field comment says 0 is blank).
4. A leg's minutes are rounded up to a five-minute step. Body of `legMinutes`. Body only.
5. `amendments()` gives the list newest first, though the log is kept oldest first. Body of `Manifest.amendments` (lines 681-684). Body only.
6. `tidyPerson` changes the object it is given and returns it; `addPerson` and `addLeg` do not touch the caller's object. Bodies only.
7. Stored legs and days count from 0; the sheet and the office export count from 1, and the export names the last leg aboard. Bodies of `legSpan`, `formatStamp`, `parseLegSpan`, `parseLegLine`.
8. Edges in `checkLegs`: may leave at 08:00 exactly, arrive at 19:30 exactly, take 6 hours exactly, start the minute the last leg ends. A leg past midnight is late.
9. Problems are ordered whole-manifest first (leg -1), then by leg, then by a fixed code order. Body of `compareProblems`.
10. `addLoad` folds the same thing in the same place into one row and keeps the first unit weight. Body only.
11. `roster()` is sorted (skipper, crew, passengers, surname without case); `aboardOn()` is in the order added.
12. Money in pence (`guestPence`, `DAY_GUEST_PENCE`): shown in names. Times in minutes from midnight (`departMin`): shown in names. The export gives kilometres, the module keeps metres: body of `parseLegLine`.
13. `sealer` is "" while a draft. Lifejackets are needed for non-swimmers and everyone under 12. Bodies.

## The regression helper: checks/helpers-manifest.ts

`unchanged(mod, skip)` registers 122 named cases. It throws if `skip` names a case that does not exist, or if two cases share a name. I tried 179 small changes to the module against it (an edge moved, a rounding changed, an order turned, a default altered, a copy dropped). All 179 fail it. The same changes applied to each reference fail each task's check, but for one that is the same behaviour under PH2's change.

## The tasks

**PH1, beside: "Who gets on and off before a leg".** Adds `changesAt(legIndex): { on: Person[]; off: Person[] }` to `Manifest`. It turns on two calls to `aboardOn` and a comparison by id. The outline shows `aboardOn(legIndex: number): Person[] {`. The ask says what the outline does not: go by what the class answers and not by the people's fields, keep the class's order, the first leg's answer, and that only a real leg index is passed. The reference edit quotes `headcountOn(legIndex: number): number {` and puts the method before it. Hollows: `hollow-fields` (reads `leaveLeg` as the last leg aboard), `hollow-roster` (right people, roster order), `hollow-lost` (`comparePeople` with regard to case).

**PH2, inside: "Keep gear of different weights apart".** Changes `Manifest.addLoad` (lines 562-576) so an item is folded into a row only when the unit weight matches too. It turns on the test inside `find`, which is only in the body, and on keeping what the body does around it: the sealed check, the refusals, the tidied label matched without case. Hollows: `hollow-first` (tests only the first row `find` gives, so a third item at the second weight becomes a third row), `hollow-early` (a guessed branch in front of the old body), `hollow-lost` (`isAboard` with `<=`). Skips one helper case.

**PH3, leans: "Show the latest amendment on the sheet".** Changes `renderManifest` (lines 778-823) to add `Latest: <text> (<by>)` after the count. It leans on `Manifest.amendments`, whose body reverses the log with the comment `// newest first`. Its first line, `amendments(): Amendment[] {`, leaves the order open. `Amendment` has no time or number, so no answer is right for both orders. The natural guess is the last entry; the fact is the first. The region shows `const notes = m.amendments();`. The ask does not say the order and does not name `amendments`. Hollows: `hollow-guess` (`notes[notes.length - 1]`), `hollow-before` (line before the count), `hollow-lost` (`gearKg` rounds to nearest). Skips the two helper cases that render a sheet with amendments.

Each `hollow-lost` fails only through `unchanged`. I also wrote one right answer per task in another style, kept outside the set; each passes its check.

## Last line of each command

- `tsc` on the module, and on each `reference.ts` copied to a `.ts` file: no output, exit 0.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PH3   leans          859       117      6198      7758     27930   renderManifest`. In bytes: name 117, outline 6198, region 6846 (PH2) and 7758 (PH3), whole 27930. PH1's region text is the outline text, since its ask names nothing the file declares.

## Rules not kept

None that I know of. One thing changed on the way: PH2 was first written on `legMinutes` (a flight of six locks at 8 minutes a lock). I replaced it, because the outline prints the unexported constants with their values (`LOCK_MIN = 12`, `STEP_MIN = 5`, `CRUISE_M_PER_MIN = 80`), so a branch put in front of the old body could be guessed from the outline alone. The helper still pins a case on six locks.

## Unsure

1. PH3's fact is a two-way guess. A reader of the region who happens to write `notes[0]` passes without knowing why. Nothing in the region or the outline tells the order, and I believe the last entry is the natural guess, but I have not measured it.
2. The outline prints unexported constants with their values in full, among them `STANDARD_KG ... { infant: 12, child: 35, adult: 82 }`, `CHILD_UNDER = 12`, `LOCK_MIN = 12`. So the numbers of some conventions are in the outline, though not how they are used. This is the tool's output and I left it.
3. PH1's ask steers hard: "Go by what the class already answers about who is aboard for a leg, not by the people's own fields." I think a beside task needs it, since the meaning of `leaveLeg` is only in a body. It may make the task easy. The check never calls `changesAt` with an index that is not a leg, because the outline does not show what `aboardOn` does then.
4. PH1's check has one case that compares whole `Person` entries, and one that calls the method and then requires the manifest unchanged. Both follow from the ask's words ("the people", "must not change the manifest"), but an adversary may read them as more than the ask.
5. PH2's reference compares unit weights with `===`. The check's weights differ by 0.5 kg or more, so an answer that compares with a smaller tolerance would pass. The ask says "the same unit weight".
6. PH2's check tests the old rules together with the new one (a sealed manifest throws, a count of nought is refused, the label is tidied) at a differing unit weight. The ask covers this with "Everything else about adding load stays as it is: what is refused, how a label is tidied and matched, and what is given back". The sealed case is the least plainly named by those words.
7. PH3's check has one case where the manifest is sealed and then amended. The module notes the sealing itself in the same log, and the sheet counts it. No case depends on whether the "sealed" entry is the latest.
8. The helper has a few lines over 120 columns. I read the format rule as being for the module only.
9. The module is 859 lines, 59 over the 800 asked, inside the tenth allowed.
10. I put no `other.ts` and no adversary files in the set. The other right answers and the mutation scripts are in SCRATCH/manifest, outside the set.