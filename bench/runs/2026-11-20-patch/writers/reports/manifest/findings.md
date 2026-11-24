## findings

ADVERSARY REPORT: module `manifest`, W = /home/build/patch/manifest/set, tasks PH1 (beside), PH2 (inside), PH3 (leans).
I mended nothing of the writer's and committed nothing. Scratch files are under SCRATCH/adv-manifest (called S below).

== 0. The earlier adversary's files ==
I ran check-tasks first. It ended `12 WRONG`.

Kept, because each breaches the check (described under each task below):
- PH1: hollow-adv-t-fields-right, t-live, t-off-roster, t-off-sorted
- PH2: hollow-adv-t-count-one, t-nan, t-order, t-tenth
- PH3: hollow-adv-t-before-problems, t-clean-only, t-not-sealed

Kept as near misses (the check fails each at one case only):
- PH1/hollow-adv-t-by-name: same person by surname and given name instead of id. It fails only at "two people of one name are told apart by their ids".
- PH2/hollow-adv-t-ceil: weights compared after Math.ceil. It fails only at "an item is folded into the row of its own unit weight, whichever row that is".

Deleted, because the check fails them:
- PH1: t-no-infants, t-sorted
- PH2: t-beside, t-label
- PH3: t-guess-at, t-guess-log, t-guess-reverse

Moved out of W because it is NOT a breach:
- PH2/hollow-adv-x-wrapper.ts is a right answer. It passed, and it matches the reference on 20,000 random addLoad sequences (sealing, NaN, -0, case and space variants included). It is now at S/prior-not-breach/PH2-hollow-adv-x-wrapper.ts. It matters for PH2's kind (section 3).

The earlier adversary's three other.ts files are at S/prior-other/. I replaced them with my own.

== Final state of W ==
- `box.py check-tasks W --window none` ends `window: none; 38 WRONG`. All 38 are adversary files that pass: PH1 17, PH2 11, PH3 10. Every reference, plain, writer's hollow and other.ts is `ok`.
- `holds.py check W` ends `all as they must be`.
- Every adversary file passes `tsc --strict`.

== 1. Breaches ==

-- Breaches in the shared helper (checks/helpers-manifest.ts) --
Each of these is my right answer for the task plus one small change in another function. The same six are in all three tasks as hollow-adv-1 to hollow-adv-6. None of them touches a task's own declaration.

- hollow-adv-1-jackets: legProblems counts `p.age <= CHILD_UNDER` in place of `ageBand(p.age) !== "adult"`, so a 12-year-old who swims needs a lifejacket.
  - Example: a heron with four adult non-swimmers, two children of 8 and a swimmer of 12. The module gives only over-people; the hollow adds `lifejackets: 7 needed, 6 aboard`.
  - Gap: the case "a lifejacket for every non-swimmer and everyone under twelve" has riders aged 30, 11, 2, 1, 1, 1 and 0, and no 12-year-old.
- hollow-adv-2-problem-order: compareProblems ends `return 0` in place of `return compareText(a.detail, b.detail)`.
  - Example: bad legs for P-15 added before P-12. The module lists P-12 first; the hollow lists P-15 first.
  - Gap: "a person's legs must lie inside the passage" adds R-3 to R-6 already in detail order, so the stable sort hides the change.
- hollow-adv-3-metres: formatDistance uses Math.floor for metres. formatDistance(850.6) gives "850 m" where the module gives "851 m". The helper tries only whole metres: `[0, 850, 999]`.
- hollow-adv-4-sealed-person: addPerson calls mustBeDraft after its refusals. On a sealed manifest, an id already there or a blank id gives false where the module throws "manifest is sealed". "a sealed manifest cannot be changed" tries only `rider(1)`, a new id.
- hollow-adv-5-pence: formatPence uses Math.trunc. 649.6 gives "£6.49" where the module gives "£6.50". The helper tries only whole pence.
- hollow-adv-6-to-end: isAboard uses `p.leaveLeg < 0` for TO_END. A person with leaveLeg -4 is aboard at leg 2 (true) where the module says false. The helper's leaveLeg values are 3, -1 and 1 only.

PH1 only. Its check runs the whole helper with nothing skipped, so these show how far the gaps spread across the file:
- hollow-adv-9-sealed-remove: removePerson checks sealing after the lookup. Sealed, then removePerson("P-99"), gives false; the module throws.
- hollow-adv-10-sealed-leg: addLeg checks the measures before sealing. Sealed, then a negative measure, throws RangeError "a leg cannot have a negative measure"; the module throws "manifest is sealed".
- hollow-adv-11-km: parseLegLine uses Math.floor(km*1000). "2.01" km gives 2009 m where the module gives 2010. The helper's 6.4, 0.85, 3, 9 and 12 all multiply exactly.
- hollow-adv-12-infant-age: headcount counts `p.age > 1`. headcount of one person aged 1.5 is 1 where the module gives 0.
- hollow-adv-13-clock: parseClock accepts up to three digits of hours. "009:05" gives 545 where the module gives -1.
- hollow-adv-14-span: legSpan uses `p.leaveLeg < 0` for TO_END. boardLeg 1, leaveLeg -4, 3 legs gives "legs 2-3" where the module gives "no legs".

Weaker survivors I left in scratch only (S/mut/PH1/), all edges with NaN or odd input:
- addleg-nan: `leg.distanceM < 0` lets NaN through.
- weight-nan and tidy-weight-max: NaN weights.
- pence-neg-zero: -0.4 pence shows "-£0.00".
- gap-trim: checkLegs squashes names before comparing.
- person-name-cut: names cut at 25 characters.

Equivalent mutants that prove nothing: jackets-limit-eq, nocrew-any-crew, problems-leg-tie-code, readman-hash-raw, reopen-squash-off, roof-ge, stamp-floor, addperson-shallow; skipper-age-bound is equivalent for whole-number ages.

The writer's claim that "all 179" of its mutations fail the helper does not hold for these edges.
Suggested helper cases:
- a swimmer of 12 at the lifejacket limit;
- people with bad legs added out of id order;
- formatDistance(850.4) and (850.6);
- formatPence(649.6);
- isAboard and legSpan with leaveLeg -4;
- on a sealed manifest: an id already there, removePerson of an absent id, addLeg with a negative measure, and addLoad with count 0 (all must throw "manifest is sealed");
- parseLegLine on "2.01";
- headcount of age 1.5;
- parseClock("009:05").
The addLoad items in that list also catch two PH2 breaches, because PH2 does not skip those helper cases.

-- PH1 (beside): `changesAt` --
The check's people (`person(...)`) all have `surname: "Sorrel", given: id`, and no span is empty.
- hollow-adv-t-off-roster (earlier adversary): `off` taken in roster order.
- hollow-adv-t-off-sorted (earlier adversary): `off` sorted by id.
  - Both break the ask's "keep both lists in the order it gives them".
  - Example: B-9 (Abbot, passenger) is added before B-2 (Zell, crew), and both leave at leg 1. The module gives off [B-9, B-2]; both hollows give [B-2, B-9].
  - Gap: the check's off lists with two or more people, `["A-5", "A-7"]` and `["A-7", "A-9"]`, are already in roster order and id order.
- hollow-adv-t-fields-right (earlier adversary): on = boardLeg === leg, off = leaveLeg === leg, with aboardOn only for the first leg.
- hollow-adv-7-fields-first-leg (mine): the same from fields alone.
  - Both break "Go by what the class already answers about who is aboard for a leg, not by the people's own fields".
  - Example: a person whose span holds no leg (boardLeg 1, leaveLeg 1; problems() calls it bad-legs). At leg 1 the module gives nobody on and nobody off; both hollows give `on A-2 off A-2,A-3`.
  - Gap: PEOPLE has no empty span.
- hollow-adv-t-live (earlier adversary): filters this.people with isAboard and returns the manifest's own objects. If the caller sets on[0].surname = "Changed", roster() shows "Changed".
  - This is the weakest breach. Only "The method must not change the manifest" and "Go by what the class already answers" support a case against it. It is the mender's call.
- Mine that failed and was deleted: off-reversed. It failed at "on the last leg" and "follows the manifest as it changes".

-- PH2 (inside): `Manifest.addLoad` --
- hollow-adv-7-half-kilo (mine): folds when `Math.abs(row.unitKg - item.unitKg) < 0.5`, so 13.5 and 13.9 kg bottles become one row.
- hollow-adv-t-tenth (earlier adversary): folds when the weights agree with toFixed(1), so 13.5 and 13.54 fold.
  - Both break "only when that row has the same unit weight".
  - Gap: the check's weights 11.5, 13, 13.5, 14, 15 and 25 all differ by 0.5 kg or more.
- hollow-adv-t-order (earlier adversary): mustBeDraft moved after the refusal. Sealed plus count 0 gives false where the module throws.
  - The check's sealed case tries valid items only: `item("gas bottle", 15, 1)` and `(13.5, 1)`.
- hollow-adv-t-count-one (earlier adversary): refuses `!(count >= 1)`, so count 0.5 is refused where the module takes it.
- hollow-adv-t-nan (earlier adversary): `item.count <= 0 || item.unitKg < 0` lets a NaN count or weight through where the module refuses it.
- The last three break "Everything else about adding load stays as it is: what is refused". t-count-one and t-nan are thin edges.

-- PH3 (leans): `renderManifest` --
Every check case uses `passage()`, which has no problems, and the check skips `"renderManifest: a sealed sheet with its amendments counted"` and `"renderManifest: amendments on a draft with problems"`. So no case renders amendments beside problems.
- hollow-adv-t-before-problems (earlier adversary): moves the Amendments block, Latest line included, above Problems. It turns round an existing part of the sheet.
- hollow-adv-t-clean-only (earlier adversary): shows Latest only when there are no problems.
  - Example: a wren with one passenger and an amendment. The module ends `...Problems / !! leg 1 no-skipper / "" / Amendments: 1 / Latest: rang the hirer (R. Okafor)`. before-problems puts the Amendments block first; clean-only drops the Latest line.
- hollow-adv-t-not-sealed (earlier adversary): skips "sealed" entries.
- hollow-adv-7-office-notes (mine): skips "sealed" and "reopened: …" entries.
  - Example: amend, then seal. The module, with the reference's reading, gives `Amendments: 2 / Latest: sealed (R. Okafor)`; both hollows give "Latest: weights checked (I. Brandt)". After a reopen, office-notes still shows "weights checked".
  - The check's sealed case always amends after sealing. This is a two-readings point (section 2): either pin it, or have the ask say that the sealing and reopening notes count.
- The natural wrong guess, in my forms: a loop that keeps the last entry, and `notes.slice(-1)`. The check failed both at 4 cases, the same as the writer's hollow-guess. Deleted.

== 2. Is the check fair? ==
My other.ts files PASSED all three checks: W/tasks/PH1/other.ts, W/tasks/PH2/other.ts, W/tasks/PH3/other.ts. I wrote them from the ask and the module before opening any reference, check or hollow file:
- PH1: loops and some() by id, placed at the end of the class.
- PH2: a for loop over the rows that returns early.
- PH3: `const [latest] = notes`.
The outline-only PH2 answer below also passes. I found nothing the checks test that the ask does not say:
- PH2's sealed case and its "caller's item is left alone" case fall under "Everything else about adding load stays as it is".
- PH1's `toEqual([PEOPLE[3], PEOPLE[4]])` holds for any copies, and the ask's "the people" covers it.
One two-reading point (PH3): "the most recent amendment" may or may not include the yard's own "sealed" and "reopened: …" notes.
- For counting them: amendments() returns them, and the count line, "Straight after the line that counts the amendments", counts them.
- No case decides it today, so no right answer fails. A case pinning `Latest: sealed (...)` would be fair only if the ask also says so.

== 3. Is each task of its kind? ==
PH1, beside: yes.
- A right answer needs `aboardOn(legIndex: number): Person[] {` (outline 592), `id: string` (outline 39), and the ask's first-leg rule and order rule.
- Facts that are only in a body or a comment, and that no right answer needs:
  - leaveLeg's meaning (isAboard, lines 231-232);
  - that aboardOn copies (line 596) and gives [] off the end (lines 593-595);
  - aboardOn's order (doc comment line 591).
- The ask steers hard ("Go by what the class already answers…"), which may make the task easy, as the writer says.
- region.md equals outline.md.

PH2, inside: it is NOT strictly an inside task. The change can be written from the ask and the outline alone, by keeping the old body as a helper and calling it.
- My reply S/outline-only/PH2-reply.md quotes only `addLoad(item: LoadItem): boolean {`, the outline's line 562, which is in the file exactly once.
- Applied with small.apply_edits it gives "outcome: applied". It passes the check (0 of 130 cases fail), matches the reference on 20,000 random sequences and passes tsc. The file is S/outline-only/PH2/outline-only.ts.
- How it works: it filters `this.load` to the rows at the item's weight, calls the old body renamed `private addLoadAtOneWeight`, and puts the rows back in their places.
- It needs only that `private load: LoadItem[] = []` (outline) is not readonly, plus the ask's "folds the two into one row" and "after the rows already there".
- The earlier adversary's x-wrapper is a second such answer.
- region.md does hold everything a right answer needs.
- A 27B at low effort is unlikely to find this route, but a pass on PH2 in outline-1 would be possible. This is the same concern that made the writer move PH2 off legMinutes.

PH3, leans: yes.
- The ask does not give the fact, and names only `renderManifest` and `src/manifest.ts` in code spans.
- region.md shows only `const notes = m.amendments();` and `notes.length`.
- The first line, `amendments(): Amendment[] {`, leaves the order open, and Amendment has no time or number in it.
- The natural guess, the last entry, is wrong.
- The fact is plain in the whole file: line 682 `// newest first: the office reads these from the top` and line 683 `.reverse()`.
- A careful region reader sees that the choice hangs on the order of `m.amendments()`.
- Caveats:
  - It is a two-way guess: notes[0] written by habit passes, as the writer says.
  - Only a whole-file reader learns that seal and reopen write to the same log, which opens the second reading in section 2.

== 4. The module ==
- Nothing in it changes from run to run: no clock, no random number, no locale or Intl call, and sorts are stable. Three runs of check-tasks gave identical results.
- tsc --strict passes. It is 859 lines, with no line over 120 columns and no mark lines. Every plain.ts equals the module.
- `holds.py check W` ends `all as they must be`, and reports 0 cut first lines.
- It reads as real code.
- Deterministic float warts, which no check depends on:
  - gearKg and renderLoadLine round 16.6 kg x 15 (249.00000000000003) up to 250, and three rows of 0.7 + 2.2 + 0.1 kg up to gearKg 4.
  - formatDistance(999.6) gives "1000 m".
- As the writer notes, the outline prints the unexported constants with their values (STANDARD_KG, CHILD_UNDER, LOCK_MIN, and others).

## breaches

38

## others_failed

0
