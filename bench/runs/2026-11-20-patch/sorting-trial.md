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

## The made-up file, for round 2

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

Its outline, as the arms `outline` and `outline-1` hold it, prints each line with its line number before it, as `13: export function lockFee(locks: number, atNight: boolean): number {`. The message says that each line is a line number and the first line of a declaration or of one of its members. The outline prints `export interface Lock {` and, under it, `name: string` and `rise: number`, without `readonly` and without the semicolons. It prints `function endOf(start: number, locks: number): number {`. It prints no body and no comment. The region of a task holds the outline and the lines of each declaration the ask names, with the comment directly above it.

## The failures, for round 2

**A.** Arm `outline-1`. The ask: change `lockFee` so that a passage at night pays half as much again as by day, not twice. The reply has one edit. Its SEARCH is `    return LOCK_FEE * locks;`. The bench: refused, no such text.

**B.** Arm `region`, the same task. The region holds the lines of `lockFee`. The reply has one edit. Its SEARCH is `    return atNight ? locks * LOCK_FEE * 2 : locks * LOCK_FEE;`. The bench: refused, no such text.

**C.** Arm `region`. The ask: change `passageCost` so that a passage that ends after 23:00 pays the night fee, working out when it ends as the file already does. The region holds the lines of `passageCost`, and not those of `endOf`. The reply's edit applies. It writes `lockFee(locks, endOf(start, locks) > 23)`, reading the end as an hour. The check fails "a passage that starts at 21:00 with three locks ends at 22:00 and pays the day fee".

**D.** Arm `whole`. The ask as in A. The reply's edit applies. It rewrites `lockFee`, and the new body throws when `locks` is 0. The check fails the unchanged case "lockFee: no locks cost nothing".

**E.** Arm `whole`. The ask: add `export function feeFor(locks: number): number` that gives the day fee in pounds, "to the nearest penny". The reply's edit applies, and it uses `Math.round(locks * 1.5 * 100) / 100`. The check fails "feeFor rounds a half penny down". The reference rounds down. The ceiling's `whole` try failed the same case.

**F.** Arm `outline`. The ask: add a function beside `lockFee`. The reply's SEARCH is `13: export function lockFee(locks: number, atNight: boolean): number {`, the line number and all. The bench: refused, no such text.

**G.** Arm `outline`. The ask: add a member `readonly chamber: number` to `Lock`. The reply's SEARCH is `    rise: number`, as the outline prints the member. The bench: refused, no such text, because the file has `readonly rise: number;`.

**H.** Arm `name`. The reply writes a whole file, `FILE: app/src/locks.ts`, from a guess. The check fails twelve unchanged cases.

**I.** Arm `region`. The reply is cut off by its length limit. Before the cut it had written one edit, whole. Its last 9,000 tokens are the words "Wait, let me reconsider the fee" and a near copy of the same paragraph, again and again.

**J.** Arm `region`. The ask as in A. The reply's SEARCH is the `return atNight ? ...` line of `lockFee`, right in every character but one: it begins with a tab where the file and the message have four spaces. The bench: refused, no such text.

**K.** Arm `outline-1`. The ask as in A. The reply takes the way round. Its first edit changes the first line of `lockFee`, as the outline prints it less the number, to `function lockFeeByDay(locks: number, atNight: boolean): number {`. Its second edit has an empty SEARCH and adds `export function lockFee(locks: number, night: boolean): number {` with a body that uses `atNight`. Both edits apply. The check fails every case of `lockFee` with "atNight is not defined".

**L.** As C, but the ask says the yard counts time in minutes from midnight. The reply's edit applies and writes `endOf(start, locks) > 23`. The check fails the same case as C.

**M.** Arm `outline-1`. The ask as in A. The reply takes the way round, as in K, with the parameter named right. Its new body returns `lockFeeByDay(locks, atNight) * 1.5` at night. Both edits apply. The check fails "lockFee: three locks at night cost 675", because the old body already doubles at night and the reply's gives 1350.

## The sorts

Filled in after the readers of round 2 have answered.
