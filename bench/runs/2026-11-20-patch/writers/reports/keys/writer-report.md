Module `keys` and its three tasks are written in /home/build/patch/keys/set, and every command in the brief ends as it must. Nothing was committed and nothing under /home/user/Kung-Fu was changed.

## The module
/home/build/patch/keys/set/files/keys.ts is 254 lines (`wc -l`), with no import and no line over 120 columns. Every function header is on one line, and the outline shows 0 first lines cut. `keys` is not in the brief's lists, so it has no class and its `beside` task adds an exported function.

Exports:
- Types: `GearKind`, `JacketSize`, `GearLine`, `LogEntry`, `Loan`, `Settlement`.
- Constants: `ALL_KINDS`, `REPLACEMENT_PENCE`, `RETURN_BY_MINUTE`, `LATE_DAY_PENCE`.
- Functions: `openLoan`, `isOpen`, `issue`, `issueKeys`, `takeBack`, `outstanding`, `gearCharge`, `lateDays`, `lateFee`, `settle`, `jacketSize`, `depositFor`, `standardKit`, `issueKit`, `keyHolder`, `overdueLoans`, `formatPence`, `summary`, `receiptLines`.
- Not exported: `lineFor`, `record`, `LATE_DAYS_CAP`, `LOG_KEEP`, `JACKET_LIMITS`, `DEPOSIT_STEPS`, `DEPOSIT_TOP`.

## Conventions a guess would get wrong
Visible only in a body or a comment:
1. **The log is newest first and keeps 40 entries.** `record`, lines 103 to 107: `loan.log.unshift(entry)`, then the cut.
2. **0 stands for "none".** `keyTag: 0` is no key and `settledDay: 0` is an open loan; tags and days are numbered from 1. It shows in `openLoan`, `isOpen`, `keyHolder` and `takeBack`.
3. **10:00 on the due day is on time.** `lateDays` uses `minute > RETURN_BY_MINUTE`, so a late day starts the minute after. The cap of three days is in `lateFee`, not in `lateDays`.
4. **Two tables with opposite ends.** `jacketSize` uses `weightKg < limit`, so a weight at a limit takes the next size up. `depositFor` uses `berths <= upTo`.
5. **Damaged items are among those back.** `takeBack` counts them inside `back`. `gearCharge` charges each at half its cost, rounded up per item: three damaged water keys cost 1089 pence, not 1088.
6. **Functions that change their argument.** `takeBack` changes the loan, takes no more than are out and logs the count it took. `settle` returns a `Settlement` and also sets `settledDay`, once only. `overdueLoans` leaves its list as it was.
7. **The booking reference is trimmed and put in capitals** in `openLoan`; the boat's name is not.
8. **The yard keeps no more than the deposit.** `settle` puts the rest in `owedPence`.

Visible in first lines: money is in pence, and times are a day number and minutes from midnight.

## The tasks
- **PJ1 (beside), "Count the gear that is out".** Adds `stillOut(loans: Loan[]): Record<GearKind, number>`, which counts what is out by kind over open loans, with all six kinds as keys. It turns on what the outline shows: the six kinds, `isOpen`, `outstanding` and the fields of `GearLine`. The ask states the one body-only fact, that `back` includes the damaged items. The reference edit has an empty SEARCH.
- **PJ2 (inside), "Lost keys and damaged lifejackets".** Changes `gearCharge`: one boat key's cost however many keys are missing, and a damaged lifejacket in full. It turns on the body, lines 145 to 154: the half charge and its per-item rounding are in no first line. The check skips two `unchanged` cases, "gearCharge charges every missing boat key" and "gearCharge charges a damaged lifejacket at half".
- **PJ3 (leans), "A return entered twice".** Changes `takeBack` to ignore a repeat, judged against "the entry most recently added to the loan's log". It turns on `record` keeping the log newest first, so the entry is `loan.log[0]`. `takeBack`'s own lines show only the call `record(loan, {...})`, and the ask neither states the order nor names `record`. `hollow-guess.ts` uses `loan.log[loan.log.length - 1]` and fails six cases.

Hollow answers, all failing at an assertion:
- PJ1: `lost`, `settled`, `sparse`, `damaged`.
- PJ2: `lost`, `always`, `jacket`, `added`.
- PJ3: `lost`, `guess`, `any`, `count`, `time`.

Each `hollow-lost.ts` fails only through `unchanged`.

## Last line of each command
- `tsc --strict` on the module: no output, exit 0. Each `reference.ts` and each hollow answer was type-checked the same way from a temporary `.ts` copy, all exit 0.
- `holds.py make W && holds.py check W`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes W`: `PJ3   leans          254       113      3216      3956      8975   takeBack`

In bytes, the held texts are: name 113, outline 3216, whole 8975, region 3649 for PJ2 and 3956 for PJ3.

## Beyond the brief
- **Mutants.** `unchanged` has 81 cases. I ran it alone against 79 one-line mutants of the module and it caught 78. The one it passed, `Math.round` for `Math.ceil` in the half charge, behaves the same for every cost in the table.
- **Other right answers.** Four right answers written another way pass their checks: two for PJ1, one for PJ2, one for PJ3.
- **Scratch scripts.** The build and mutant scripts are in SCRATCH/keys-build, outside W. `build.py` makes each `plain.ts`, `reference.ts`, `reference.edits.md` and hollow answer from the module by exact replacement.

Every rule in the brief was kept; the points I am not sure of are listed separately.

## Unsure

1. PJ1 and "open": the ask says only open loans count and does not say an open loan has `settledDay` 0. A careful outline reader calls `isOpen(loan)`, which the outline shows. One who tests `settledDay` by a guess of their own (`-1`, `< 0`) fails. I judged that to be the measure working, but it is a judgment.
2. PJ1's region text is the same as its outline text, because its ask names no declaration in a code span. `holds.py check` prints this as a note and still ends as it must. The run does not send `region` for `beside` tasks.
3. PJ3 and an answer that needs no order: a region reader can find the "latest" entry by the largest day and minute. The check fails that answer (`hollow-time.ts`) in exactly one case, where an entry is added later for an earlier time. The ask's words "most recently added" make it wrong, but a sorter may want to look at such a failure before calling it the arm's.
4. PJ3's check calls `unchanged` with no skip, because no case of the module as it was enters one return twice at the same kind, day and minute. That holds only while consecutive returns in helpers-keys.ts keep different minutes.
5. The PJ2 and PJ3 `hollow-lost.ts` each fail exactly one `unchanged` case (the jacket limit, and the per-item rounding). That is enough for check-tasks but thin: if either case were dropped, that hollow answer would pass.
6. PJ2's reference changes more lines than the bare minimum: it adds a `missing` constant and two short comments, 7 lines of diff where 2 changed lines could do. I kept what a developer would leave.
7. No ceiling and no fresh reader were run on these tasks; the brief did not ask the writer for them. My evidence that the asks are sufficient is my own reading of the held texts and the other right answers I ran.
8. The check and helper type-check against each reference with `--skipLibCheck` and the DOM lib (for `structuredClone` in the shared helpers.ts). vitest itself does not type-check them.