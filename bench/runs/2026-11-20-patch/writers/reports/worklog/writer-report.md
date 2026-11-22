Module `worklog`, written to the brief in W = /home/build/patch/worklog/set. Every command ends as it must. No rule of the brief had to be broken. Nothing was committed and nothing under /home/user/Kung-Fu was edited.

## The module

/home/build/patch/worklog/set/files/worklog.ts is 492 lines (`wc -l`); the brief asks for about 500. No import, no clock, no random number. Four spaces, no line over 120 columns, every header on one line (the outline shows 0 cut first lines).

Exports:
- Types: `JobState`, `Priority`, `Grade`, `Move`, `PartLine`, `TimeEntry`, `Job`, `JobCost`, `BoatSummary`, `WeekSummary`.
- Constants: `NO_DAY` (-1), `NO_JOB` (0), `DAY_MIN` (1440), `JOB_STATES`.
- Functions: `isOpen`, `isFrozen`, `canMove`, `nextStates`, `dueFor`, `weekOf`, `billedMinutes`, `labourMinutes`, `labourPence`, `partsCost`, `costOf`, `addPart`, `addTime`, `lateBy`, `sortJobs`, `formatPence`, `jobLine`, `boatsOf`, `summariseBoat`, `summariseWeek`.
- Class `WorkLog`, with state (`jobs`, `nextId`) and 14 members: `count` (getter), `open`, `get`, `move`, `logTime`, `usePart`, `escalate`, `openJobs`, `forBoat`, `between`, `boatSummary`, `weekSummary`, `weekly`.
- Not exported: `MOVES`, `RATE`, `BILLING_STEP_MIN`, `HANDLING_PER_MILLE`, `RANK`, `boatKey`, `partKey`, `entryPence`.

## Conventions a guess would get wrong, and where each shows

Visible only in a body, or in a comment the outline does not show:
1. The yard week runs Saturday to Friday and day 0 was a Monday. `weekOf` gives the day number of the week's Saturday, not a week's index. Comment and body, lines 151 to 156. `WeekSummary.week` holds that day number (`summariseWeek`, lines 342 to 345).
2. A job's history is kept newest first: `unshift` in `WorkLog.move` (line 428), read as `history[0]` in `move` and `summariseBoat`.
3. Labour is charged by the started quarter hour, entry by entry (`billedMinutes`). Rates are pence for an hour, in the `RATE` table's body.
4. Handling is 12.5% of a job's parts, rounded once for the job with `Math.round` (`costOf`). Summaries add it job by job.
5. Ranges include the first day and not the last: `WorkLog.between`, `WorkLog.weekly`, the week in `summariseWeek`. Two time entries overlap only if they share a minute, so back to back is allowed (`addTime`).
6. `NO_DAY` stands for "none" in `dueDay` and `closedDay`. A routine job has no due day (`dueFor`). Reopening clears `closedDay` (`move`). `sortJobs` puts a job with no due day last. `summariseWeek` guards against -1 falling in the week of day 0.
7. `addPart` and `addTime` change the job they are given. `addPart` stores the part number trimmed and in capitals, keeps one line for each part and price, removes a line at 0 and refuses a return larger than the line. `addTime` keeps a copy of the entry. `sortJobs` sorts the array it is given and returns it.
8. Boat names are trimmed and put in capitals. `open` gives `NO_JOB` (0) for a blank boat or title and uses no id. Ids run from 1.
9. A dropped job is in no summary. A signed or dropped job takes no parts or time, a done job still does. Only an urgent job goes from reported straight to started. `forBoat` is newest first and `between` is oldest first. Parts go to the week a job closed in, labour to the week it was worked in.

Visible in a declaration's first line: money in pence (`unitPence`, `partsPence`), times in minutes from midnight (`startMin`, `endMin`, `DAY_MIN`), the values of `NO_DAY` and `NO_JOB`.

## The regression helper

/home/build/patch/worklog/set/checks/helpers-worklog.ts registers 96 cases, each with its own name, at least two for every function and method. It throws if a name to skip is no case's name. I tried it on 105 one-change mutants of the module: 104 fail. The one that passes is the same program (adding `started` to the `reported` row of `MOVES`, which `canMove` never reads for that pair).

## The tasks

**PF1, beside: "Total the parts used across the log".** Adds `partsBySku(): Map<string, number>` to `WorkLog`. It turns on what the outline shows: `private jobs: Map<number, Job>`, `Job.parts`, `Job.state`, `PartLine.sku` and `PartLine.qty`. The ask says the rest: sum `qty` by `sku` whatever the price, leave out dropped jobs, count every other job. The reference edit quotes the outline's line `boatSummary(boatId: string): BoatSummary {` and puts the method before it. Hollow answers: `hollow-dropped` (counts dropped jobs), `hollow-open` (counts only open jobs), `hollow-lost` (`billedMinutes` rounds to the nearest quarter hour).

**PF2, inside: "Sign-off needs a second person".** Changes `WorkLog.move` to refuse a move to `signed` by the person on the job's most recent move to `done`, with names compared exactly. It turns on the body: where a refusal must stand so that nothing is changed, and that the history is newest first, so `find` meets the latest finish. The reference adds three lines inside the method. Hollow answers: `hollow-oldest` (takes the oldest finish), `hollow-opener` (takes the last item of the history as the latest move), `hollow-lost` (`forBoat` oldest first). The check skips one case of `unchanged`: "WorkLog.move: the person who finished a job may sign it too".

**PF3, leans: "Count lateness in yard weeks".** Changes `lateBy` from days to whole yard weeks. It leans on `weekOf`, whose first line `weekOf(day: number): number` leaves open what it returns. The fact is that it gives the day number of the week's Saturday, so the right line is `(weekOf(at) - weekOf(job.dueDay)) / 7`. The ask names only `lateBy` and says to use the yard week the file already has. It does not say the fact. The reference changes one line. `hollow-guess` takes `weekOf` for a week's index and leaves out the division, so it gives 7 for 1. Also `hollow-monday` (weeks from Monday by `Math.floor(day / 7)`), `hollow-sevens` (sevens of days), `hollow-lost` (`sortJobs` puts undated jobs first). The check skips the two `lateBy` cases whose answers are in days.

Each check fails its plain file and every hollow at an assertion. Each `hollow-lost` fails only through `unchanged`. I also ran 7 right answers written other ways (all pass) and 20 more wrong answers (all fail).

## Last line of each command

- `tsc --strict --noEmit ...` on `files/worklog.ts`: no output, exit 0. The same on the three `reference.ts` files and all ten hollow files, copied to temporary `.ts` files: no output, exit 0.
- `holds.py make W`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check W`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes W`: `PF3   leans          492       116      4328      4732     15176   lateBy`

Sizes in bytes (name, outline, region, whole): PF1 116, 4328, 8364, 15176; PF2 116, 4328, 5046, 15176; PF3 116, 4328, 4732, 15176.

Each task's `where.md` gives the line numbers for the person who sorts failures.

## Unsure

1. PF3 can be passed without knowing the fact. An answer that only compares `weekOf` values is right under either reading: a loop on `weekOf(job.dueDay + 7 * n) <= weekOf(at)` passes the check (I ran it), and dividing by `weekOf(7) - weekOf(0)` would too. I think neither is the natural answer, but a careful reader holding only the region could write one, and that pass would not be a guess of the fact.
2. PF3's ask says "I do not want a second idea of what a week is". That does not state the fact, but it does tell the reader that where a week begins matters. The outline also shows `WeekSummary.week: number`, which a sharp reader might connect to `weekOf`. I judged that neither settles what `weekOf` returns.
3. PF1's region text is the outline plus the whole `WorkLog` class (8,364 bytes), because the ask has to name the class in a code span. The run does not send `region` on `beside` tasks, but the ceiling sends every arm.
4. PF1 can be passed without editing the class: a `WorkLog.prototype.partsBySku = ...` added at the end of the file passes at run time (I ran it). The check does not type-check, so the private `jobs` field is no bar.
5. PF1's case "does not change the log or its jobs" also changes the returned map and calls again, so an answer that kept one map and handed it back each time would fail. The ask does not say "a new map each time" in those words; I read it as part of "must not change the log".
6. PF2: `job.history[0].by === by` is also right, since a job can only be signed from `done`. It passes. So a right answer needs the front of the history, which the body shows, but not a search through it.
7. The exported types are not pinned by cases; they cannot be at run time. Each `hollow-lost` changes one function, and I did not test `unchanged` against a whole file rewritten from the outline by a model.
8. The module holds a non-ASCII character, `£`, in `formatPence` and in one comment. No edit of any task touches those lines, and the bench's tools read it as UTF-8.
9. The asks are 126, 148 and 139 words by `wc -w`, counting the title and PF1's fenced block.
10. Two files under /home/user/Kung-Fu/bench/runs (`2026-11-20-patch/request.md` and `2026-11-20-patch-ceiling/request.md`) are newer than the brief. I did not write them.