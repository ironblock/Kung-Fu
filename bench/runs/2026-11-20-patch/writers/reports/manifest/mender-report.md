## changes

All of these are in /home/build/patch/manifest/set/CHANGES.md, one line each with the finding it answers. The module files/manifest.ts did not change, so no plain.ts, reference.ts or reference.edits.md changed. No other.ts changed. Only PH3's ask changed.

Shared helper, checks/helpers-manifest.ts. It went from 122 to 127 cases, and 6 old cases ask for more:
- The lifejacket case now adds a swimmer of 12 and still finds no problem. adv-1-jackets is now hollow-jacketage.ts in PH1, PH2 and PH3.
- New case "problems of one code on one leg are in the order of their detail": R-15, R-12 and R-13 are added in that order and listed R-12, R-13, R-15. adv-2-problem-order is now hollow-tieorder.ts in all three.
- formatDistance now also asks for 850.4 as "850 m" and 850.6 as "851 m". adv-3-metres is now hollow-metrefloor.ts in all three.
- New case "a sealed manifest throws before it looks at what it is given". It covers addPerson with an id already there and with a blank id, removePerson("P-99"), addLeg with a negative measure, and addLoad with a count of 0. It answers:
  - adv-4-sealed-person, now hollow-sealperson.ts in all three
  - PH1 adv-9, now hollow-sealremove.ts
  - PH1 adv-10, now hollow-sealleg.ts
  - PH2 adv-t-order, now hollow-sealedlast.ts
- New case "formatPence: a part of a penny goes to the nearest penny" (649.4 and 649.6). adv-5-pence is now hollow-pencetrunc.ts in all three.
- New case "isAboard: only -1 stands for the end of the passage". adv-6-to-end is now hollow-aboardnegative.ts in all three.
- Old cases that now ask for one more thing, each for a PH1 file:
  - parseLegLine: 2.01 km is 2010 m (adv-11, now hollow-kmfloor.ts)
  - headcount: age 1.5 counts 0 (adv-12, now hollow-infantage.ts)
  - parseClock: "009:05" is not a time (adv-13, now hollow-hourdigits.ts)
  - legSpan: leaveLeg -4 gives "no legs" (adv-14, now hollow-spannegative.ts)
- New case on addLoad: a count of 0.5 is taken, and a count or a weight that is not a number is refused. PH2 adv-t-count-one is now hollow-countone.ts and adv-t-nan is now hollow-nan.ts.

PH1:
- New check case: both lists keep the order the people were added, which is not the roster's order nor the ids'. adv-t-off-roster is now hollow-offroster.ts and adv-t-off-sorted is now hollow-offsorted.ts.
- New check case: people whose spans hold no leg, (1,1), (2,1) and (0,0), change no answer. adv-t-fields-right is now hollow-fieldsright.ts and adv-7-fields-first-leg is now hollow-fieldsall.ts.
- The near miss adv-t-by-name is now hollow-byname.ts.
- adv-t-live is out of W, at SCRATCH/mend-manifest-opus55/not-breach/PH1-hollow-adv-t-live.ts. It is a right answer (see below).
- where.md names all of these.

PH2:
- New check case: unit weights that differ by a little (13.5, 13.54 and 13.9 kg) are kept apart. adv-7-half-kilo is now hollow-halfkilo.ts and adv-t-tenth is now hollow-tenth.ts.
- The near miss adv-t-ceil is now hollow-ceil.ts. It now fails 2 cases.
- where.md names the new hollows and has a new section, "A right answer from the outline alone", on the wrapper route and how to read an outline-1 pass.

PH3:
- ask.md: "the most recent amendment" became "the most recent of the amendments that line counts". This answers the two readings: the notes that seal and reopen write are counted, and the reference answer's reading is kept. The ask is 122 words. Its code spans did not change, so the region is the same.
- New check case: a draft with problems and two amendments, compared as a whole sheet. adv-t-before-problems is now hollow-aboveproblems.ts and adv-t-clean-only is now hollow-cleanonly.ts.
- New check cases: the note of the sealing, and the note of a reopening, can be the latest. adv-t-not-sealed is now hollow-notsealed.ts and adv-7-office-notes is now hollow-officenotes.ts.
- where.md names all of these.

Also checked:
- I ran holds.py make again after the ask changed. No held text holds the ask.
- Every file the adversary filed now fails at an assertion, at the case written for it.
- Its right answers still pass: the PH2 wrapper, the PH2 outline-only answer, and the earlier adversary's three other.ts.
- In its mutation screen, 18 still pass. They are the ones named under left_alone.
- tsc passes on every reference.ts and other.ts, and every plain.ts is the module byte for byte.

## tsc_last_line

No output, exit 0 (tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler /home/build/patch/manifest/set/files/manifest.ts)

## holds_check_last_line

all as they must be

## check_tasks_last_line

window: none; all as they must be

## left_alone

- PH1 adv-t-live, which hands out the manifest's own objects. I judge it a right answer, not a breach. The ask says "The method must not change the manifest", and this method changes nothing; only a caller that edits what it gets back does. The ask never asks for copies. An answer that calls aboardOn gets copies without knowing it, and the outline does not show that aboardOn copies. A case that asked for copies would be stricter than the ask's words, and putting copies in the ask would give the task a second thing to turn on. I moved the file out of W.
- PH2's kind. The finding is true: the change can be written from the outline alone, by keeping the old body under a new name and wrapping it. I did not change the task, for three reasons:
  - The wrapper needs nothing from the old body, so any new rule for which row an item is folded into can be wrapped the same way.
  - Making `load` readonly would not stop it, because the rows can still be spliced in place.
  - Closing the route needs another thing for the task to turn on, or a change to the module and every answer of the three tasks. The same route is open in any inside task whose new result can be built from the old one, so it is for the run's author to decide across all sixteen files.
  For a reader of region.md the task is of its kind, and where.md now says how to read an outline-1 pass.
- The six weaker survivors, which the adversary did not file and left out of W. Five differ from the module only on input it never makes for itself:
  - addleg-nan, weight-nan and tidy-weight-max: a distance or weight that is not a number, which parseLegLine and parsePersonLine refuse;
  - pence-neg-zero: a part of a penny below 0, where guestPence only gives whole pence;
  - gap-trim: runs of spaces in place names handed straight to checkLegs, where addLeg squashes them.
  The sixth, person-name-cut, cuts a name at 25 characters, and a name that long is real input. I left it because nothing in the outline would lead a rewrite to cut a name, and the adversary judged it weaker. One long name in the renderPersonLine case would close it if the run's author wants it closed.
- The equivalent mutants (jackets-limit-eq, nocrew-any-crew, problems-leg-tie-code, readman-hash-raw, reopen-squash-off, roof-ge, stamp-floor, addperson-shallow, and skipper-age-bound for whole ages). There is nothing to pin.
- Three more files in the adversary's screen still pass that its report did not name: duration-neg (a negative duration), readman-crlf (a carriage return inside a line) and weight-ceil-tidy (a weight within 1e-9 above a whole kilo). None is input the module makes, so I left them.
- PH1's kind, PH3's kind, the module and its float warts. The findings say each is sound and that no check depends on the warts, so nothing changed.
- The writer's claim of "all 179" mutants. That is the writer's report, not a file to mend. The helper now fails every filed breach.
