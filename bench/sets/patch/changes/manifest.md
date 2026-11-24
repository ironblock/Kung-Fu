# Changes to `manifest` and its three tasks, after the adversary's findings

Written by Claude Opus 5.5 on 2026-11-22, as the mender. One line for each change, with the finding it answers. "PH1 adv-t-live" means the file the adversary left as `tasks/PH1/hollow-adv-t-live.ts`; the name after the arrow is what it is called now. A file the adversary filed in all three tasks is named once for all three.

The module `files/manifest.ts` did not change, so no `plain.ts`, `reference.ts` or `reference.edits.md` changed. No `other.ts` changed. Only PH3's ask changed.

## The shared helper, `checks/helpers-manifest.ts`

It gained 5 cases, from 122 to 127, and 6 of the old ones ask for more. Each file named below fails the case written for it, at an assertion, in every task's check that holds it.

- "Manifest.problems: a lifejacket for every non-swimmer and everyone under twelve" adds a swimmer of 12 before the first `expect`, and still finds no problem. Answers adv-1-jackets, now `hollow-jacketage.ts` in PH1, PH2 and PH3.
- New case "Manifest.problems: problems of one code on one leg are in the order of their detail": bad legs for R-15, R-12 and R-13, added in that order, listed R-12, R-13, R-15. Answers adv-2-problem-order, now `hollow-tieorder.ts` in all three.
- "formatDistance: metres under a kilometre" also asks for 850.4 as "850 m" and 850.6 as "851 m". Answers adv-3-metres, now `hollow-metrefloor.ts` in all three.
- New case "Manifest: a sealed manifest throws before it looks at what it is given": on a sealed manifest, `addPerson` of an id already there and of a blank id, `removePerson("P-99")`, `addLeg` with a negative measure and `addLoad` with a count of 0 all throw "manifest is sealed", and nothing changes. Answers adv-4-sealed-person, now `hollow-sealperson.ts` in all three; PH1 adv-9-sealed-remove, now `PH1/hollow-sealremove.ts`; PH1 adv-10-sealed-leg, now `PH1/hollow-sealleg.ts`; and PH2 adv-t-order, now `PH2/hollow-sealedlast.ts`.
- New case "formatPence: a part of a penny goes to the nearest penny": 649.4 is "£6.49" and 649.6 is "£6.50". Answers adv-5-pence, now `hollow-pencetrunc.ts` in all three.
- New case "isAboard: only -1 stands for the end of the passage": with `leaveLeg` -4 the person is aboard for no leg. Answers adv-6-to-end, now `hollow-aboardnegative.ts` in all three.
- "parseLegLine: the day counts from 1 and the distance is in kilometres" also asks that 2.01 km is 2010 m. Answers PH1 adv-11-km, now `PH1/hollow-kmfloor.ts`.
- "headcount: nobody" also asks that one person aged 1.5 counts 0. Answers PH1 adv-12-infant-age, now `PH1/hollow-infantage.ts`.
- "parseClock: what is not a time" also has "009:05". Answers PH1 adv-13-clock, now `PH1/hollow-hourdigits.ts`.
- "legSpan: a span that holds no leg" also asks that `boardLeg` 1 and `leaveLeg` -4 over 3 legs is "no legs". Answers PH1 adv-14-span, now `PH1/hollow-spannegative.ts`.
- New case "Manifest.addLoad: a part of one is taken, and a count or a weight that is not a number is refused": a count of NaN and a weight of NaN give `false`, a count of 0.5 gives `true`. Answers PH2 adv-t-count-one, now `PH2/hollow-countone.ts`, and PH2 adv-t-nan, now `PH2/hollow-nan.ts`. PH2 does not skip it. It rests on the ask's "what is refused ... stays as it is".

## PH1 (beside)

- `check.test.ts`: new case "keeps both lists in the order the people were added, which is not the roster's order nor the ids'". B-9 (Abbot, passenger) is added before B-2 (Zell, crew), both leave at leg 1, and B-8 and B-3 come on there the same way. Answers PH1 adv-t-off-roster, now `hollow-offroster.ts`, and PH1 adv-t-off-sorted, now `hollow-offsorted.ts`. It rests on "keep both lists in the order it gives them".
- `check.test.ts`: new case "goes by who is aboard, so someone whose legs hold none of the passage neither comes on nor goes off". It adds people with spans (1, 1), (2, 1) and (0, 0) to the passage, and every answer stays as it was. Answers PH1 adv-t-fields-right, now `hollow-fieldsright.ts`, and PH1 adv-7-fields-first-leg, now `hollow-fieldsall.ts`. It rests on "Go by what the class already answers about who is aboard for a leg, not by the people's own fields".
- The near miss PH1 adv-t-by-name is now `hollow-byname.ts`. Answers "Kept as near misses". The check still fails it at one case.
- PH1 adv-t-live is out of W, at `SCRATCH/mend-manifest-opus55/not-breach/PH1-hollow-adv-t-live.ts`. It still passes. I judge it a right answer; see "Left alone".
- `where.md` names the new wrong answers, and says why an answer that hands out the stored objects passes. Answers PH1's breaches and PH1 adv-t-live.

## PH2 (inside)

- `check.test.ts`: new case "unit weights that differ by a little are still different", with 13.5, 13.54 and 13.9 kg. Answers PH2 adv-7-half-kilo, now `hollow-halfkilo.ts`, and PH2 adv-t-tenth, now `hollow-tenth.ts`. It rests on "only when that row has the same unit weight".
- The near miss PH2 adv-t-ceil is now `hollow-ceil.ts`. Answers "Kept as near misses". It now fails two cases, where it failed one.
- PH2 adv-t-order, adv-t-count-one and adv-t-nan are answered in the helper, above.
- `where.md` names the new wrong answers. Answers PH2's breaches.
- `where.md`: a new section, "A right answer from the outline alone", on the answer that keeps the old body under a new name and wraps it, and what to look for in a passing `outline-1` try. Answers the finding on PH2's kind; see "Left alone" for why the task is as it was.

## PH3 (leans)

- `ask.md`: "add one line for the most recent amendment" became "add one line for the most recent of the amendments that line counts". Answers the two readings in sections 1 and 2: `seal` and `reopen` write to the same log, the count counts their notes, and now the latest is taken from what is counted. The reading kept is the reference answer's. 122 words with the title. It still does not say the order and does not name `amendments`, and its code spans are as they were, so the region is the same.
- `check.test.ts`: new case "on a draft with problems, after the problems and the count": a crew member whose legs lie past the end, two amendments, and the whole sheet. Answers PH3 adv-t-before-problems, now `hollow-aboveproblems.ts`, and PH3 adv-t-clean-only, now `hollow-cleanonly.ts`. It rests on "Straight after the line that counts the amendments, add one line".
- `check.test.ts`: new cases "the note of the sealing is counted, so it can be the latest" (amend, then seal: `Latest: sealed (R. Okafor)`) and "the note of a reopening is counted, so it can be the latest" (amend, seal, reopen). Answers PH3 adv-t-not-sealed, now `hollow-notsealed.ts`, and PH3 adv-7-office-notes, now `hollow-officenotes.ts`. They rest on the ask's new words.
- `where.md` names the new wrong answers, and says that only a reader of the whole file knows the yard's own notes are in the log. Answers PH3's breaches and the two readings.

## The held texts

- `holds.py make` run again after PH3's ask changed. No held text holds the ask, and none changed but its time.

## Left alone, and why

- **PH1 adv-t-live, the manifest's own objects handed out.** The ask says "The method must not change the manifest", and this method changes nothing; a caller who changes what it gives back does. The ask does not ask for copies. An answer that calls `aboardOn` gets copies without knowing it, and the outline does not show that `aboardOn` copies. A case that asked for copies would be stricter than the ask's words, and adding them to the ask would give the task a second thing to turn on. So it is a right answer and cannot be a hollow one.
- **PH2's kind.** The finding is true: the change can be written from the outline, by keeping the old body under a new name and wrapping it. I did not change the task. The wrapper hands the old body the rows at one weight and needs nothing from the body, so any new rule for which row is folded into can be wrapped the same way, and making `load` readonly would not stop it (the rows can be spliced in place). Closing the route means another change for the task to turn on, or a change to the module and every answer of the three tasks, and the route is open in any `inside` task whose new result can be built from the old one. That is for the run's author to decide across the sixteen files. For a reader of `region.md` the task is of its kind, and `where.md` says how to read an `outline-1` pass.
- **The six weaker survivors** (`addleg-nan`, `weight-nan`, `tidy-weight-max`, `pence-neg-zero`, `gap-trim`, `person-name-cut`). The adversary did not file them, called them edges with NaN or odd input, and left them out of W. I added no case for any of them. Five differ from the module only on input it never makes for itself: a distance or a weight that is not a number (`addleg-nan`, `weight-nan`, `tidy-weight-max`; `parseLegLine` and `parsePersonLine` refuse such text), a part of a penny below 0 (`pence-neg-zero`; `guestPence` gives whole pence), and place names with runs of spaces handed straight to `checkLegs` (`gap-trim`; `addLeg` squashes them). The sixth, `person-name-cut`, cuts a name at 25 characters, and a name that long is real input. I left it because nothing in the outline would lead a rewrite to cut a name, and the adversary judged it weaker. One long name in the case on `renderPersonLine` would close it, if the run's author wants it closed.
- **The equivalent ones** (`jackets-limit-eq`, `nocrew-any-crew`, `problems-leg-tie-code`, `readman-hash-raw`, `reopen-squash-off`, `roof-ge`, `stamp-floor`, `addperson-shallow`, and `skipper-age-bound` for whole ages). There is nothing to pin. Three more in the adversary's screen still pass that its report did not name: `duration-neg` (`formatDuration` of a time below 0), `readman-crlf` (a carriage return inside a line) and `weight-ceil-tidy` (a weight within a billionth above a whole kilo). None of them is an input the module makes, and I left them too.
- **PH1's kind, PH3's kind, the module and its float warts.** The findings say each is as it must be, and that no check depends on the warts. Nothing changed.
- **"All 179" in the writer's report.** That claim is the writer's. The helper now fails every filed breach.

## What was run after the last change

- The adversary's screen (its `mut/PH1` and `mut/x-PH*` files) against the mended checks: every file it filed fails; the 18 that pass are the six weaker survivors, the nine equivalent ones and the three above.
- The adversary's right answers by another route still pass: `prior-not-breach/PH2-hollow-adv-x-wrapper.ts`, `outline-only/PH2/outline-only.ts`, and the earlier adversary's three `other.ts` in `prior-other/`. Its failed wrong answers in `failed-own/` still fail.
- `tsc --strict` on `files/manifest.ts`: no output, exit 0. The same on each `reference.ts` and `other.ts`, copied to my scratch directory. Each `plain.ts` is the module byte for byte.
- `holds.py make W`: `3 tasks: name, outline, region, whole written for each`. `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`.
