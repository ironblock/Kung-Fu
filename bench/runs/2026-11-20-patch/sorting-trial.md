# The sorting rule, tried on made-up failures

Written by Claude Opus 5.5 on 2026-11-22, before any try. `AGENTS.md` asks that the rule that sorts failures be tried before the run, on a made-up failure of each kind expected, and that two readers apply it the same way.

Every failure below is made up. The file, `src/locks.ts`, does not exist. Each gives what the arm held, what the reply did, and what the bench said. My sort is in the last section. A fresh reader was given the rule ("How each failure is sorted" in `README.md`) and the failures, without my sorts, and sorted them. Its sorts are in the last section too.

## The made-up file, as far as the failures need it

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
    return locks * LOCK_FEE_PENCE;
}

export function passageCost(start: number, locks: number): number {
    const end = endOf(start, locks);
    return lockFee(locks, end >= 1320);
}
```

Its outline, as the arm `outline` holds it, prints `export interface Lock {` and, under it, `name: string` and `rise: number`, without `readonly` and without the semicolons. It prints `export function lockFee(locks: number, atNight: boolean): number {`, and no body.

## The failures

**A.** Arm `outline-1`. The ask: change `lockFee` so that a passage at night pays half as much again. The reply has one edit. Its SEARCH is `    return LOCK_FEE * locks;`. The bench: refused, no such text.

**B.** Arm `region`, the same task. The region holds the lines of `lockFee`. The reply has one edit. Its SEARCH is `    return locks * LOCK_FEE;`. The bench: refused, no such text.

**C.** Arm `region`. The ask: change `passageCost` so that a passage that ends after 23:00 pays the night fee. The region holds the lines of `passageCost`, and not those of `endOf`. The reply's edit applies. It reads `endOf`'s result as hours and tests `end >= 23`. The check fails "a passage that ends at 23:20 pays the night fee".

**D.** Arm `whole`. The ask: change `lockFee` so that a passage at night pays half as much again. The reply's edit applies. It rewrites `lockFee`, and the new body throws when `locks` is 0. The check fails the unchanged case "lockFee: no locks cost nothing".

**E.** Arm `whole`. The ask: add `export function feeFor(locks: number): number` that gives the fee in pounds, "to the nearest penny". The reply's edit applies, and it uses `Math.round(locks * 1.5 * 100) / 100`. The check fails "feeFor rounds a half penny down". The reference rounds down. The ceiling's `whole` try failed the same case.

**F.** Arm `outline`. The ask: add a function beside `lockFee`. The reply's SEARCH is `  14: export function lockFee(locks: number, atNight: boolean): number {`, the line number and all, as the outline prints it. The bench: refused, no such text.

**G.** Arm `outline`. The ask: add a member `readonly chamber: number` to `Lock`. The reply's SEARCH is `    rise: number`, as the outline prints the member. The bench: refused, no such text, because the file has `readonly rise: number;`.

**H.** Arm `name`. The reply writes a whole file, `FILE: app/src/locks.ts`, from a guess. The check fails twelve unchanged cases.

**I.** Arm `region`. The reply is cut off by its length limit. Its last 9,000 tokens are the words "Wait, let me reconsider the fee" and a near copy of the same paragraph, again and again.

## The sorts

Filled in after the fresh reader has answered.
