# PD3 (leans): where the change is

**The right change.** Inside `recordDraw` only, lines 148 to 154 of `src/fuel.ts`. After the volume is checked and before a new entry is built, look at the entry posted last. If it is a draw by the same boat on the same day, add the volume to it and return it. Otherwise go on as now. The reference adds six lines after `mustBeVolume(volume, "a draw");`, the first of them `const last = ledger.entries[0];`.

**The other declaration.** `post`, lines 110 to 116: `export function post(ledger: Ledger, entry: Entry): void {`.

**The fact.** `post` puts an entry at the front of `ledger.entries`. The ledger is kept newest first, so the entry posted last is `ledger.entries[0]`.

**The lines that show it.** Lines 114 and 115, inside `post`:

```ts
    // Newest first: the office reads the ledger from the top. A late entry still goes on top.
    ledger.entries.unshift(entry);
```

Its first line shows a ledger, an entry and `void`: nothing about where the entry goes. The outline shows `entries: Entry[]` and nothing about its order. `recentLines` (line 291, with the comment above it) and the turning round in `boatBill` (lines 239 and 240) say the same to a reader of the whole file.

**Why the reader must see that `post` matters.** The ask says "the entry posted last in the ledger", and the body of `recordDraw` ends by calling `post(ledger, entry)`. Which end of `entries` that call writes to is the one thing the region does not show.

**The natural wrong guess.** That `post` appends, so that the entry posted last is `ledger.entries[ledger.entries.length - 1]`. That is `hollow-guess.ts`. It passes when the ledger holds one entry, since both ends are that entry. It fails "joins the entry posted last when older entries stand behind it", "posts a new entry when a delivery was posted after the boat's draw" and others.

**Other wrong answers a reader without the fact may write.**

- The entry with the latest day and minute: `hollow-clock.ts`. A late entry is posted on top with an earlier time, and the case "goes by what was posted last, not by the latest day and minute" fails it. This is the answer of a reader who tries not to depend on the order.
- The boat's own last draw, `drawsOf(ledger, boat)[0]`, whatever was posted after it: `hollow-own.ts`. It also needs the order of `drawsOf`.
- Looking at both ends of `entries`. No form of that is right.
- The entry with the latest day and minute, taking the last of two timed alike: `hollow-timed.ts`. Joining only within an hour of the entry's minute: `hollow-hour.ts`. Two cases fail each: "goes by what was posted last, not by the latest day and minute" and "joins whatever the two minutes are, and the entry keeps its own".
- Joining only when the new part is timed at or after the entry: `hollow-later.ts`. Giving the joined entry the earlier of the two minutes: `hollow-earliest.ts`. The ask has no such clause, and says the entry keeps the minute it had. The case "joins whatever the two minutes are, and the entry keeps its own" fails both.
- Returning a copy of the joined entry: `hollow-copy.ts`. Putting a new entry with the sum in the old one's place, so that the entry an earlier call returned keeps its old volume: `hollow-swap.ts`. The ask says to add the volume to that entry and return that entry. The case "adds to the very entry that was posted last and returns that one, not a copy or a new one" fails both.
- Writing the join into `post` and not into `recordDraw`: `hollow-post.ts`. Then `post` no longer takes an entry as it is. The case "post puts a boat's second draw of a day on top as an entry of its own" of `fuel as it was` fails it.
- No test of the day: `hollow-day.ts`. No test of the kind: `hollow-kind.ts`, which joins the yard's draw to a delivery, since a delivery's boat is `YARD` too.
- `hollow-lost.ts` is the reference with `dipVolume` rounding to the nearest decilitre. Two more of that sort: `hollow-settle.ts` (`settle` writes to the ledger itself and so takes a reading dated before it opens) and `hollow-class.ts` (`boatBill` refuses with a `RangeError`). One case of `fuel as it was` fails each.

**A way round the fact, which the check cannot see.** A reader who does not know which end `post` writes to can let the code find out. The answer builds the entry and calls `post(ledger, entry)` as now. Then it finds the entry with `ledger.entries.indexOf(entry)` and looks at the entry beside it. If that one is a draw by the boat on that day, it adds the volume to it, takes the new entry out again with `splice`, and returns the neighbour. Every case passes it, and after the call the ledger is as the reference leaves it. It does post a second entry and take it out, against the letter of "do not post a second one", and no check of what the module returns and leaves behind can tell. So a pass in `region` on this task need not mean the reader held the fact. Read each passing try for this shape: a call of `post` before the test, then `indexOf` or a look at both ends, then `splice`, `shift` or `pop`. Count those passes beside the score.

**The case skipped in `unchanged`.** "recordDraw posts each draw as an entry of its own": the change must alter it.
