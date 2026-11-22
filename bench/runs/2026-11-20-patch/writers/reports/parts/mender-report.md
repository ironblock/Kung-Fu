## changes

I closed all 20 breaches and mended two asks. The module did not have to change. The earlier mender had left nothing: there was no CHANGES.md, no file was newer than the findings, and check-tasks ended "window: none; 20 WRONG". So every change is mine. /home/build/patch/parts/set/CHANGES.md starts with a line saying another mender took over, then lists each change below with the finding it answers.

Helper, /home/build/patch/parts/set/checks/helpers-parts.ts (used by all three checks). Each renamed file now fails that one case only, at an assertion:
- New case: formatPence goes to the nearest penny (12.6 is £0.13). PN1 adv-1, now hollow-trunc.ts.
- New cases: sortByBin and reorderList compare by character code, so capitals come first. PN1 adv-2, now hollow-locale.ts.
- keyOf also tested with a tab inside the part number. PN1 adv-3, now hollow-tab.ts.
- New case: describeMove of 0 units has no sign. PN1 adv-4, now hollow-pluszero.ts.
- New case: mergeKit drops a line of 0.5 units. PN1 adv-5, now hollow-halfunit.ts.
- The shelve refusal now also checks the words "unknown part: ENG-9999". PN1 adv-6, now hollow-wording.ts.
- receive logs a pack of 4 at 401p at 100p a unit. PN2 adv-1, now hollow-ceil.ts.
- receiveAll refuses a line of 1.5 packs and a line at 10.5p. PN2 adv-2, now hollow-partpack.ts.
- lastCounted goes back to day 9 when a count is booked late. PN2 adv-3, now hollow-countday.ts.
- New case: correct cuts the hold made last, whatever its day. PN2 adv-4, now hollow-byday.ts.
- New case: moveHold onto a job that has a hold keeps that hold's place in the queue. PN2 adv-5, now hollow-joinplace.ts.
- New case: giveBack is logged at the price carried at the return. PN2 adv-6, now hollow-issueprice.ts.
- New case: stocktake keeps the sheet's order. PN3 adv-1, now hollow-sorted.ts.
- New case: slowMovers lists a part that is all set aside. PN3 adv-2, now hollow-setaside.ts.
- usage can be -1 in a period with a return and no issue. PN3 adv-12, now hollow-floor.ts.
- New case: giveBack takes units from a job that was issued none. PN3 adv-13, now hollow-overreturn.ts.
- New case: setAside keeps a growing hold in its place. PN3 adv-14, now hollow-requeue.ts.

PN1:
- ask.md: "it returns `units`, a whole number of 1 or more" became "it returns `units`. `units` is always a whole number of 1 or more." This answers the two-readings note.
- To stay under 170 words, "how far short it is for a job" became "how far short a job is", and "and must change nothing" became "and change nothing". It is now 169 words by wc -w.
- where.md names the six new hollow answers.

PN2:
- ask.md: added "A delivery that is refused now is still refused." (157 words). This answers adv-9 and adv-10, since the list after "stays as it is now:" could be read as complete.
- check.test.ts, new case "still refuses what it refuses now, and changes nothing": at a price of 0, an unknown part and 0, 1.5 and -1 packs each throw RangeError, and the store is unchanged. adv-9 is now hollow-unrefused.ts and adv-10 is now hollow-unknownfree.ts.
- check.test.ts, new case "is averaged in when its price is above 0 but under a penny a unit": packs of 4 at 1p, average 50. adv-8 is now hollow-unitprice.ts.
- where.md lists the new wrong answers and the helper hollows. It also has a new section, "Right answers that need no body", on how to read an outline-1 pass.
- I applied the adversary's two outline-only replies with the bench's own applier and ran them on the mended check. The wrapper passes all 143 cases. The branch passes only while it throws RangeError; with a plain Error it fails the new refusal case.

PN3: where.md names the five new hollow answers.

Unchanged: files/parts.ts, every plain.ts, reference.ts, reference.edits.md and other.ts, and PN3's ask. The four near misses keep their names: PN1/hollow-adv-9.ts, PN2/hollow-adv-11.ts, PN3/hollow-adv-7.ts and PN3/hollow-adv-10.ts. I ran holds.py make again after the two asks changed. The module and all three references type-check under tsc --strict.

## tsc_last_line

No output, exit 0. The three reference.ts files, each copied to a .ts file in the scratchpad, also type-check with exit 0.

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

- PN2's kind. The finding is true: the change can be written from the outline alone by keeping the old body of receive under a new name and putting the average back afterwards. That wrapper still passes the mended check.
  - The same route is open in any inside task whose new result can be made from the old one.
  - Closing it would mean changing the module so that a step in the middle of receive uses the new average in a way a caller cannot undo. That would change the module, its outline and every answer of the three tasks, and give the task a second thing to turn on.
  - The fuel and tides menders left the same finding for the same reason.
  - The other outline-only route, a branch at the top, is narrower now: it must throw RangeError, which only the bodies show.
  - Written in place, the change needs the body, so for the region reader the task is of its kind. PN2's where.md says how to read an outline-1 pass. The run README still says outline-1 tasks are ones where an outline cannot be enough; for PN2 that is not quite true, and only the run's author can change it.
- PN1, "Both give 0 for a part the store does not have." The adversary found that no trap follows from leaving this out: every way of writing the guard gives the right answer. The ask is at 169 words, so I added nothing.
- PN3's three notes:
  - The ask's "store screen" words are a weak hint, not the fact given away.
  - A `limit: number` that is not optional passes at run time, because the check runs the code and does not type-check it. No behaviour differs.
  - A route that records a sequence number in `log` quotes text outside history's lines and is far from likely.
- The dueForCount case whose partNos() line tests nothing. It is true, but nothing a caller can see depends on the order of the store's own map of parts, so no wrong answer could fail that line, and removing it would change nothing.
- The module. The adversary found nothing broken and nothing that changes from run to run.
