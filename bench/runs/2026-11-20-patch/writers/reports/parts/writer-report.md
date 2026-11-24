Module `parts` and its three tasks are written in /home/build/patch/parts/set, and every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module: /home/build/patch/parts/set/files/parts.ts

654 lines by `wc -l` (target 650). No line is over 120 columns, the outline cuts no first line, and there is no import.

**Exports (33):**
- Types: `MoveKind`, `Category`.
- Constants: `NO_JOB`, `NO_BIN`, `NEVER`, `DEFAULT_LEAD_DAYS`, `NO_LIMIT`, `USAGE_WEEKS`.
- Interfaces: `Part`, `StockLine`, `Hold`, `Movement`, `DeliveryLine`, `CountLine`, `KitLine`, `ReorderLine`, `PickLine`, `Variance`.
- Functions: `keyOf`, `isPartNo`, `categoryOf`, `packsFor`, `reorderPacks`, `formatPence`, `sortByBin`, `shelfLabel`, `deliveryTotal`, `mergeKit`, `leadDaysOf`, `expectedDay`, `daysOfCover`, `describeMove`.
- Class `PartsStore`: four private fields of state, 31 public methods and three private ones (`known`, `lineOf`, `log`).
- Not exported: `byText`, `inDays`, `wholeAndAtLeast` and four tables.

**Conventions a guess would get wrong.** All but the last show only in a body.
- The log is kept newest first: `PartsStore.log`, lines 650 to 653. `movesBetween` turns it round to oldest first.
- A period includes its first day and not its second: `inDays`, used by `movesBetween`, `usage` and `slowMovers`.
- A part is reordered when free stock is at its level or under it, and a level of 0 means never: `reorderPacks`.
- `setAside` sets aside only what is free and returns that number. A second call for the same job and part adds to the one hold, which keeps its first day.
- `issue` uses up the job's own hold first, may not touch other jobs' holds, logs negative units, and returns the cost in pence.
- `correct` returns counted less the books, logs nothing when they agree but still marks the day, and cuts the latest hold first when the count cannot cover the holds.
- `sortByBin` sorts the list it is given and puts parts with no bin last. `mergeKit` leaves its list alone.
- `receive` turns packs into units and averages from the pack price, weighted by units, to the nearest penny.
- `expectedDay` moves a Sunday (day % 7 === 0) to the Monday.
- `formatPence` puts a loss in brackets and commas in the thousands.
- `daysOfCover` gives -1 for a part nobody draws, and at least 1 day while any stock is free.
- `keyOf` drops all spaces and upper-cases. Reading an unknown part gives 0 or `NEVER`; changing one throws `RangeError`.
- Shown in declarations: money in pence, `NEVER = 0`, `NO_JOB` and `NO_BIN` as empty strings.

## The regression helper: /home/build/patch/parts/set/checks/helpers-parts.ts

It exports `unchanged` only and registers 120 cases, each with its own name. One extra case fails if two names match or a skipped name is not a case. I tried 120 single guess-like changes to the module against it; it caught all of them after I strengthened two cases.

## The tasks

- **PN1, beside: "Say how many units short a job would be".** Adds `shortfall(partNo, units, jobId)` to `PartsStore`. It turns on a job's reach being the free stock plus its own hold. The ask says what `freeOf` and `heldFor` return, since only their bodies do. The reference edit quotes `avgPence(partNo: string): number {` from the outline. Hollow answers: `lost`, `free`, `shelf`, `reach`.
- **PN2, inside: "A free replacement pack must not make a part cheaper".** Changes `PartsStore.receive` so a pack price of 0 leaves the average as it was. It turns on guarding the one line that sets `avgPence` (line 346) and leaving the stock, the day and the log alone. Its check skips one case, `receive: a pack that cost nothing pulls the average down`. Hollow answers: `lost`, `skip`, `quiet`, `empty`, `priced`.
- **PN3, leans: "Let the store screen ask for only the latest movements".** Gives `PartsStore.history` an optional `limit`. It leans on `PartsStore.log`, which puts each movement at the front, so the latest are `slice(0, limit)`. The first line `private log(move: Movement): void {` leaves the order open. The ask rules out going by day number, so the order of the list cannot be sidestepped. `hollow-guess.ts` uses `slice(-limit)`. Other hollow answers: `lost`, `day`, `early`, `turned`.

Every hollow answer fails for the reason it was written for: each `hollow-lost` only through `unchanged`, the others only through the new cases.

## Last line of each command

- `tsc` on the module: no output, exit 0. The same for each `reference.ts`, copied to a temporary `.ts` file.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be` (20 lines `ok`, none `WRONG`)
- `holds.py sizes`: `PN3   leans          654       114      5316      5536     22460   PartsStore.history`

## Rules I could not be sure I kept

None was broken that I know of. The things I am not sure of are listed in the last field.

## Unsure

1. PN1's ask is 169 words by `wc -w`, which counts the title and the signature. That is under 170 by one.
2. In PN1's ask the class name is not in a code span, and `PartsStore.freeOf` and `PartsStore.heldFor` are. So its region text holds those two bodies and not the whole class. A bare `PartsStore` span would have made the region the whole 400-line class.
3. PN3 rests on "the log is newest first". The brief lists that convention itself, so other modules' `leans` tasks may rest on the same fact. I could not see the others from inside W.
4. About half the methods carry a one-line doc comment. That may be more than "sparse". None is above `history`, and none in the outline or in PN3's region shows the order of the log.
5. The module holds the non-ASCII character `£`, in `formatPence`.
6. No one but me has attacked the checks or tried the asks. The hollow answers and the 120 mutations are mine, and I ran no fresh reader and no ceiling.
7. The 120-line limit is kept in the module. A few lines of the helper and of two checks are longer.