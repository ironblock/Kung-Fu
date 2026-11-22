# PO3, leans: `Handover.report`

**The right change.** In `Handover.report` (lines 720 to 734 of `src/handover.ts`), after `lines.push(`events: ${this.events.length}`);` (line 732) and before `return lines;`: one line for each of the first three events of `this.events`, written by `describeEvent`. The reference adds `for (const event of this.events.slice(0, 3)) lines.push(describeEvent(event));`. Reading `this.timeline().slice(0, 3)` is as right. The lines the report gave before stay.

**The other declaration.** `Handover.log` (lines 531 to 534), the private method through which every event reaches the timeline.

**The fact.** The timeline is kept newest first. `log` puts each event in at the front, so `events[0]` is the event added last, and the three added last are the first three, already in the order the ask wants.

**The lines that show it.**

- Line 531, the comment directly above `log`: `// The timeline is kept newest first: each event goes in at the front, so events[0] is the latest.`
- Line 533, the body of `log`: `this.events.unshift({ at, kind, by: by.trim(), text });`
- Line 504, the comment above the field: `// Newest first.`
- Line 698, in `lastEvent`: `this.events.find(...)` gives the newest event, or the newest of a kind.

**What the first lines leave open.** The outline shows `private events: TimelineEvent[] = []` (line 505), `private log(kind: EventKind, at: number, by: string, text: string): void {` (line 532), `timeline(): TimelineEvent[] {` (line 693) and `lastEvent(kind?: EventKind): TimelineEvent | undefined {` (line 697). None says which end of the list is the new one. The region adds the lines of `report`, which use only `this.events.length`, and of `describeEvent`. The ask says in what order the report must give the events, and that it goes by when an event was added. It does not say how the list is kept.

**The natural wrong guess.** That a timeline is in the order things happened, each event added at the end: `this.events.slice(-3).reverse()`. `hollow-guess.ts` is the reference with that. On the real list it gives the three oldest events, the oldest first: for a boat that has gone out, `opened`, then the ticks of `KEYS` and `GAS`. Eight cases fail it. It passes only where there is one event or none.

**Other wrong answers.**

- Sort the events by the time written on them, to be safe whatever the order. `hollow-bytime.ts` does this. A reading carries the time it was taken and is often added after ticks with a later time, so this is not the order of adding; the case "goes by when an event was added" fails it, and no other.
- Give every event, not three. `hollow-all.ts` does this.
- Put a heading line before the events, or put them before the `events:` line.
- Pass over some kinds of event, as if the report's other lines told of them already. `hollow-noextra.ts` passes over extras and `hollow-noreturn.ts` over the return. The case with a damage mark, the return and an extra among the three fails each.
- Turn the timeline round in place to read it from the end. `hollow-turned.ts` does this; the case that the report changes nothing fails it.
- Change a line the report gave before. `hollow-totaltwo.ts` gives the total line only for two charges or more; the case for a closed hire with one charge fails it.
- `hollow-lost.ts` has the right `report` and a `tick` that keeps the note of an item put back to `todo`; one case of `unchanged` fails it.
- Fifteen more files have a right `report` and change one other declaration a little. Each fails the case of `unchanged` written for it: `hollow-backsheet` (`daySheet` drops the return of a boat that is back), `hollow-wentsheet` (`daySheet` gives the time a boat went, not the time it was due), `hollow-stagebackward` (`stageTimes` gives NOT_YET for a stage that ends before it begins), `hollow-takingsmerged` (`takings` merges each hire first), `hollow-releasebefore` (`release` refused before the reading's time), `hollow-largestold` (`newDamage` matches the largest old mark), `hollow-pennyrefund` (`receiptLines` shows a penny owed as a refund), `hollow-closebefore` (`close` refused before the return), `hollow-readbefore` (`read` refuses a back reading timed before the return), `hollow-marktwice` (`noteDamage` refuses a mark noted already), `hollow-replacevoid` (`add` lets a hire called off be replaced), `hollow-sortkind` (`sortMarks` orders ties by kind), `hollow-sharednote` (`mergeCharges` keeps a note all the lines share), `hollow-nogas` (`warnings` says nothing when no bottle is aboard), `hollow-leftlater` (`release` sets the time out to the reading's when that is later).

**Passes that do not show the fact.** Each of these is a right answer, so no case fails it, but a pass by one does not show that the reader knew how `log` keeps the list.

- Guessing that the timeline is newest first, as activity feeds often are, gives `slice(0, 3)` without the fact.
- Finding the order at run time: comparing `this.lastEvent()` with `this.events[0]` and taking `slice(0, 3)` or `slice(-3).reverse()` to suit. `lastEvent` is in the outline, so this needs no body.
- The wrapper: an edit that quotes only `report(): string[] {`, which the outline prints, renames the old body `reportBefore` and adds `this.timeline().slice(0, 3)` after its lines. The region adds nothing this needs beyond the outline; it still turns on the fact.

So a `region` or `outline-1` pass on PO3 should be read for which of these it is, and the guesses and probes counted beside the score.

**The check.** Eleven cases: no event, one, two, three, more than three, events added out of the order of their times, three latest events that are a damage mark, the return and an extra, two closed hires whose earlier lines are pinned as they were, an event with no name, and that the report changes nothing. Two old cases are skipped, the two that pin the whole report of a hire that has events: `Handover.report: a closed hire with its charge and the total` and `Handover.report: a line for each charge, and no space after a charge with no note`. The check holds both reports again with their new endings. The old case for a hire that is only booked stays, since it has no events.
