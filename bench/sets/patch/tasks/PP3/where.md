# PP3, leans: `Outbox.due`, which must agree with `isQuiet`

**The right change.** In `Outbox.due` (lines 839 to 843 of the file, with its comment on line 838), three lines at the top of the body:

```ts
        if (isQuiet(this.quiet, minOf(now))) {
            return [];
        }
```

Nothing else changes: the filter, the sort and the limit stay as they are.

**The other declaration.** `isQuiet`, line 399: `export function isQuiet(q: QuietHours, at: number): boolean {`.

**The fact.** `at` is a time of day, in minutes from midnight. It is not a stamp. `now` is a stamp, a day and a time of day in one number, so it has to be turned into a time of day first, with `minOf` (line 303) or `now % 1440`. `isQuiet` does not do that itself.

**The lines that show it.** Lines 397 to 408. The comment directly above `isQuiet` says "`at` is a time of day, in minutes from midnight. It is not a stamp." Its body compares `at` with `q.fromMin` and `q.toMin` and takes no remainder. It is shown again where `isQuiet` is used: `clearOfQuiet` takes `const min = minOf(stamp)` and calls `isQuiet(q, min)` (lines 419 and 420).

**What the first line leaves open.** `at: number` reads as well for a stamp as for a time of day. Elsewhere in the outline `at` is a stamp: `Attempt.at`, `dueAt`, `sentAt`. The method being changed takes `now`, a stamp, and holds `this.quiet`, so `isQuiet(this.quiet, now)` is the call that writes itself.

**The natural wrong guess.** That `isQuiet` takes the stamp: `if (isQuiet(this.quiet, now))`. That is `hollow-guess.ts`. Every stamp from day 1 on is 1440 or more. With quiet hours over midnight, as the default ones are, the guess reads every such stamp as late evening and gives nothing at any time of day. With quiet hours inside one day it never finds a quiet time. So the cases that expect notices in the daytime fail, and many cases of `unchanged` with them.

**Other wrong answers that are likely.**

- A second idea of quiet hours, worked out in the method from `fromMin` and `toMin`. The ask forbids it, and it is right only if it agrees with `isQuiet` at the ends: quiet begins at `fromMin` and ends just before `toMin`; it may run over midnight; and the same time twice means no quiet hours at all. `hollow-ends.ts` counts `toMin` as quiet. `hollow-allday.ts` takes the same time twice for a whole quiet day.
- No change of the time of day for a day other than the first: the same fault as the guess.
- The empty array given only when there is no limit, or the limit applied first. "gives nothing in quiet hours whatever the limit" fails.
- A notice's due time moved out of quiet hours inside `due`. "alters no notice" fails.
- A quoted body from a guess, so that the patch does not apply.
- A file written anew. `unchanged` fails wherever the guess differs, as it does for `hollow-lost.ts`, where `attemptsFor` gives the oldest try first.
- An attempt logged for a call in quiet hours, under an id that is no notice's (`hollow-logsquiet.ts`). "alters no notice and records nothing" fails: it reads the log for ids that are and are not notices'.
- One empty array kept by the module and handed out on every quiet call (`hollow-shared.ts`). The ask asks for a new empty array: "gives a new empty array each time" fails.
- Many forms of the natural guess fail the same daytime cases as `hollow-guess.ts`: `dayOf(now)`, `Math.floor(now / 60) % 24`, `Math.floor(minOf(now) / 60)`, `now - dayOf(now)`, and quiet tested on each notice's `dueAt`.

**Hollow answers that change another function,** each failed by a case of `unchanged` that all three checks run: `hollow-requeuequiet.ts` (`requeue` by the default quiet hours), `hollow-sept.ts` ("Sept"), `hollow-tabemail.ts` (`looksLikeEmail` lets a tab through), `hollow-textsort.ts` (`byDay` sorts its days as text), `hollow-clockspaces.ts` (`parseClock` takes "9 : 30"), `hollow-noms.ts` (no "ms" in the titles), `hollow-planorder.ts` (`plan` numbers a booking's notices by their due times) and `hollow-requeuedproblem.ts` (`problems` lists a notice given up and queued again).

**Right by another road.** These pass and need no knowledge of the fact: `clearOfQuiet(this.quiet, now) !== now`, whose first line names its parameter `stamp`; and a change to `isQuiet` itself so that it takes the remainder of `at`, with `isQuiet(this.quiet, now)` in the method. The second changes a declaration the ask does not name, but nothing it did before. A reader of the outline who sets `at` beside `stamp` in the first lines of the two neighbours may also come to `minOf(now)` without the body. I think the first two are unlikely and the third is what a careful reader does. `clearOfQuiet(this.quiet, now) > now` passes too. `now % 1440` differs from `minOf(now)` only for a stamp before day 0, which no case uses, so it passes and is right.

**The case of `unchanged` the change alters,** and the check skips: "Outbox.due: hands out what is overdue whatever the time of day". It calls `due` at 9.40pm, at midnight and at 7.59am.
