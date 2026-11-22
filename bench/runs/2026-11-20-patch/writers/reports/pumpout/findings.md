ADVERSARY REPORT: module `pumpout`, W = /home/build/patch/pumpout/set. Tasks PI1 (beside), PI2 (inside), PI3 (leans).

Nothing of the writer's was changed. I added only `tasks/<id>/other.ts` and `tasks/<id>/hollow-adv-<n>.ts`. Nothing was committed, and nothing under /home/user/Kung-Fu was edited.

LAST LINES
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 34 WRONG`. Every WRONG line is one of my `hollow-adv` files passing. Every reference, plain, writer's hollow and `other` line is `ok`.
- `python3 bench/holds.py check W` ends `all as they must be`.

COUNTS
- 34 breaching files: 14 in PI1, 10 in PI2, 10 in PI3. They are 16 different wrong answers: 9 pass the shared helper `checks/helpers-pumpout.ts` and are repeated in each task, and 7 are particular to one task.
- All three `other.ts` pass.

====================================================================
A. THE SHARED HELPER: 9 breaches, in every task
====================================================================
Each file is a right answer to the ask with one other function changed. All 9 pass all three checks.

File numbers: PI1 `hollow-adv-5` to `-13`; PI2 `hollow-adv-2` to `-10`; PI3 `hollow-adv-2` to `-10`, in this order.

1. `clock` (PI1-5, PI2-2, PI3-2). `if (minutes < 0)` in place of `if (minutes === NO_START)`: dashes for every time below 0. The helper asks `clock` only for 510, 605, 1010, 0, 1439 and `mod.NO_START`.
2. `clock` (PI1-6, PI2-3, PI3-3). The hour is wrapped with `% 24`: `clock(1440)` gives "00:00", the module gives "24:00". No helper case is at 1440 or over.
3. `topUp` (PI1-7, PI2-4, PI3-4). `if (count < 0)` in place of `if (count <= 0)`: buying 0 tokens on a day with no batch yet adds an empty batch `{bought: day, left: 0}`.
   - Helper case "topUp: nothing bought costs nothing and adds no batch" has `const held = wallet("Kestrel", [100, 5]); expect(mod.topUp(held, 0, 100)).toBe(0);`.
   - The 0 purchase is on day 100, the day of the last batch, so `last.left += 0` leaves the wallet equal.
   - A mend: ask it on another day, such as `mod.topUp(held, 0, 140)`.
4. `joinQueue` (PI1-8, PI2-5, PI3-5). `if (queue[place].service !== service && service !== "both")`: a boat waiting for one service that asks again for "both" keeps its one service; the module makes it "both".
   - The helper tries pumpout then water, water then pumpout, and both then water. It never tries one service then "both".
   - A mend: `joinQueue([waiting("Kestrel", "water", 540)], "Kestrel", "both", 610)` must leave "both".
5. `serve` (PI1-9, PI2-6, PI3-6). It passes over a head of the queue that has no room and serves the first boat behind it that fits. The module returns `undefined` and serves nobody ("The boat keeps its place").
   - Helper case "serve: a full day leaves the boat at the head and charges nothing" has `log = [visit("Kestrel", 130, 890, 6)]` and `queue = [waiting("Heron", "pumpout", 870), waiting("Dipper", "water", 871)]`.
   - The second boat does not fit either (871 rounds up to 890, which is taken), so both versions return `undefined`.
   - A mend: let the second boat fit, such as `waiting("Dipper", "water", 850)`. The module still gives `undefined` and leaves the queue.
6. `record` (PI1-10, PI2-7, PI3-7). `log.unshift({ ...visit })`: a copy goes into the log, so the visit `serve` returns is not the logged object.
   - The helper compares with `toEqual` only: `expect(log).toEqual([second, first])` and `expect(log).toEqual([made, earlier])`.
   - A mend: `expect(log[0]).toBe(second)`. This one is weak: it changes identity only.
7. `nextStart` (PI1-11, PI2-8, PI3-8). On a visit in the way it jumps to that visit's end, `start = endOf(inTheWay)`, in place of `start += SLOT_MIN`. With a logged visit off the grid it gives a start off the grid.
   - Every visit in the helper and in PI2's check starts on the grid.
   - A mend: `nextStart([visit("Kestrel", 4, 515, 1)], 4, 510, "water")` is 550 in the module and 535 in this file.
   - Such a visit can only get into the log through `record` called directly.
8. `topUp` (PI1-12, PI2-9, PI3-9). It joins any batch bought that day (`wallet.batches.find((b) => b.bought === day)`), not only the last one. It differs only for a wallet whose batches are out of order. Weak.
9. `spend` (PI1-13, PI2-10, PI3-10). It refuses a count below 0 (returns false); the module returns true and takes nothing. The helper has no `spend` with a count below 0. Weak: out of the sensible range.

Strength: 3, 4 and 5 are inside what the app would do and are the ones worth mending. 1, 2, 7 and 9 are at inputs the app does not make. 6 and 8 are identity or order only.

Helper cases that did catch a changed function, across the file (these files are deleted):
- `waitFor`: a boat not waiting gets 0. 1 case fails.
- `leaveQueue`: `splice(place)`. 1 case.
- `takings`: token visits counted. 1 case.
- `spend`: newest batch first. 3 cases.
- `endOf`: by the service's length. 4 cases.
- `isLive`: `<=` at the end of the life. 4 cases.
- `settle`: part in tokens. 2 cases.
- `nextStart`: `< CLOSES`. 1 case. Kept as PI1 `hollow-adv-15`, a near miss: it fails only "nextStart: the last visit of the day may end at closing time".
- `serve`: start looked for from OPENS. 3 cases.
- `topUp`: free token at the eleventh. 1 case.

The two cases PI2 skips lose nothing: all ten of the above fail in PI2 as well.

====================================================================
B. PI1 (beside): `expiringSoon`
====================================================================
BREACHES particular to PI1. All are about the ask's last sentence, "The wallet must not be changed." Only this check case tests it:

    it("leaves the wallet as it was", () => {
        const held = wallet([0, 3], [100, 4], [150, 5]);
        const before = copyOf(held);
        mod.expiringSoon(held, 170, 110);
        expect(held).toEqual(before);
    });

On day 170 no batch of that wallet is dead (batch 0 dies on day 180), none is empty, and they are oldest first.

- `hollow-adv-1.ts`: takes the batches already dead on `day` out of the wallet (`wallet.batches = wallet.batches.filter((b) => day < b.bought + TOKEN_LIFE_DAYS)`), then counts rightly. This is the strong one. The module keeps dead batches on purpose (line 156: "A dead one stays, for the refund the desk may still give on it").
- `hollow-adv-2.ts`: sorts `wallet.batches` in place by `bought`, then counts rightly.
- `hollow-adv-3.ts`: takes batches with nothing left out of the wallet, then counts rightly.
- A mend for all three: call it on a wallet that is out of order and holds a dead batch and an empty one, such as `wallet([150, 5], [0, 3], [100, 0])` on day 200.
- `hollow-adv-4.ts`: takes the batches to be oldest first and does `break` at the first batch bought after `day`.
  - It is wrong for `[[175, 5], [0, 3]]` on day 170 with a within of 10: it gives 0, and 3 is right.
  - Every wallet in the check is oldest first, such as `wallet([0, 3], [175, 5])`.
  - The ask says "how many of the wallet's tokens" and promises no order. The order is only in a body comment, line 137 (`// oldest batch first`). Weak: `topUp` makes such a wallet only when days go backward.
- `hollow-adv-16.ts`: a fault of the bench, not of this check.
  - The function is declared `: string` and returns a number. `tsc --strict` says `error TS2322: Type 'number' is not assignable to type 'string'`, and the check passes it.
  - The grader runs vitest only, which strips types.
  - No line in `check.test.ts` can catch this. The mender should delete this file, and the maintainer should decide whether grading runs tsc. It holds for every module.

Near miss kept: `hollow-adv-14.ts`, `Math.max(0, liveTokens(wallet, day) - liveTokens(wallet, day + within))`. It fails one case only, "does not count a batch bought after the day that is good on the day looked ahead to". This is the writer's `hollow-difference` with a clamp.

Wrong answers the check failed (deleted): a batch already dead counts (2 cases); a batch bought on `day` does not count (2); `>` at the first dead day (3); batches counted in place of tokens (4).

OTHER.TS: passed. Mine is a loop added at the end of the file, written before I read `reference.ts`. The check tests nothing the ask does not say.

KIND: it is a `beside` task.
- Everything a right answer needs is in the ask and `holds/outline.md`: `Wallet.batches`, `TokenBatch.bought`, `TokenBatch.left` and `TOKEN_LIFE_DAYS = 180` are outline lines 23 to 30 and 42.
- The life rule is only in the body of `isLive` (lines 119 to 122), and the ask says it in full: "from the day its batch was bought up to, but not on, the day `TOKEN_LIFE_DAYS` later", with the example of days 100 to 279.
- The ask also says what `bought` and `left` are. Nothing is left only in a body or a comment.
- The outline shows `119: function isLive(batch: TokenBatch, day: number): boolean {` and `liveTokens`. A reader may call them. `isLive(batch, day) && !isLive(batch, day + within)` is right. The `liveTokens` difference is the trap the ask closes ("A batch bought after `day` cannot be spent on `day`, so none of its tokens count"), and the check fails it.
- The reference edit has an empty SEARCH.

====================================================================
C. PI2 (inside): lunch closure in `nextStart`
====================================================================
BREACH particular to PI2:
- `hollow-adv-1.ts`: the closure holds on five days in seven only (`day % 7 < 5 && start < LUNCH_UNTIL && end > LUNCH_FROM`).
  - The ask says "shuts for lunch every day".
  - The check's case "shuts on every day" has only `mod.nextStart([], 3, 750, "water")` and `mod.nextStart([], 9, 720, "pumpout")`, and every other case is on day 4. Days 3, 4 and 9 give 3, 4 and 2 by `% 7`.
  - A mend: add days 0, 5, 6 and 13.
  - Weak: nothing in the ask or the file hints at weekdays.

Near misses kept, each failing one case only:
- `hollow-adv-11.ts`: blocked only when the start or the end is strictly inside the closure, so "both" from 12:10 to 13:10 gets through. It fails "gives no start whose visit would run into the closure".
- `hollow-adv-12.ts`: logged visits that start inside the closure no longer block. It fails "leaves a logged visit inside the closure alone, and it blocks as before".

Wrong answers the check failed (deleted):
- lunch looked at once before the loop (2 cases);
- returns 13:10 at once without looking at what is taken after lunch (3);
- NO_START for an ask before lunch (6);
- the closure pushed into the caller's log (6);
- first start after lunch 13:30 (6);
- `end >= 750` alone (3);
- `start <= 790` alone (7);
- a unit confused, `start + lengthOf(service) > 750`, slots taken for minutes (3).

One answer passed and is not a breach, so I deleted it: "start inside, or end inside or at 13:10". It differs from the reference only for a visit that starts before 12:30 and ends after 13:10. That needs more than 40 minutes, so only "both" (60 minutes), from a start strictly between 730 and 750, and the grid has none there.

OTHER.TS: passed, in two forms.
- In the body: on meeting lunch, `start = 790; continue;`. It passed the first official run. It is not the file kept.
- The file kept as `tasks/PI2/other.ts`: written from the outline alone (see KIND).
- The check tests nothing the ask does not say. I found no second reading of the ask.

KIND: everything a right answer needs is in the ask and `region.md`. But the change CAN be written from the outline alone, so by the brief's words ("If so it is not an `inside` task") it is not one. There are two ways, and both pass the check.

(a) Two edits that quote only the first line the outline prints. `small.parse_edits` and `small.apply_edits` gave `['applied', 'added at the end']`, and the result is byte for byte `tasks/PI2/other.ts`:

    SEARCH:  export function nextStart(log: Visit[], day: number, from: number, service: Service): number {
    REPLACE: function nextStartNoLunch(log: Visit[], day: number, from: number, service: Service): number {
    then, with an empty SEARCH:
    export function nextStart(log: Visit[], day: number, from: number, service: Service): number {
        // Lunch, 12:30 up to 13:10, holds the point as a visit of two slots would.
        const lunch: Visit = { boat: "", service: "pumpout", day, start: 750, slots: 2, tokens: 0, paidPence: 0 };
        return nextStartNoLunch([...log, lunch], day, from, service);
    }

(b) One edit whose SEARCH is that same first line and whose REPLACE is the line and a guard that calls the function again with the lunch visit added to a copy of the log. The old body is never quoted. It passed all 69 cases, run in the scratchpad.

What both take on trust: that a logged visit blocks from its start up to, not including, `start + slots * SLOT_MIN`. The outline's `endOf(visit: Visit)`, `slots` and `SLOT_MIN = 20` suggest it, and the ask says logged visits "block a start just as they do now".

What this means for the run:
- The 27B is unlikely to do this. A ceiling model in the outline arm may. A pass there must be read before it is counted as "the outline was enough".
- Any `inside` change that can be said as "the old function, on changed arguments" has this way round. To close it the change would have to alter something inside the loop that a caller cannot reach.
- I mended nothing.

====================================================================
D. PI3 (leans): `visitsOf` with `latest`, leaning on `record`
====================================================================
BREACH particular to PI3:
- `hollow-adv-1.ts`: when `latest` is given it returns copies of the visits (`.slice(0, latest).map((v) => ({ ...v }))`), not the logged ones.
  - The ask says the result holds "the ones of that boat that were recorded most recently".
  - Every check line compares with `toEqual`, such as `expect(mod.visitsOf(log, "Kestrel", 2)).toEqual([log[0], log[2]]);`.
  - A mend: `expect(mod.visitsOf(log, "Kestrel", 2)[0]).toBe(log[0])`.
  - Weak: identity only.

The natural wrong guess, in four forms, all failed by the check at an assertion:
- plain `all.slice(-latest)` (3 cases; deleted);
- the same with 0 guarded: kept as `hollow-adv-11.ts`. It fails "gives the boat's most recently recorded visits, in the log's order" and "goes by when a visit was recorded, not by its day or start";
- a loop from the end of the log with the results put back in the log's order: kept as `hollow-adv-12.ts`. It fails the same two;
- the last `latest`, turned round (3 cases; deleted).

Other wrong answers the check failed (deleted): the first `latest` of the whole log and then the boat's (2 cases); the right visits oldest first (3); the log sorted in place by day and start (4, with "leaves the log as it was").

OTHER.TS: passed. Mine is a loop over the log that stops when it has enough, written before I read `reference.ts`. The check tests nothing the ask does not say: `latest` of 0, left out, given as `undefined`, and more than the boat has are all in the ask.

KIND: it is a `leans` task.
- The ask does not give the fact away. It says "recorded most recently, in the order the log holds them" and "Every visit gets into the log through this module's own function for recording one, and nothing moves it afterwards". It never says which end is new, and `record` is not in a code span.
- `region.md` does not show it: after the outline it holds lines 174 to 176 only, `return log.filter((v) => v.boat === boat);`.
- The other declaration's first line does not show it: `170: export function record(log: Visit[], visit: Visit): void {`.
- The natural guess (a log is added to at its end, so take the last ones) is really wrong.
- The whole file shows the fact plainly, line 171: `log.unshift(visit); // newest first: the desk screen shows the top of the log`.
- A careful reader of `region.md` would see that `record` matters: the ask's sentence about "this module's own function for recording one" points at outline line 170. A `Visit` has no field for when it was recorded, so that reader cannot hedge.
- One note. The named declaration's own lines are not needed. One edit that quotes only the outline's first line of `visitsOf` and adds `if (latest !== undefined) { return visitsOf(log, boat).slice(0, latest); }` passes all 68 cases. The same edit with the natural guess fails the two cases above. So an outline-only reader fails PI3 on the fact alone, not for want of the body.

====================================================================
E. THE MODULE
====================================================================
- Nothing broken, and nothing that changes from run to run: no clock, no random number, no import.
- `tsc --strict` passes the module, the three references and the three `other.ts`.
- 201 lines, no line over 120 columns, no line the bench reads as a mark. Each `plain.ts` is the module byte for byte. The asks are 159, 155 and 159 words.
- `holds.py check` reports no outline line cut (`src/pumpout.ts 0`).
- It reads as real code. More than four conventions are only in bodies:
  - `lengthOf` is in slots;
  - the grid is counted from OPENS;
  - a visit is half open;
  - a batch's life is half open;
  - batches are oldest first;
  - every tenth token is free;
  - an emptied batch goes and a dead one stays;
  - the log is newest first;
  - asking again makes "both";
  - a boat not waiting gets a newcomer's wait.
- Two things for the mender to know, neither a fault:
  1. `SLOTS` and `TOKENS` (lines 45 and 46) hold the same numbers, `{ pumpout: 2, water: 1, both: 3 }`. A file that uses one table for the other behaves the same, so no check can tell them apart.
  2. `serve` looks for a start from `next.since`, the time the boat joined, and takes no "now". A boat served late could get a start in the past. It is fixed and pinned, only a little odd as real code.
- The helper has 62 cases with at least two for every function, and pins every convention above. Its gaps are the nine in section A.

FILES
- Breaches and near misses: `W/tasks/PI1/hollow-adv-1.ts` to `-16.ts` (14 and 15 are near misses that fail; 16 is the type fault), `W/tasks/PI2/hollow-adv-1.ts` to `-12.ts` (11 and 12 fail), `W/tasks/PI3/hollow-adv-1.ts` to `-12.ts` (11 and 12 fail).
- Right answers: `W/tasks/PI1/other.ts`, `W/tasks/PI2/other.ts` (the outline-only form), `W/tasks/PI3/other.ts`.
- My generators and run logs are in SCRATCH/adv-pumpout/ (`gen_other.py`, `gen_adv.py`, `finish.py`, `final-list.txt`, `final-run.txt`, `prologue-PI2.ts`, `prologue-PI3.ts`). They are not part of the set and may be cleared.