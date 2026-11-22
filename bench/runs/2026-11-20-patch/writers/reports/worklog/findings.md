# Adversary's findings: module `worklog`, tasks PF1 (beside), PF2 (inside), PF3 (leans)

W = /home/build/patch/worklog/set. I changed none of the writer's files. I added `other.ts` and `hollow-adv-<n>.ts` in each task folder, nothing else in W.

Last run of `python3 bench/box.py check-tasks W --window none` ends: `window: none; 23 WRONG`. All 23 are my wrong answers that passed. Every reference passed, every plain and writer's hollow failed, and all three `other.ts` passed.

Counts: PF1 has 9 breaches, PF2 has 8, PF3 has 6. Of the 23, 7 get through a task's own check and 16 get through the shared helper `W/checks/helpers-worklog.ts`. Two of the 16 are the same change to `WorkLog.move` kept under two tasks, so the helper has 15 distinct gaps.

A helper breach was run under one task's check only. `unchanged` is shared, so I expect each to pass the other two checks too, but I did not run that.

Every breaching file type-checks under `tsc --strict`. For each I ran the file beside the task's `reference.ts` on one input; the "right" and "wrong" values below are what they printed.

## PF1 (beside): `WorkLog.partsBySku`

### Breaches of the task's own check (`W/tasks/PF1/check.test.ts`)

- **`hollow-adv-6.ts`** keys by `partKey(line.sku)`, trimmed and capitalised again, not by the stored sku.
  - The ask says: "The key is the `sku` of the part lines, exactly as it is stored."
  - The case "keys each entry by the sku as it is stored on the lines" only has lines put on by `usePart`, which are already trimmed capitals: `expect(got.get("GREASE")).toBe(1); expect(got.has("grease")).toBe(false);`.
  - Input: job 1 has PIN-6 qty 2, then `log.get(1).parts.push({ sku: "pin-6 ", qty: 1, unitPence: 40 })`. Right: `[["PIN-6",2],["pin-6 ",1]]`. Wrong: `[["PIN-6",3]]`.
  - `where.md` says on purpose "An answer that trims and capitalises again also passes." That does not agree with the ask's words. Either add a case with a line put on by hand, or take "exactly as it is stored" out of the ask. This one is weak: it only shows on a job changed through `get`.
- **`hollow-adv-7.ts`** leaves out jobs whose state is `booked` or `started`.
  - The ask says: "Count every other job, finished or not."
  - No case has parts on a booked or started job. "counts the jobs that are waiting, done and signed" asserts the states `["signed", "done", "reported", "waiting"]`, and every other case's jobs are `reported`.
  - Input: PIN-6 qty 2 on a booked job, EYE-8 qty 1 on a started job. Right: `[["PIN-6",2],["EYE-8",1]]`. Wrong: `[]`.
  - Not a likely answer, but two of the six states that count are never tested.
- **`hollow-adv-8.ts`** sorts each job's `parts` in place by sku while reading them.
  - The ask says: "The method must not change the log or any of its jobs."
  - "does not change the log or its jobs" compares the jobs of `yard()` before and after, and every job there already has its lines in sku order (job 1: GLAND-28, GLAND-28, GREASE; job 2: GLAND-28, PIN-6; job 3: HORN-12V, PIN-6).
  - Input: one job with PIN-6 then EYE-8. Parts after the call, right: `["PIN-6","EYE-8"]`; wrong: `["EYE-8","PIN-6"]`.

### Breaches through the helper (right `partsBySku`, one other function changed)

- **`hollow-adv-1.ts`**, `formatPence`: `Math.floor(Math.abs(pence))` in place of `Math.abs(Math.round(pence))`.
  - `formatPence(199.5)`: right `£2.00`, wrong `£1.99`. `formatPence(0.6)`: right `£0.01`, wrong `£0.00`.
  - The helper's two `formatPence` cases (lines 377 to 386) use whole pence only: 4520, 5, 0, 123456, -5, -12345.
- **`hollow-adv-2.ts`**, `addTime`: the overlap test only asks whether the new entry's start or end lies inside an old one, so an entry that wraps an old one is taken.
  - 480-540, then the same fitter 470-550 on the same day: right `false`, wrong `true`.
  - "addTime: one fitter may not overlap on one day, but may go back to back" tries 500-520, 539-600 and 420-481 against 480-540, never one that starts before and ends after.
- **`hollow-adv-3.ts`**, `addPart`: also refuses a unit price that is not a whole number.
  - `addPart(job, "ROPE", 3, 12.5)`: right `true`, wrong `false`.
  - "addPart: refuses a quantity of 0, a part of a unit, a price below 0 and a blank part number" only tries prices 350, -1 and 0.
- **`hollow-adv-11.ts`**, `jobLine`: prints `boatKey(job.boatId)`, not `job.boatId`.
  - A job whose boatId is `" kestrel"`: right `#1  kestrel routine started: Horn dead (£0.00)`, wrong `#1 KESTREL routine ...`.
  - Both `jobLine` cases use boat ids already in capitals.
- **`hollow-adv-12.ts`**, `canMove`: an urgent job may also go from `waiting` to `done`.
  - `canMove("waiting", "done", "urgent")`: right `false`, wrong `true`.
  - "canMove: every pair of states, for a routine job" pins all 49 pairs for `routine` only. For `urgent` the helper tries reported→started, reported→done, signed→started, and `nextStates` from `reported` and `signed`.
- **`hollow-adv-13.ts`**, `WorkLog.usePart`: refuses a job that is not open (`isOpen(job.state) &&` added).
  - `usePart` on a done job: right `true`, wrong `false`.
  - The two `usePart` cases use a reported job and a dropped job. `addPart` on a done job is pinned, but not through the log.

### Kept because it came close
`hollow-adv-10.ts` leaves out frozen jobs (signed and dropped). It failed one case only: "counts the jobs that are waiting, done and signed".

### Tried and failed, deleted
- Value as `qty * unitPence`: failed 7 cases.
- `summariseBoat` with handling taken once on the boat's parts: failed "summariseBoat: parts carry handling job by job; labour is in billed minutes and pence".
- `weekly` with `week <= toDay`: failed both `weekly` cases.

### `other.ts`: passed
A `forEach` over `this.jobs` with destructured lines, placed as the last member of the class. In a scratch copy a second right answer (first member of the class, `flatMap` and `reduce`) also passed.

### Its kind
It is a `beside` task. Everything a right answer needs is in the ask and `outline.md`: `private jobs: Map<number, Job> = new Map()` (line 376), `parts: PartLine[]` (38), `state: JobState` (33), `sku` and `qty` (15, 16), `"dropped"` (4). Nothing is only in a body or a comment. That `addPart` stores skus trimmed and in capitals is body-only, but a right answer does not need it.

Every member first line the outline prints is in the file exactly once, so any of them can anchor the edit. `holds.py check` confirms the reference edit quotes outline text.

One small doubt in the ask: "It gives one entry for each part number found on the jobs in the log", and only later "Leave out the jobs whose state is `dropped`". The check requires `partsBySku(log).has("HORN-12V")` to be `false` for a part only a dropped job has. A reader could give that part an entry of 0. I judge the first reading the natural one; a few words would remove the doubt.

## PF2 (inside): `WorkLog.move`

### Breaches of the task's own check (`W/tasks/PF2/check.test.ts`)

- **`hollow-adv-6.ts`** takes the latest finish to be the move to `done` with the greatest `day`, and on equal days takes the one further down the history, which is the older.
  - This is what a reader who does not know the history's order might write.
  - The ask says: "only the latest finish counts. So the person who finished it the first time may sign it, and the person who finished it last may not."
  - Input: done by Ann on day 14, reopened on day 14, done by Bo on day 14. Ann signs: right `true`, wrong `false`. Bo signs: right `false`, wrong `true`.
  - The check's only two-finisher fixture, `finishedTwice()`, finishes on days 14 and 16. No case has two finishes on one day by different people.
- **`hollow-adv-7.ts`** trims the stored finisher's name: `job.history.find((m) => m.to === "done")?.by.trim() === by`.
  - The ask says: "Compare the two names exactly as they are written, with no trimming and no change of case."
  - "compares the names exactly as written" varies only the signer (`"bo"`, `"Bo "`, `" Bo"`, `"Bob"`). The finisher is always `"Bo"` or `"Bob"`.
  - Input: finished by `" Bo"`. `"Bo"` signs: right `true`, wrong `false`. `" Bo"` signs: right `false`, wrong `true`.
  - Not a likely answer, but one side of the comparison is never tested.
- **`hollow-adv-8.ts`** puts the new refusal before the `job === undefined` test, written with `job!.history`.
  - `new WorkLog().move(99, "signed", 15, "Bo")`: right `false`, wrong throws `TypeError`.
  - The ask says a refusal "returns `false`" and "Every other move stays as it is".
  - The helper's "WorkLog.move: a job the log does not hold is refused" only tries `"booked"`, and the check never signs a job the log does not hold.
  - Not a likely answer.

### Breaches through the helper (right refusal, one other thing changed)

- **`hollow-adv-1.ts`**, `WorkLog.move`: a move to `dropped` also sets `closedDay`.
  - `closedDay` after a drop on day 13: right `-1`, wrong `13`.
  - No case of the helper or of any check reads `closedDay` after a move to `dropped`. I think this is the most likely of the helper breaches: `closedDay` reads as "the day the job closed".
- **`hollow-adv-2.ts`**, `WorkLog.open`: stores `by.trim()` in the first move.
  - `open(..., " Ann ")`: right history `by` is `" Ann "`, wrong `"Ann"`.
  - Every `by` the helper passes has no space at either end.
- **`hollow-adv-3.ts`**, `addTime`: checks the new entry against the last entry only (`job.time.slice(-1)`).
  - 480-540, then 600-660, then 500-520, one fitter, one day: right `false`, wrong `true`.
  - In the helper every refused overlap is tried while the job holds exactly one entry.
- **`hollow-adv-11.ts`**, `addTime`: keeps the fitter's name trimmed.
  - Fitter `" Ann "`: right keeps `" Ann "`, wrong keeps `"Ann"`.
  - "addTime: keeps a copy of the entry" uses names with no spaces.
- **`hollow-adv-12.ts`**, `WorkLog.logTime`: refuses a job that is not open.
  - `logTime` on a done job: right `true`, wrong `false`.
  - The `logTime` cases use a reported job only.

### Kept because it came close
`hollow-adv-9.ts` refuses anyone who has ever finished the job. It failed one case only: "after a second finish, the person who finished it first may sign".

### Tried and failed, deleted
- Comparing with `history[1].by`: failed 7 cases.
- `summariseWeek` with `closedDay <= end`: failed 3 cases.
- The date refusal against `job.openedDay`: failed 2 cases.

### `other.ts`: passed
A loop over the history that stops at the first move to `done`, placed after the date refusal. In a scratch copy two more right answers passed: one comparing `job.history[0]`, as `where.md` says, and one keeping the finisher in a private map of the log.

### Its kind: not an `inside` task as the brief defines it
The change can be written from the outline alone, without the body. I showed it. The text below replaces only the first line of `move` as the outline prints it on line 413, which is in the file exactly once. Graded by PF2's own check in a scratch copy, it passed:

```
EDIT: app/src/worklog.ts
<<<<<<< SEARCH
move(id: number, to: JobState, day: number, by: string): boolean {
=======
move(id: number, to: JobState, day: number, by: string): boolean {
        if (to === "signed") {
            const held = this.jobs.get(id);
            if (held !== undefined && held.state === "done" && held.history.length > 0) {
                const first = held.history[0];
                const last = held.history[held.history.length - 1];
                const finish = first.to === "done" ? first : last;
                if (finish.to === "done" && finish.by === by) {
                    return false;
                }
            }
        }
>>>>>>> REPLACE
```

- It needs only what the outline shows: `private jobs: Map<number, Job>`, `history: Move[]`, and `Move`'s `to` and `by`.
- It is right for every state the log can reach. A job can only be signed from `done`, a done job's latest move is its finish, and that move is at one end of the history whichever way the history is kept.
- A plain guess also passed: the same first-line anchor followed by `if (to === "signed" && this.jobs.get(id)?.history.find((m) => m.to === "done")?.by === by) { return false; }`. That guesses "newest first" and is right by luck. The other guess is `hollow-oldest.ts`. So an outline-only reader who guesses has about even odds.
- The cause: the change is a new refusal, and a refusal can stand at the top of the method. The only fact the body adds is the history's order, and that can be hedged.
- `where.md` says "An answer written from the outline alone has to do this" (quote body lines from a guess). That is not so.
- For the task to need the body, the change would have to alter what an existing statement of the body does, such as the closing-day rule or the date rule, so that nothing put after the first line can do it.

Everything a right answer needs is in the ask and `region.md`. The region shows the comment "The history is kept newest first" and the `unshift`. I found no second reading of the ask.

## PF3 (leans): `lateBy`, leaning on `weekOf`

### Breach of the task's own check (`W/tasks/PF3/check.test.ts`)

- **`hollow-adv-9.ts`** does not use `weekOf`. It has its own week, `Math.trunc((d + 2) / 7)`, and takes the difference.
  - It agrees with the reference from day -2 on, and is wrong before that.
  - `lateBy` with due day -3 measured on day 0: right `1`, wrong `0`. Due -10 measured on -9: right `1`, wrong `0`.
  - The check uses no day below 0. The helper does pin `weekOf` for days before day 0 ("weekOf: days before day 0"), so such days are within what the module handles.
  - It also goes against the ask's "I do not want a second idea of what a week is", which a behaviour check cannot see for days from -2 on.
  - A weak breach: due day -1 is `NO_DAY`, so days below 0 are at the edge.

### Breaches through the helper (right `lateBy`, one other function changed)

- **`hollow-adv-1.ts`**, `WorkLog.escalate`: `isFrozen(job.state)` in place of `!isOpen(job.state)`, so a done job can be escalated.
  - Escalating a done job from soon to urgent: right `[false, "soon"]`, wrong `[true, "urgent"]`.
  - "WorkLog.escalate: never lowers or repeats a priority, and leaves a closed or unknown job alone" only tries a dropped job.
- **`hollow-adv-2.ts`**, `boatsOf`: `.sort((a, b) => a.localeCompare(b))` in place of `.sort()`.
  - Boats `Zebra` and `Élan`: right `["ZEBRA","ÉLAN"]`, wrong `["ÉLAN","ZEBRA"]`. Also `A_B` and `AB`: right `["AB","A_B"]`, wrong `["A_B","AB"]`.
  - The helper's names are AVOCET, HERON and KESTREL.
  - Weak: the module's comment says "in alphabetical order", and the wrong order is arguably the more alphabetical. The mender may judge this not worth a case.
- **`hollow-adv-3.ts`**, `addTime`: compares fitters trimmed and without regard to case.
  - 480-540 by `"Ann"`, then 500-520 by `"ann"` on the same day: right `true`, wrong `false`.
  - "addTime: another fitter ... may overlap" uses `"Ann"` and `"Bo"` only.
- **`hollow-adv-4.ts`**, `WorkLog.move`: a move to `dropped` sets `closedDay`. The same change as PF2's `hollow-adv-1.ts`, kept here to show it passes a second check.
- **`hollow-adv-11.ts`**, `WorkLog.move`: refuses a blank `by` (`by.trim() === ""`).
  - `move(1, "booked", 11, "")`: right `true`, wrong `false`.
  - No case passes a blank `by`. `open` and `addTime` refuse blanks, so a guesser may add this.

### The natural wrong guess, in more forms: all failed, all deleted
Each of these failed the same four cases: "is 1 on every day of the next yard week", "is 2 in the week after that, and goes on by one a week", "turns over between Friday and Saturday, wherever in its week the due day is", and "measures a closed job on the day it closed, not on the day asked".

- `atWeek > dueWeek ? atWeek - dueWeek : 0`.
- `summariseWeek([], at).week - summariseWeek([], job.dueDay).week`.
- `weekOf` taken as an index and turned back into days: `Math.ceil((at - ((weekOf(job.dueDay) + 1) * 7 - 1)) / 7)`.

Also failed and deleted: `weekOf(at) > weekOf(job.dueDay) ? Math.ceil((at - job.dueDay) / 7) : 0` (3 cases), and `escalate` with `dueFor(priority, job.openedDay)` (2 cases). The check is strong against the guess.

### `other.ts`: passed
A loop that steps from `weekOf(at)` down to `weekOf(job.dueDay)` by 7 and counts. In a scratch copy `Math.max(0, Math.floor((at - weekOf(job.dueDay)) / 7))` also passed.

### One unfair spot: the check fails a right answer that gives `-0`
This answer is right in every case:

```ts
    const weeks = Math.ceil((weekOf(at) - job.dueDay) / 7);
    return weeks < 0 ? 0 : weeks;
```

- On a day in the due day's own week it returns `-0`, because `Math.ceil(-1 / 7)` is `-0`.
- It failed 5 cases. The runner said `AssertionError: expected [ 19, -0 ] to deeply equal [ 19, +0 ]` at `expect([day, mod.lateBy(job(), day)]).toEqual([day, 0]);`, and `expected -0 to be +0 // Object.is equality` at `expect(mod.lateBy(job({ dueDay: 18 }), 18)).toBe(0);`.
- It also failed the helper's two kept cases, "lateBy: 0 with no due day, on or before the due day, and for a dropped job" and "lateBy: a job closed on or before its due day is not late, whatever the day".
- The ask says "0 weeks late", and `-0 === 0`. So the check tests something the ask does not say.
- It is rare: an answer that keeps `Math.max(0, ...)` gives `+0`.
- A mend that does not make the check stricter: compare `mod.lateBy(...) + 0`, in the check and in the two helper cases.

### Its kind
- **Does the ask give the fact away?** No. It says "Use the yard week this file already works with for its weekly summaries. I do not want a second idea of what a week is." It names neither `weekOf`, nor Saturday, nor what `weekOf` returns.
- **Does `region.md` show it?** No. It holds the outline and lines 261 to 268, which are `lateBy` only.
- **Does the other declaration's first line show it?** No. `export function weekOf(day: number): number {` reads as well for an index as for a day. `week: number` in `WeekSummary` does not settle it.
- **Is the natural guess wrong?** Yes. `weekOf(at) - weekOf(job.dueDay)` gives 7 for 1, and `hollow-guess.ts` and my three forms fail.
- **Is the fact plain in the whole file?** Yes. The comment on lines 151 and 152 says "A week is known by the day number of its Saturday, and that is what this gives", and it shows again in `end = start + 7` and `week += 7`.
- **Would a careful reader of `region.md` see that the other declaration matters?** Yes. The ask sends the reader to the file's yard week, and the outline shows `weekOf`, `summariseWeek` and `weekly`.

Two cautions for whoever sorts the `region` arm's failures:

- **A careful region reader can be right without the fact.** Both of these passed the check in a scratch copy:
  - `const oneWeek = weekOf(7) - weekOf(0); return Math.max(0, Math.round((weekOf(at) - weekOf(job.dueDay)) / oneWeek));`
  - `let weeks = 0; while (weekOf(job.dueDay + 7 * weeks) < weekOf(at)) { weeks += 1; } return weeks;`
  
  `where.md` already names both roads and calls them unlikely. So a `region` failure here is not forced by the arm.
- **The fact has two outcomes.** A reader who guesses "`weekOf` gives the week's first day" divides by 7 and is right by luck. `summariseWeek(jobs, day)` and `weekly(fromDay, toDay)` take days, which may nudge a reader that way.

The change cannot be written from the outline alone. Which day a closed job is measured on, and the cases that give 0, are only in the body and its comment.

## The module, `W/files/worklog.ts`

- **Type check:** `tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler` exits 0 on the module, on each `reference.ts`, on each `other.ts` and on every `hollow-adv` file.
- **Format:** 492 lines, within a tenth of 500. No line over 120 columns, no tab, no import, no clock, no random number, and no line the bench reads as a mark.
- **`python3 bench/holds.py check W`** ends `all as they must be`, with 0 first lines cut. Each `plain.ts` is the module byte for byte. The asks are 126, 148 and 139 words.
- **Nothing changes from run to run.**
- **It reads as real code.** It has more than four conventions that show only in a body or a comment: the week known by its Saturday, the history newest first, every started quarter hour charged, handling rounded once for the job, half-open ranges in `summariseWeek`, and skus and boats kept in capitals.
- **Small things that are off but break no task.** The mender need not act on them.
  - `formatPence(-0.4)` gives `-£0.00`: the sign is taken before rounding.
  - `summariseBoat` throws a `TypeError` on a job whose history is empty (`job.history[0].day`).
  - `addTime` takes `NaN` minutes and `addPart` takes a `NaN` price.
  - `forBoat` compares `job.boatId === key`, where `summariseBoat` compares `boatKey(job.boatId)`.

### The helper as a whole
The brief wants someone who writes the file anew from its outline to fail it. It has at least two cases for every function and method, and it caught every moved end of a range and every turned order I tried: `summariseWeek`, `weekly`, the `move` date rule, `escalate`'s day, and `summariseBoat`'s handling.

Its 15 gaps fall into four groups:

- **Values it never passes:** pence that are not whole, names with spaces or another case, a blank `by`, a boat id not in capitals, names outside A to Z.
- **States it never tries through the log:** `escalate`, `usePart` and `logTime` on a done job; `closedDay` after a drop.
- **`canMove` beyond routine:** only four pairs for an urgent job.
- **`addTime` overlaps:** never more than one entry already there, never an entry that wraps another.

## Files I added

- `W/tasks/PF1/`: `other.ts`; breaches `hollow-adv-1`, `-2`, `-3`, `-6`, `-7`, `-8`, `-11`, `-12`, `-13`; close miss `hollow-adv-10`.
- `W/tasks/PF2/`: `other.ts`; breaches `hollow-adv-1`, `-2`, `-3`, `-6`, `-7`, `-8`, `-11`, `-12`; close miss `hollow-adv-9`.
- `W/tasks/PF3/`: `other.ts`; breaches `hollow-adv-1`, `-2`, `-3`, `-4`, `-9`, `-11`.

The scripts that made them, and the scratch copy where I graded the extra right answers, are outside W in SCRATCH/adv-worklog. The mender does not need them: every extra answer that matters is quoted above.