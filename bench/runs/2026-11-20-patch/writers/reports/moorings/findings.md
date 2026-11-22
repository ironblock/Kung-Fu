ADVERSARY REPORT: module `moorings`, W = /home/build/patch/moorings/set. Tasks PA1 (beside), PA2 (inside), PA3 (leans).

I changed none of the writer's files. I added only `tasks/<id>/other.ts` and `tasks/<id>/hollow-adv-<n>.ts`.

Last lines as W stands now:
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 14 WRONG`. All 14 are my kept breaches; every reference, plain, other and writer's hollow is `ok`.
- `python3 bench/holds.py check W` ends `all as they must be`.
- `tsc --strict` passes on the module, the three `reference.ts`, my three `other.ts` and every kept `hollow-adv` file.

Summary: 14 breaches kept (7 in PA1's dir, 3 in PA2's, 3 in PA3's, plus... see lists: PA1 has 8, PA2 has 3, PA3 has 3). 5 are in a task's own check, 9 are in the regression helper `checks/helpers-moorings.ts`. All three `other.ts` pass. No check tests something its ask does not say. One ask (PA1) has an untested second reading. PA2 is thin as an `inside` task. PA3 is a sound `leans` task.

Names used in the cases below, as in the checks: `heron` = {id "heron", length 1440, beam 208}; `kestrel` = {id "kestrel", name "Kestrel", length 1700, beam 208}; `berth(id, length, beam, power = false, boatId = "")`; `move(day, boatId, from, to)`; `quay()` = Q1 1500x230, Q2 1800x230 power holding "kestrel", Q3 1800x420 power, Q4 2200x420, Q5 1800x420. I ran every case I propose: each passes on the reference and on `other.ts`, and fails the files I name.

==== PA1 (beside, `berthsFor`) ====

other.ts: PASSED (forEach, own index as tie-break, placed before `berthOf`).

Breaches in PA1's own check (`tasks/PA1/check.test.ts`):
- `hollow-adv-1.ts`: sort is `a.length - b.length || a.beam - b.beam`. Berths of one length come narrower beam first, against the ask's "Berths of the same length keep the order they have in `berths`". The check's only free ties (B and D, P and N, Q3 and Q5) have equal beams.
- `hollow-adv-2.ts`: adds `if (berthOf(berths, boat.id)) return [];`. Gives nothing for a boat that already lies at a berth. The ask's "Those are the berths that are free, that the boat fits ..., and, when `needPower` is true, that have power" has no such clause. No case in the check passes a boat that is in the list (`mixed()` holds "someone", and `quay()` is only asked about boat "k").
- `hollow-adv-3.ts`: `(isFree(berth) || berth.boatId === boat.id)`. Counts the boat's own berth as free. Same hole.
- `hollow-adv-4.ts`: sorts by `a.length * a.beam`. Orders by area, not "the shortest berth first". In every check list the shorter berth is never the wider one.
Cases that fail them:
- `expect(berthsFor(heron, [berth("W", 1600, 420), berth("N", 1600, 230)], false)).toEqual(["W", "N"])` fails adv-1 and adv-4.
- `expect(berthsFor(heron, [berth("L", 1800, 230), berth("S", 1600, 420)], false)).toEqual(["S", "L"])` fails adv-4.
- `expect(berthsFor(kestrel, quay(), false)).toEqual(["Q3", "Q5", "Q4"])` fails adv-2 and adv-3.

An ask with two readings (mild), tied to adv-2 and adv-3: "the berths the boat could be given right now". A reader of the whole file sees, in `assign`, `// one boat, one berth: a boat that is on the quay already is moved with shift` and `if (berthOf(berths, boat.id)) return false;`, and may answer `[]` for a berthed boat. A reader of the outline cannot know that. The next sentence of the ask defines the set by three conditions, so the reference's reading is the stated one. But if the kestrel case is added to the check, the ask should say it in a few words (for example that it makes no difference whether the boat lies at a berth already), or the `whole` arm is the only arm that can be led astray.

Breaches in the regression helper, ask done right (kept in PA1's dir):
- `hollow-adv-5.ts`: `bestBerth` picks least area: `berth.length * berth.beam < best.length * best.beam`. (A beam-first rule also passes; not kept.)
- `hollow-adv-6.ts`: `bestBerth` breaks a tie of length by the narrower beam, not by quay order.
- `hollow-adv-7.ts`: `bestBerth` counts the boat's own berth as free.
- `hollow-adv-8.ts`: `quayLoad` gives the right number but sorts the caller's `berths` by length. Only `fits` and `bestBerth` have a "changes no ..." case.
Cases that fail them (for the helper):
- `const berths = [berth("L", 1800, 230), berth("S", 1600, 420)]; expect(mod.bestBerth(heron, berths)).toBe(berths[1]);` fails adv-5.
- `const berths = [berth("W", 1800, 420), berth("N", 1800, 230)]; expect(mod.bestBerth(kestrel, berths)).toBe(berths[0]);` fails adv-5 and adv-6.
- `const berths = quay(); expect(mod.bestBerth(kestrel, berths)).toBe(berths[2]);` fails adv-7.
- `const berths = quay(); mod.quayLoad(berths); expect(berths).toEqual(quay());` fails adv-8.

Near miss kept, the check fails it: `hollow-adv-9.ts` (tie broken by id). It fails only "keeps berths of one length in the order the list has them" and "with needPower false, gives berths with power and without".

Kind: sound. Everything a right answer needs is in the ask and `holds/outline.md`: `Boat`, `Berth` with `id`, `length`, `power`, `boatId`, `BerthId`, and line 49 `export function fits(boat: Boat, berth: Berth): boolean {`. Only in a body or comment, and not needed: the fit rule (line 51, a right answer calls `fits`), and what "free" is (line 42 and the comment at line 18; the ask says it: "A berth is free while its `boatId` is `\"\"`"). One note that is the tool's and not the writer's: the outline prints interface members and constants not as the file has them (`  7:   id: string` for `    id: string;`, `ROPE_ROOM = 60` for `const ROPE_ROOM = 60;`). An edit anchored on a member line as printed is refused or matches more than once. An empty SEARCH or any function's first line works.

==== PA2 (inside, `stayFee`) ====

other.ts: PASSED (first week and later nights summed apart, `Math.min`/`Math.max`).

Breaches in PA2's own check: none. Nine wrong readings all failed: discount from the seventh night, from the ninth, rounded up, in whole weeks only, capped at 21 later nights, a stay of no night charged one night, the leaving day counted, and the writer's five.

Two answers pass that are not wrong, so I did not keep them (no check on behaviour can fail them):
- `Math.round(full - later * LONG_STAY_OFF / 100)`, rounding the bill and not the discount. Every nightly rate is a multiple of 5 pence (45, 70, 250), so a tenth of the later total always ends in .0 or .5, and rounding the bill half up equals rounding the discount down.
- `Math.floor(later / LONG_STAY_OFF)`, dividing by 10 where 10 percent is meant. Equal while the constant is 10.

Breaches in the regression helper, ask done right (kept in PA2's dir):
- `hollow-adv-1.ts`: `berthOn` takes the boat's entry of the latest day at or before the day, not the first by place. `lastMove` has "goes by place in the log and not by day"; `berthOn` has no such case, and every `berthOn` log is in day order. Case: `const log = [move(4, "heron", "", "Q1"), move(9, "heron", "Q3", "")]; expect(mod.berthOn(log, "heron", 20)).toBe("Q1");`
- `hollow-adv-2.ts`: `assign` puts its entry in day order (`log.findIndex((m) => m.day <= day)` then `splice`), not at the front. Every pinned log gets a move newer than its front entry. This is the very fact PA3 leans on, and the helper does not tell "at the front" from "in day order". Case: `const log = [move(20, "kestrel", "", "Q2")]; mod.assign(quay(), heron, "Q3", 12, log); expect(log).toEqual([move(12, "heron", "", "Q3"), move(20, "kestrel", "", "Q2")]);`
- `hollow-adv-3.ts`: `boardLine` gives the right line but sorts the caller's `boats` by id. Case: `const boats = [heron, kestrel, barge]; mod.boardLine(berth("Q2", 1800, 230, true, "kestrel"), boats); expect(boats).toEqual([heron, kestrel, barge]);`

Near miss kept, the check fails it: `hollow-adv-4.ts` (at most 21 later nights discounted). Only the thirty-night line of "works the discount out once on the total of the later nights, and rounds it down" fails it.

Kind: an `inside` task, but thin. Everything is in the ask and `holds/region.md`. From the outline alone the change can be written and applied: an edit whose SEARCH is the first line `export function stayFee(boat: Boat, onPower: boolean, fromDay: number, toDay: number): number {` and whose REPLACE is a whole new `stayFee` followed by a new first line under another name, which leaves the old body as a dead function. I ran that file. With `Math.floor` it PASSES all 56 cases. With `Math.round` or `Math.ceil` it fails two cases ("takes the discount off the eighth night only" and "works the discount out once ..."). The outline shows `LONG_STAY = 7`, `LONG_STAY_OFF = 10` and `nightlyFee`. So all the body hides from an outline reader is the ask's "rounded the way it is rounded now", a choice of three, plus `toDay - fromDay` and the `nights <= 0` guard, where the natural guess is right. The natural guess for money, `Math.round`, is wrong, so the task does turn on the body. But a subject in `outline-1` that guesses `floor` passes, and question 5 will count that as the outline being enough. Either accept that and note it in `where.md`, or make the change need more of the body.

==== PA3 (leans, `shift`) ====

other.ts: PASSED (frees and fills by hand, `log.splice(0, 0, ...)`).

Also pass, rightly, so the check is fair to them: release and assign called with throwaway logs and then `log.unshift`; assign left to log and its new entry found by identity and given its `from`; and the writer's "right without knowing the fact" answer (both calls on the caller's log, the two new entries found by a Set taken before, one entry spliced in their place).

Breaches in PA3's own check:
- `hollow-adv-1.ts`: the wrong guess in another form. `const at = log.findIndex((m) => m.day <= day); log.splice(at === -1 ? log.length : at, 0, {...})`. It reads "newest first" as day order, not "at the front". In every check case the shift's day is at least the day of the log's front entry.
- `hollow-adv-2.ts`: `log.unshift(...)` and then `log.sort((a, b) => b.day - a.day)`. It reorders the old entries. Same hole, and no check log is out of day order.
One case fails both, and the near miss too: `const log = [move(20, "heron", "", "Q1"), move(9, "kestrel", "", "Q2"), move(14, "heron", "Q4", "")]; mod.shift(quay(), kestrel, "Q5", 15, log); expect(log).toEqual([move(15, "kestrel", "Q2", "Q5"), move(20, "heron", "", "Q1"), move(9, "kestrel", "", "Q2"), move(14, "heron", "Q4", "")]);` It is within the ask's "logged in the same way as every other move", once the helper pins that `assign` and `release` log at the front whatever the day.

The natural wrong guess in its other forms all FAIL, as they should: `log[log.length] = ...`; push then a stable sort by day; assign left to log and then `log[log.length - 1].from = ...`; day order after the entries of that day (kept as near miss `hollow-adv-4.ts`, which fails "keeps the log in step with the moves made after it" and "is the boat's last move, and says where the boat lay that day"). Also failed: no fit test on the new berth; the new berth filled before the old one is looked up.

Breach in the regression helper, ask done right (kept in PA3's dir):
- `hollow-adv-3.ts`: `release` puts its entry in day order, not at the front. The twin of PA2's `hollow-adv-2`. Case: `const log = [move(20, "kestrel", "", "Q2")]; mod.release(quay(), "kestrel", 12, log); expect(log).toEqual([move(12, "kestrel", "Q2", ""), move(20, "kestrel", "", "Q2")]);`

A passing answer I did NOT keep, and advise not to pin: the reference with `berths.find((b) => b.boatId === boat.id)` in place of `berthOf(berths, boat.id)`. It differs only for a boat whose id is `""`: it "finds" a free berth and shifts, where the module refuses, since `berthOf` returns undefined for `""` (line 66). It is a likely way to write the change by hand. A case for it would make PA3 lean on a second body the `region` reader cannot see, the guard in `berthOf`, and failures on it would be counted against the wrong fact.

Kind: sound.
- The ask does not give the fact away. Its words are "That entry must be logged in the same way as every other move, so that the log reads as it always has." Its code spans are `shift`, `src/moorings.ts`, `from`, `to`. Neither `assign` nor `release` is in a span, and `holds.py sizes` gives the region names as `shift` alone.
- `region.md` does not show it. It holds the outline and lines 89 to 95. The outline prints no comment, so line 22, "The log is kept newest first.", is absent. The first lines of `assign` and `release` say only `log: Move[]`.
- The natural guess is wrong: `hollow-guess.ts` (`log.push`) fails three cases.
- The fact is plain in the whole file: line 22, line 76 `log.unshift({ day, boatId: boat.id, from: "", to: berth.id });`, line 85 `log.unshift({ day, boatId, from: berth.id, to: "" });`.
- A careful reader of `region.md` sees the other declarations matter: `shift` hands `log` to `release` and to `assign`, and the ask says the entry must be logged as every other move is.
- As the writer's `where.md` says, a reader can be right without the fact by letting the two calls place the entries. I confirmed two such answers pass. That is a real way round for a strong reader of `region`. It still needs the reader to see that the calls decide the end.

==== The module ====

- 146 lines. `tsc --strict` passes. No import, clock or random number. Nothing changes from run to run. No line over 120 columns, no line the bench reads as a mark. The outline shows no first line cut.
- It reads as real code.
- One oddity, not a fault for the run: `assign(berths, boat, ...)` with a boat whose id is `""` returns true and logs a move, and the berth stays free, because `berthOf` gives undefined for `""`. A variant that refuses such a boat passes the helper. I did not keep it: I would not pin an oddity.
- The helper is strong against a file written anew from a guess. All of these failed: `fits` strict on length, `fits` allowing an equal beam, `berthOn` with `<`, `quayLoad` rounded down, `nightlyFee` with `>=` on the beam or with floor plus one, `assign` with push, `boardLine` with one space, `berthOf` without its empty-id guard, `lastMove` by day, `bestBerth` first fit, `shift` logging its two entries the other way round.
- Its holes are of three sorts: (1) `bestBerth` is never offered a short wide berth against a longer narrow one, a tie with unlike beams, or a boat that already lies at a berth; (2) no log is out of day order and no move is older than the log's front, for `berthOn`, `assign`, `release`, and PA3's `shift`; (3) `quayLoad`, `boardLine`, `berthOf`, `lastMove` and `berthOn` are never tested for leaving their arguments alone.

Passing variants I did not keep, because they differ only where the module's own rules are already broken or are far-fetched. Say if you want them as files:
- `berthOf` returning the last berth that holds a boat; `release` freeing every berth that holds it (one boat at two berths).
- `metres` rounding to a whole centimetre first (sizes that are not whole numbers).
- `boardLine` showing the id of a known boat whose name is empty.
- `nightlyFee` with a least charge of 10 metres (every boat in the helper is 14 m or longer).
- In PA1: lengths compared as text (every length in the check has four digits); a berth whose id is `""` left out; a second berth with a repeated id left out; a tie broken by spare beam.
- In PA3: a shift that drops the boat's earlier shift of the same day from the log.
- Equal in behaviour, so not wrong: PA1's sort with `(a.length < b.length ? -1 : 1)` (stable in this engine; the `<=` form fails); `stayFee` as `Math.ceil(full * 90 / 100)`; `quayLoad` as `Math.floor(x + 0.5)`.

Not done: I did not judge how likely the 27B is to write any of these. The breaches in a task's own check are unlikely answers, except PA1's adv-2 and adv-3, which follow from a fair reading of the whole file.

My scratch files (generator, single-answer probe, the witness cases as a vitest file) are in SCRATCH/adv-moorings and nothing in W depends on them.