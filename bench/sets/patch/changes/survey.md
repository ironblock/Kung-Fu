# Changes to `survey` and its three tasks

The mender before me was stopped by a usage limit. It left no `CHANGES.md`, and I found no change of its in W. When I took over, `check-tasks` ended `window: none; 22 WRONG`, and the 22 were the adversary's breaches. `holds.py check` ended `all as they must be`. Every file in W was as the writer and the adversary had left it on 2026-11-20, and no finding was answered.

**Another mender took over here.** Written by Claude Opus 5.5 on 2026-11-22. There is one line for each change, with the finding it answers. A breach is named by its task and the adversary's number for it, as in "PK1 adv-6".

The module `files/survey.ts` did not change, so no `plain.ts` changed either.

## The regression helper, `checks/helpers-survey.ts`

It has 109 cases, where it had 99. Every case runs in all three checks, except the ones a check skips.

- New case "CHECKLIST: the title of each item, word for word". Answers PK1 adv-9.
- New case "checklistFor: hands back the checklist's own items, not copies". Answers PK3 adv-4.
- "outcomeOf: three majors fail" is now "outcomeOf: three majors fail, and so do more", and it also asks for four majors. No check skips it. Answers PK2 adv-3.
- "addFinding: a worse finding on the same item takes the place of the one that stands" now also asks that the record does not hold the caller's own object. Answers PK2 adv-5.
- New case "waive: passes over a finding waived already to the one on its item that stands". Answers PK1 adv-6.
- New case "waive: the reason is noted as it was given, spaces and all". Answers PK3 adv-5.
- New case "summaryLine: a survey whose findings are all waived is not clean". Answers PK1 adv-7.
- New case "certificates: a pass soon after a fail starts on its own day, though the old one had days to run": passes on 1000 and 1360, a fail on 1350. Answers PK2 adv-7.
- New case "runsOut: follows on through more than one certificate that carries on": passes on 1000, 1340 and 1710. Answers PK2 adv-4.
- New case "renewalWindow: goes by the certificate in force, not by one that carries on from it". Answers PK2 adv-6.
- New case "dueForSurvey: cover that carries on from an early pass counts to its end". Answers PK3 adv-3.
- "certificateLine: a certificate that has not started says in how many days it starts" now also reads, on day 1360, the certificate that a fail ends before it begins. Answers PK3 adv-2 in all three checks, since that line must not change in any task. It also fails the adversary's unfiled `line-startsTodayLE`, which passed PK1 and PK2.
- "certificateLine: a full certificate that has started is named by its serial" and "certificateLine: an interim certificate that has started is called interim" now also read the line on and after the day the certificate expires. PK3 skips both, as it did before. Answers PK1 adv-8.
- New case "feeLabel: a thousand pounds and more, with no comma". Answers PK3 adv-6.

## PK1 (beside)

- `ask.md`: "The result has all four severities as keys" is now "The result has the four severities as its keys, and no other key". The check's test of the whole result now rests on the ask's own words. 81 words. Answers PK1 adv-3.
- `check.test.ts`: new case "counts every finding, so two on one item count as two". Answers PK1 adv-1.
- `check.test.ts`: new case "has the four severities as its own keys and no other key". It compares the whole result, and its own keys. Answers PK1 adv-3 and adv-4.
- `check.test.ts`: new case "gives each call a tally of its own, which a later call leaves as it was". It reads three results after the third call. Answers PK1 adv-2.
- `check.test.ts`: new case "leaves a finding as it was written down, with its code and note untidied". Its codes are in small letters and have spaces round them, and so do its notes. Answers PK1 adv-5.
- Renamed, each file byte for byte as the adversary wrote it: `hollow-adv-1.ts` is now `hollow-distinct.ts`, `-2` is `hollow-shared.ts`, `-3` is `hollow-fifth.ts`, `-4` is `hollow-prototype.ts`, `-5` is `hollow-tidies.ts`, `-6` is `hollow-firstwaived.ts`, `-7` is `hollow-allwaived.ts`, `-8` is `hollow-expired.ts` and `-9` is `hollow-title.ts`. The check fails each at an assertion, by the case written for it. Answers PK1 adv-1 to adv-9.
- The near miss `hollow-adv-10.ts` is now `hollow-critical.ts`, byte for byte. Answers the kept near miss.
- `where.md`: the new wrong answers are named, and "all five new cases" is now "all nine new cases". Answers PK1's breaches.

## PK2 (inside): the task is changed

The adversary showed that the old change could be written from the outline alone, by keeping the old body under a new name and turning its `pass` into `conditional` at five minors. The new result was the old result and a count. The task now turns on the same thing, minor findings in `outcomeOf`, but the new count goes into the middle of the body, before the test against `MAX_MAJORS`. So the new result can no longer be made from the old result: five minors beside one major are conditional and beside two they fail, where the old result is `conditional` for both. Each line below answers PK2's "Its kind", and the breaches it names.

- `ask.md` rewritten, with the title "Five minor findings should count as a major one". Five or more minor findings that stand count together as one major finding, on top of the majors `outcomeOf` counts now, in each of its rules about majors. Ten count as one, not two. Waived minors and advisories do not count. 120 words.
- `reference.ts` and `reference.edits.md`: three edits, each inside the lines of `outcomeOf`. They add `let minors = 0;`, a count of the standing minors in the loop, and `if (minors >= 5) { majors += 1; }` just before `if (majors > MAX_MAJORS) {`. Seven lines are added and none is changed.
- `check.test.ts` rewritten for the new ask, with 14 cases where it had 10. It still skips one old case only, "outcomeOf: minors alone never stop a pass". Its cases on two findings on one item, on ten and eleven minors alone, and on five minors beside three and four majors also answer PK2 adv-1, adv-2 and adv-3.
- `other.ts`: the adversary's right answer, in its own style with `filter` and a count helper, now adds one to its count of majors for five minors.
- The writer's hollow answers made again on the new reference, each with the wrong idea it had: `hollow-lost.ts`, `hollow-waived.ts`, `hollow-over.ts`, `hollow-fail.ts`, `hollow-advisory.ts`.
- The adversary's files made again on the new reference, each with the wrong idea it had, and renamed: `hollow-adv-1.ts` is now `hollow-distinct.ts`, `-2` is `hollow-ten.ts`, `-3` is `hollow-three.ts`, and the near miss `-8` is `hollow-midloop.ts`. The four that change another function are the adversary's own files with the new `outcomeOf` put in place of the old: `-4` is now `hollow-chain.ts`, `-5` is `hollow-shared.ts`, `-6` is `hollow-window.ts` and `-7` is `hollow-replay.ts`. The check fails each at an assertion, by the case written for it. Answers PK2 adv-1 to adv-8.
- New `hollow-apart.ts`: the old reference, in which five minors turn a pass into a conditional and do nothing more. An answer made from the old result alone does this. The check fails it at five cases.
- New `hollow-each.ts`: every five minors count as one major, so ten count as two.
- `where.md` rewritten for the new task. It names every hollow answer, and has a paragraph on the two right answers that still need no body (see "Left alone").

## PK3 (leans)

- `check.test.ts`: new case "an interim certificate that a second conditional ended early has only its own days left". Conditionals on 1000 and 1015 give `IC-HERON-01000`, which expires on 1015; it is read on 1012, 1014, 1015 and 1016. Answers PK3 adv-1.
- `check.test.ts`: new case "a certificate that a fail ended before it started still says when it starts". It rests on the ask's "The lines for no certificate, and for a certificate that has not started yet, stay as they are". Answers PK3 adv-2.
- Renamed, each file byte for byte as the adversary wrote it: `hollow-adv-1.ts` is now `hollow-interim.ts`, `-2` is `hollow-lapsedfirst.ts`, `-3` is `hollow-inforce.ts`, `-4` is `hollow-copies.ts`, `-5` is `hollow-trimmed.ts` and `-6` is `hollow-comma.ts`. The check fails each at an assertion, by the case written for it. Answers PK3 adv-1 to adv-6.
- The near miss `hollow-adv-7.ts` is now `hollow-zero.ts`, byte for byte. Answers the kept near miss.
- `where.md`: the new wrong answers are named. Answers PK3's breaches.
- `where.md`: a new paragraph, "A pass that does not show the fact". It says that the plainest code is the right answer, so a `region` pass must be read for whether the reader knew what `expires` means. Answers the adversary's doubt under "Its kind".

## The held texts

- `holds.py make W` was run again after the last change to an ask. The PK1 and PK2 texts that hold the ask's names changed with the asks. The PK2 region is still lines 158 to 175, the lines of `outcomeOf`.

## What was tried after the last change

- Each filed answer was run against its check, and its failing cases read. Each breach fails by the case written for it.
- The adversary's two batches of wrong answers were run again from my own copy of its scripts. In its first batch, eleven still pass PK1: the ones it listed as passed and not filed (the error text of `makeFinding`, `clockLabel` past 24 hours, `addFinding` when the new finding is dropped, `waive` on every finding of an item, codes not on the checklist in `reinspectList` and `needsSlipway`, `lastPassDay` taking the largest day, the serial keeping an underscore), and three that act as the module does (`issueCertificate` with `early >= 0`, `findItem` trimming after the change of case, `closeSurvey` sorting its copies in a second statement). In its second batch, every answer it filed now fails, and so do its old PK2 answers, read against the new ask. Thirteen pass, and it filed none of them. Three it listed as passed and not filed: the error text of `makeFinding`, `renewalWindow` giving null for a full certificate cut to under 28 days, and PK1 skipping codes that are not on the checklist. Three act as the module does on every certificate and record the module makes: `needsSlipway` naming the two severities, `dueForSurvey` with -1 kept as -1, and PK3's `certificateLine` with the days left capped at 365. Three differ only on input that nothing here makes: a survey day before the newest one in `surveyFee`, a day past 99999 in the serial, and a boat's name with two spaces together in `summaryLine`. Two change only a type, which the grader does not check. That leaves `pk1:worseIncludesLower` and `certs-previousInForceOnly`, both under "Left alone".
- On the new PK2, four answers of my own by other routes: a count of minors made before the loop (passes), the old body called with a stand-in major finding (passes), a wrapper that guesses more than `MAX_MAJORS` majors fail (passes), and the same wrapper with `>=` (fails three cases).

## Left alone, and my reasons

- **PK2: two right answers still need no body.** (1) Keep the old body under a new name and call it on the findings with a stand-in major finding added at five minors. That is exact. (2) Keep the old result unless five minors stand and it is not a fail, then count the standing majors, add one, and compare with `MAX_MAJORS`. That passes only on two guesses the outline does not settle. Neither can be closed while the old body can be called on findings of the caller's making, and that holds for any change to a function like this one. The `fuel`, `tides` and `pumpout` menders said the same, and left this route as the run's author's to decide for all sixteen `inside` tasks. The route that needed nothing at all, the old result and a count, is closed. `where.md` says how to read an `outline-1` pass.
- **PK3: is the natural guess the natural one?** The adversary saw no way for the writer to avoid it, and I see none either. The fact has two values, and the plainest code takes the right one. Changing the fact would change what the task turns on. `where.md` now says how to read a `region` pass.
- **PK3: the body is not needed either.** The adversary found this is not against the brief for a `leans` task, and I agree.
- **The grader does not type-check.** That is `bench/box.py`, outside W, and the adversary filed nothing on it.
- **The wrong answers the adversary did not file.** It judged each to differ from the module only on input the module's own callers do not make, or only in wording. I added no case for any of them, except that the helper's new reading of a certificate that a fail ended before it began also fails `line-startsTodayLE`. Of the ones that still pass, two need a word. `pk1:worseIncludesLower` drops the advisories only when there are more than six findings. It is made up to pass, and no reader would write it. `certs-previousInForceOnly` is a real gap in the helper that no finding names: `certificates` passes over a certificate that ends on or before its first day when it looks for the one before. The module can make such a certificate: a conditional and a fail on day 1000, then a conditional on day 1005. The module gives no cover on day 1010, and the answer gives an interim certificate from 1005. I ran this to see it. The brief says to mend what the findings show and nothing else, so I left it for the next adversary or the run's author.
- **PK1: findings whose code is not on the checklist.** An answer that skips them still passes. `makeFinding` refuses such a code, so the module makes no such finding, and the ask says nothing of codes.

## The last lines, after the last change

- `tsc --strict` on `files/survey.ts`: no output, exit 0. The same on the three `reference.ts`, the three `other.ts` and all 40 hollow answers, each copied to my scratch directory. Each check and the helper also type-check against their reference.
- `holds.py make W`: `3 tasks: name, outline, region, whole written for each`. `holds.py check W`: `all as they must be`.
- `box.py check-tasks W --window none`: `window: none; all as they must be`.
