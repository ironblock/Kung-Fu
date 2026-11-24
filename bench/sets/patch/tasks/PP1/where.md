# PP1, beside: a new method `Outbox.waitingFor`

**The right change.** One new method in the `Outbox` class (the class begins on line 735 of the file). The reference puts it before `forBooking`, line 834:

```ts
    waitingFor(ref: string): Notice[] {
        return sortDue(this.notices.filter((n) => n.ref === ref && isWaiting(n.state)));
    }
```

It may stand anywhere in the class. `filter` makes a new array, so the sort does not touch the outbox's own list.

**What the outline gives.** Everything the method needs: the field `private notices: Notice[] = []` (line 736), the fields of `Notice` (`ref`, `state`, `dueAt`, `id`, lines 51 to 63), and the type `NoticeState` with its four states (line 9). The ask names the two states that count and the order, so no body has to be read. The outline also shows two helpers by their first lines, `isWaiting(state: NoticeState): boolean` (line 726) and `sortDue(list: Notice[]): Notice[]` (line 731). A right answer needs neither. Both happen to do what their names say: `isWaiting` is true for `queued` and `failed`, and `sortDue` orders by `dueAt` and then `id`.

**What the outline does not give, and a wrong answer may trip on.** `sortDue` sorts the list it is given and hands that same list back. That is said only in its comment and its body. So `sortDue(this.notices).filter(...)` reorders the outbox's own list: `hollow-inplace.ts`. The ask forbids it in words ("the order in which the outbox itself keeps its notices stays as it was"), and the check sees it through `forBooking`, which gives the notices in the order they are kept.

**Other wrong answers that are likely.**

- Only `queued`, with `failed` left out (`hollow-queued.ts`). The cases with a failed notice fail.
- No sort, the notices as the outbox keeps them (`hollow-unsorted.ts`). That is id order, and it is right until a failure moves a due time. The two cases that fail a notice catch it.
- A sort by `dueAt` with no word on `id`. The sort is stable and the outbox keeps its notices in id order, so this is right in effect, and it passes.
- A guess at a field name, such as `this.queue` or `this.items`, from a reader who holds only the file's name. The cases fail at an assertion or on a `TypeError`.
- An edit that quotes a line the reader has not seen, so that the patch does not apply. Every first line in the outline can be quoted; an empty SEARCH adds at the end of the file, outside the class, and is wrong.
- A file written anew. `unchanged` then fails wherever the guess differs, as it does for `hollow-lost.ts`, where `smsParts` counts a text of exactly 160 characters as two parts.
- The reference trimmed before it is compared (`hollow-trimref.ts`). " LW-3001" is not the booking's reference, so the outbox holds nothing for it: "gives an empty array for a reference the outbox holds nothing for" fails.
- Every state but `sent` kept, so that dropped notices stay in (`hollow-keepsdropped.ts`). "leaves out what was sent and what was dropped" fails.
- Copies of the notices handed back, `.map((n) => ({ ...n }))`, pass. The ask does not say the notices must be the outbox's own.

**Hollow answers that change another function,** each failed by a case of `unchanged` that all three checks run: `hollow-leapcentury.ts` (`isLeap` takes every fourth year), `hollow-nomx.ts` (no "mx" in the titles), `hollow-prunemidnight.ts` (`prune` forgets a notice dropped at the day's first minute), `hollow-trunkzero.ts` and `hollow-intlzero.ts` (`mobileOf` refuses "0(0)7700 900123" and "0044 (0)7700 900123"), `hollow-plancopies.ts` (`plan` hands back copies), `hollow-minround.ts` (`formatMin` rounds a part of a minute), `hollow-notemplate.ts` (`checkTemplates` drops its "no template" fault), `hollow-cliptrim.ts` (`clipSms` trims the start of a cut text), `hollow-negtries.ts` (`retryDelay(-1)` is not `GIVE_UP`) and `hollow-tues.ts` ("Tues" for Tuesday).

**Cases of `unchanged` the change alters:** none. The check skips none.
