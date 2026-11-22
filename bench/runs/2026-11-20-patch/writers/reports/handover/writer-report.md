Module `handover` and tasks PO1, PO2, PO3 are written in /home/build/patch/handover/set, and every command in the brief ends as it must. Nothing was committed and no file under /home/user/Kung-Fu was edited. No rule of the brief had to be broken.

## The module: /home/build/patch/handover/set/files/handover.ts

863 lines (`wc -l`), within a tenth of 900. No import, no clock, no random number. No line is over 120 columns and the outline shows no cut first line.

**Exports**
- Types: `Side`, `Phase`, `ItemState`, `Zone`, `DamageKind`, `EventKind`, `ChargeCode`.
- Interfaces: `BoatSpec`, `ChecklistItem`, `Checklist`, `Reading`, `DamageMark`, `Charge`, `Settlement`, `TimelineEvent`, `StageTimes`, `Slot`.
- Constants: `DAY_MIN`, `NOT_YET`, `UNREAD`, `ZONES`, `CHARGE_ORDER`, `FUEL_PENCE_PER_LITRE`, `GAS_BOTTLE_PENCE`, `CLEANING_PENCE`, `LATE_GRACE_MIN`, `LATE_STEP_MIN`, `LATE_STEP_PENCE`, `LATE_CAP_PENCE`, `WHARF_OPENS_MIN`, `WHARF_SHUTS_MIN`.
- Functions (41): `stamp`, `dayOf`, `minuteOf`, `formatStamp`, `formatPence`, `formatLitres`, `formatHours`, `checklistFor`, `tick`, `outstanding`, `isReady`, `faults`, `faultNotes`, `progress`, `blankReading`, `readingProblems`, `fuelEighths`, `fuelUsed`, `estimateFuel`, `fuelCharge`, `gasUsed`, `lateMinutes`, `lateCharge`, `describeMark`, `damageCharge`, `sameMark`, `newDamage`, `sortMarks`, `worstMark`, `totalPence`, `mergeCharges`, `settle`, `receiptLines`, `describeEvent`, `eventsOn`, `spanOf`, `stageTimes`, `slotFor`, `slotsClash`, `inWharfHours`, `nextFree`, `dueBack`, `overdue`, `turnaround`, `daySheet`.
- Classes: `Handover` (state: phase, two checklists, two readings, damage marks, extras, timeline, out and back times; 23 public members) and `HandoverBook` (a map by reference; 11 public members).
- Not exported: `pad2`, `tenths`, `clock`, `leader`, the checklist seeds, `DAMAGE_STEPS` and eight constants.

**Conventions a guess would get wrong, and where each shows**

| Convention | Where it shows |
| --- | --- |
| The timeline is kept newest first | Body only: `Handover.log` uses `unshift` (line 533), with comments at lines 504 and 531 |
| Fuel is in tenths of a litre, the engine counter in tenths of an hour | Body only: comments inside `Reading`, and the bodies of `fuelCharge`, `estimateFuel`, `readingProblems`, `fuelEighths` |
| A boat back by the end of the grace is on time; after it, lateness counts from the time due | Body only: `lateMinutes` |
| A started litre and a started late step are charged whole | Body only: `fuelCharge`, `lateCharge` |
| A damage mark pays the first step it is under, so the upper end is excluded | Body only: `damageCharge` |
| A slot holds its start and not its end; a handover may end exactly at shutting time | Body only: `slotsClash`, `inWharfHours`, `nextFree` |
| `tick` and `sortMarks` change their argument; `newDamage` and `nextFree` do not | Body only |
| "None" is -1 (`NOT_YET`, `UNREAD`), but `gasUsed` gives 0 | The constants are in first lines; which function gives which is in bodies |
| A grown mark is charged at the size it grew by, past a 10 mm tolerance | Body only: `newDamage` |
| A big boat is six berths or more | Body only: `checklistFor`, `slotFor` |
| Money is whole pence | Names |
| A time is a stamp, minutes from midnight of day 0 | Head comment and the body of `stamp` |

## The regression helper: /home/build/patch/handover/set/checks/helpers-handover.ts

- 215 cases, each with its own name. Every exported function and every public method and getter has at least two.
- It throws when `skip` names no case.
- I ran 208 one-line changes of the module against it; 203 failed it. The five that passed give the same result as the module on any real input (for example, dropping the `UNREAD` guard in `fuelEighths`), so no case can tell them apart.

## The tasks

**PO1, beside: "Say what is holding a handover up".** Adds `blockers(): string[]` to `Handover`.
- It turns on what the outline shows: `state`/`phase`, `lists`/`checklist(side)`, and the fields of `ChecklistItem`. The ask states the whole rule: which list in which phase, and `must` with `todo` or `fault`.
- The reference edit quotes `checklist(side: Side): Checklist {` as the outline prints it and puts the method before it.
- Hollows: `todo`, `anyphase`, `optional`, `lost` (`lateMinutes` counted from the end of the grace). Nothing is skipped in `unchanged`.

**PO2, inside: "Charge a very late return more".** Changes `lateCharge` so that steps after the fourth cost double, with the cap kept.
- It turns on the body: what a step is, the rounding up, and that the cap is on the whole sum. The ask says "as they are now" and does not restate them.
- Hollows: `all`, `fourth`, `cap`, `lost` (`fuelCharge` to the nearest litre). Two old cases are skipped.

**PO3, leans: "End the report with the latest events".** Changes `Handover.report` to end with the three events added last, the last added first, as `describeEvent` writes them.
- The other declaration is `Handover.log`. The fact is that the timeline is newest first. The first lines of `events`, `log`, `timeline` and `lastEvent` leave it open, and the region shows only `this.events.length`.
- `hollow-guess.ts` is the reference with `this.events.slice(-3).reverse()`; seven cases fail it.
- Other hollows: `bytime`, `all`, `lost` (`tick` keeps the note of an item put back to `todo`). Two old cases are skipped and pinned again in the check with their new endings.

For each task I also applied a right answer written another way, as an edit; all three passed.

## Last line of each command

| Command | Last line |
| --- | --- |
| `tsc --strict --noEmit ...` on the module | no output, exit 0 (also exit 0 on each `reference.ts`) |
| `holds.py make` | `3 tasks: name, outline, region, whole written for each` |
| `holds.py check` | `all as they must be` |
| `box.py check-tasks W --window none` | `window: none; all as they must be` |
| `holds.py sizes` | `PO3   leans          863       117      8954     10076     34613   Handover.report, describeEvent` |

Sizes in bytes: name 117, outline 8,954, whole 34,613 for all three. Region: PO1 19,485, PO2 9,321, PO3 10,076.

## Unsure

1. PO1's ask puts `Handover` in a code span, so its region text is the outline plus the whole class (19,485 bytes), which shows the body of `openSide`. The 27B is not sent region on beside tasks, but the ceiling is. Writing the class name without a code span would make the region equal the outline.

2. In PO1, an answer that uses an empty SEARCH adds the method after the end of the file, outside the class. The edit applies, and the file then fails to load (I tried it). The run's README guesses that the outline arm passes beside tasks "mostly by adding at the end of the file"; that cannot work for a task that adds a method.

3. PO3's ask says the report goes by when an event was added, not by the time written on it. I added that so a defensive sort by time is wrong and the task truly leans on the stored order. It does not state the fact, but it is a hint that order matters. `hollow-bytime.ts` fails on one case only, the one with a reading entered after later ticks.

4. PO3's fact shows in more than one place in the whole file: the comment and body of `log`, the comment above the `events` field, and the body of `lastEvent`. The brief asks for the other declaration's body or a comment at it; the extra places make the whole arm easier, not the region arm.

5. PO2's check has one case that reads the new charge through `Handover.charges`, which calls `lateCharge`. A right change to `lateCharge` passes it; it would fail only an answer that also broke that call.

6. The references carry no added comment line, to keep to "as few lines changed as the change needs". PO1 adds six lines, PO2 turns one line into two, PO3 adds one.

7. Two guards in the module cannot be pinned by any case because the result is the same without them: the `UNREAD` test in `fuelEighths` and the `NOT_YET` test in `lateMinutes`.

8. "Sparse comments" is a judgement: the file has nine section rules and a comment on roughly half its functions.

9. The helper has 16 lines a little over 120 columns. I took the 120-column rule to apply to the module only.

10. This `tsc` refuses with TS5112 when run from a directory that holds a `tsconfig.json`. The brief's command works from W. I type-checked the helper and the three checks against the references with `--ignoreConfig`, which the brief does not ask for; all were clean.