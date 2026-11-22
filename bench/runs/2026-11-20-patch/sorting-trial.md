# The sorting rule, tried on made-up failures

Written by Claude Opus 5.5 on 2026-11-22, before any try. `AGENTS.md` asks that the rule that sorts failures be tried before the run, on a made-up failure of each kind expected, and that two readers apply it the same way.

Every failure below is made up. The file, `src/locks.ts`, does not exist. Each failure gives what the arm held, what the reply did, and what the bench said. Each round, I wrote my sorts down before any reader saw the failures. Each reader was given the rule ("How each failure is sorted" in `README.md`, as it stood that round) and the failures, and nothing else.

## Round 1

Nine failures, A to I, and the rule's first words, as committed in cbf4347. One fresh reader.

It sorted eight as I had. **It sorted F the other way.** F was a SEARCH that kept the outline's line number before the line. I had sorted it the subject's: the line was held, and the number is not part of it. The reader sorted it the arm's, by the rule's own example, "a SEARCH copies a line as the outline prints it, and the file has it another way". It said it was not sure. The example was meant for a member the outline prints without `readonly`, and its words covered both.

It also found faults in my failures and in the rule:

- **My failure C could not happen as written.** The reply tested `end >= 23`, and a passage that ends at 23:20 has `end` 1400, so the case would have passed. And the region held `end >= 1320`, which shows the unit, so the fact was held after all.
- **"Hold" had two readings:** what the message states, or also what can be worked out from it.
- **The test's and the arm's had no order** when both could apply.
- **"The way round" was used and not defined,** and the clause named only the outline.
- **"The message holds" and "the arm held" were two terms for one thing.**

What changed, the same day: the rule now says what the message holds, and that a fact that can be read off held text without a guess is held. It puts the test's first. It settles the line number, says what the server sent is the reply, and defines the way round for every arm. The example under the arm's now speaks of a line the outline prints otherwise than the file has it. My failures were rewritten so that each can happen, and four were added: J to M.

## Round 2

Thirteen failures, A to M, and the rule as mended after round 1, as committed in 5031e46. Three fresh readers, each alone.

**38 of the 39 sorts were mine.** The split was on M. Two readers sorted it the arm's, one the subject's, and two of the three said they were not sure. M is a reply that takes the way round and gets the night fee wrong, because it does not know that the old body doubles at night. Two readers pointed out that M's ask says night should pay "half as much again as by day, not twice". The words "not twice" tell the reader that night pays twice now. So the fact was held, and by the rule M is the subject's. **My own sort, the arm's, was wrong.** I had not seen that my ask gave the fact away. One reader sorted it the arm's without seeing it either.

All three found that **my failure E could not happen:** with a whole number of locks at 150 pence each, no half penny comes up, so no case could test one. They also found smaller faults: H needs the bench to take a whole file, which the failures did not say it does; K needs the check to run the code without checking its types; J's "right in every character but one" miscounts a tab for four spaces; G did not say how the outline indents a member.

The words they found loose, and what changed the same day:

- **Which part fails.** The failing part is now the refused edit whole, so that a second slip inside it does not change the sort.
- **Held.** The rule now says to read the whole message, the ask too, before saying a fact was not held. That is the slip in M, mine and one reader's.
- **An open point.** Where the ask leaves a point open, every choice on it does what the ask says. And the ceiling says where to look first; it does not decide the sort.
- **The order.** Cut off first, then the test's, then the other two.
- **`name`.** It held no text of the file, so a failure that rests on that text is the arm's. A failure that rests on the path, the ask or the form of the reply is sorted like any other. The words before said every failure in `name` was the arm's.

For round 3, E was rewritten so that a half penny comes up, the other faults were mended, and two failures were added: N, which is M with an ask that does not give the fact away, and O, a `name` reply that gets the path wrong.

## The made-up file, for round 3

```ts
const LOCK_FEE_PENCE = 150;

export interface Lock {
    readonly name: string;
    readonly rise: number;
}

// Minutes from midnight. A passage that runs past midnight goes on counting: 1500 is 01:00 the next day.
function endOf(start: number, locks: number): number {
    return start + locks * 20;
}

export function lockFee(locks: number, atNight: boolean): number {
    if (locks === 0) {
        return 0;
    }
    return atNight ? locks * LOCK_FEE_PENCE * 2 : locks * LOCK_FEE_PENCE;
}

export function passageCost(start: number, locks: number): number {
    // No night fee yet.
    return lockFee(locks, false);
}
```

The file is `app/src/locks.ts`, and every message names it by that path. A reply may give edits, or write a whole file as `FILE: app/<path>` and its content; the bench takes both. The check runs the code and does not check its types.

Its outline, as the arms `outline` and `outline-1` hold it, prints each line with its line number before it, as `13: export function lockFee(locks: number, atNight: boolean): number {`. The message says that each line is a line number and the first line of a declaration or of one of its members. It prints `1: const LOCK_FEE_PENCE = 150`. It prints `3: export interface Lock {`, and under it the members as `4:   name: string` and `5:   rise: number`: two spaces, without `readonly` and without the semicolons. It prints `9: function endOf(start: number, locks: number): number {`. It prints no body and no comment. The region of a task holds the outline, then the lines of each declaration the ask names, with the comment directly above it, as they are in the file.

## The failures, for round 3

**A.** Arm `outline-1`. The ask: change `lockFee` so that a passage at night pays half as much again as by day, not twice. The reply has one edit. Its SEARCH is `    return LOCK_FEE * locks;`. The bench: refused, no such text.

**B.** Arm `region`, the same task. The region holds the lines of `lockFee`. The reply has one edit. Its SEARCH is `    return atNight ? locks * LOCK_FEE * 2 : locks * LOCK_FEE;`. The bench: refused, no such text.

**C.** Arm `region`. The ask: change `passageCost` so that a passage that ends after 23:00 pays the night fee, working out when it ends as the file already does. The region holds the lines of `passageCost`, and not those of `endOf`. The reply's edit applies. It writes `lockFee(locks, endOf(start, locks) > 23)`, reading the end as an hour. The check fails "a passage that starts at 21:00 with three locks ends at 22:00 and pays the day fee".

**D.** Arm `whole`. The ask as in A. The reply's edit applies. It rewrites `lockFee`, and the new body throws when `locks` is 0. The check fails the unchanged case "lockFee: no locks cost nothing".

**E.** Arm `whole`. The ask: add `export function offPeakFee(locks: number): number` that gives the day fee in pence with 15 per cent off, "to the nearest penny". One lock is then 127.5 pence before rounding. The reply's edit applies, and it returns `Math.round(locks * LOCK_FEE_PENCE * 85 / 100)`, which gives 128 for one lock. The check fails "offPeakFee: one lock is 127 pence", because the reference rounds a half penny down. The ceiling's `whole` try failed the same case.

**F.** Arm `outline`. The ask: add a function beside `lockFee`. The reply's SEARCH is `13: export function lockFee(locks: number, atNight: boolean): number {`, the line number and all. The bench: refused, no such text.

**G.** Arm `outline`. The ask: add a member `readonly chamber: number` to `Lock`. The reply's SEARCH is `    rise: number`: four spaces, then the member as the outline prints it. The bench: refused, no such text, because the file has `    readonly rise: number;`.

**H.** Arm `name`. The reply writes a whole file, `FILE: app/src/locks.ts`, from a guess. The check fails twelve unchanged cases.

**I.** Arm `region`. The reply is cut off by its length limit. Before the cut it had written one edit, whole. Its last 9,000 tokens are the words "Wait, let me reconsider the fee" and a near copy of the same paragraph, again and again.

**J.** Arm `region`. The ask as in A. The reply's SEARCH is the `return atNight ? ...` line of `lockFee` as the region holds it, except that it begins with a tab where the file and the message have four spaces. The bench: refused, no such text.

**K.** Arm `outline-1`. The ask as in A. The reply takes the way round. Its first edit changes the first line of `lockFee`, as the outline prints it less the number, to `function lockFeeByDay(locks: number, atNight: boolean): number {`. Its second edit has an empty SEARCH and adds `export function lockFee(locks: number, night: boolean): number {` with a body that begins `if (atNight) {`. Both edits apply. Every case that calls `lockFee`, those of `passageCost` too, fails with "atNight is not defined".

**L.** As C, but the ask also says that the yard counts time in minutes from midnight. The reply's edit applies and writes `endOf(start, locks) > 23`. The check fails the same case as C.

**M.** Arm `outline-1`. The ask as in A. The reply takes the way round, as in K, with the parameter named right. Its new body returns `lockFeeByDay(locks, atNight) * 1.5` at night. Both edits apply. The check fails "lockFee: three locks at night cost 675", because the old body already doubles at night and the reply's gives 1350.

**N.** As M, but the ask says only: change `lockFee` so that a passage at night pays half as much again as by day. The reply and the failing case are the same as in M.

**O.** Arm `name`. The ask: add, at the end of the file, `export function yardName(): string` that returns `"Canal End"`. The reply's one edit has an empty SEARCH and that function, right, under `EDIT: app/src/lock.ts`. The bench made a new file at that path, as it does for an empty SEARCH. The check, which loads `app/src/locks.ts`, fails with "yardName is not a function".

## The sorts

Filled in after the readers of round 3 have answered.
