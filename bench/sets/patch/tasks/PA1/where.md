# PA1, beside: `berthsFor`

**The right change.** A new exported function `berthsFor(boat, berths, needPower)` anywhere at the top level of `src/moorings.ts`. The reference adds it at the end of the file, after `boardLine`, which ends at line 146. It filters `berths` to those that are free, that `fits(boat, berth)` accepts and, when `needPower` is true, that have `power`. It sorts that new list by `length`, shortest first, with a stable sort, and returns the ids.

**What it needs of the file.** Only what the outline shows: `Boat`, `Berth` and its members `id`, `length`, `power` and `boatId`, the type `BerthId`, and `fits(boat: Boat, berth: Berth): boolean` at line 49. The ask says what "free" means (`boatId` is `""`). In the file that is only in the body of `isFree` (line 42) and in a comment at line 18. The fit rule is only in the body of `fits` (line 51): the boat's length plus 60 must be no more than the berth's length, and the boat's beam must be strictly less than the berth's. A right answer calls `fits` and does not need the rule.

**What a wrong answer is likely to do.**

- Write its own fit rule in place of a call to `fits`: `boat.length <= berth.length`, or a beam that may equal the berth's. `hollow-ownrule.ts`. The check's case "fits the boat as fits does" fails it.
- Sort `berths` itself (`berths.sort(...)` before the filter), which changes the caller's list. `hollow-sorted.ts`.
- Leave the berths in quay order. `hollow-order.ts`.
- Read `needPower` false as "only berths without power". `hollow-power.ts`.
- Treat a boat that already lies at a berth as `assign` does, and give `[]` for it (`hollow-berthed.ts`), or count the berth it lies at as free (`hollow-ownberth.ts`). A reader of the whole file sees `assign` refuse such a boat, and a reader of the outline does not. The ask says it makes no difference. The case "gives the same berths for a boat that lies at a berth already, and takes its berth as taken" fails both.
- Quote a body line it does not hold, so that the edit is refused. An answer from the outline alone can add at the end of the file with an empty SEARCH, or quote a first line.
- Write the whole file anew from the outline. `unchanged` fails it wherever a guessed body differs. `hollow-lost.ts` is the reference with `lastMove` reading the log from its other end.
