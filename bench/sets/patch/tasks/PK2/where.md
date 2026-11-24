# PK2, inside: `outcomeOf`

**The right change.** In `outcomeOf` (lines 158 to 175 of `src/survey.ts`): count the minor findings that are not waived, beside the count of majors the loop keeps already, and when they are five or more add one to the count of majors after the loop, before the test against `MAX_MAJORS`. The reference adds `let minors = 0;`, an `if (finding.severity === "minor")` in the loop after the one for majors, and `if (minors >= 5) { majors += 1; }` just before `if (majors > MAX_MAJORS) {`. Seven lines are added and none is changed.

**What it needs from the file.** The body. The ask says the five minors count "on top of the major findings that function counts now, in each of its rules about major findings", and those rules are only in the body: a waived finding is skipped first of all, so a waived major is not counted; one critical fails at once; more than `MAX_MAJORS` (2) majors fail; one or two majors are conditional. So five minors beside one major are conditional, and beside two they fail. The outline shows `MAX_MAJORS = 2`, and not how it is used.

**What a wrong answer is likely to do.**

- Let five minors turn a pass into a conditional and do nothing more (`hollow-apart.ts`, the right answer to this task as it first stood): five minors beside two majors are conditional, where they must fail. An answer made from the old result alone does this.
- Count every five minors as one major, so that ten count as two (`hollow-each.ts`).
- Count waived minors towards the five (`hollow-waived.ts`), most likely by counting before the `if (finding.waived)` line.
- Take "five or more" as more than five (`hollow-over.ts`), make five minors a fail (`hollow-fail.ts`), count advisories with the minors (`hollow-advisory.ts`), count the items that have a minor finding and not the findings (`hollow-distinct.ts`), or add a fail at ten minors that the ask does not have (`hollow-ten.ts`).
- Fail only at exactly three majors (`hollow-three.ts`): five minors beside three or four majors, and four majors alone.
- Decide at the fifth minor, inside the loop, before a critical or a major later in the list has been read (`hollow-midloop.ts`).
- Write the body anew from the first line, with guessed rules: the cases of `outcomeOf`, `closeSurvey`, `addFinding` and `waive` in "survey: what was there is as it was" fail.
- Quote a line of the body that is not as the file has it, so that the edit is refused and the file is unchanged: nine of the new cases fail, as they do for the starting file.

**Right answers that need no body.** Two are open to a reader who holds only the outline. Both quote only the first line of `outcomeOf` and keep the old body under a new name. (1) Call the old body on the findings with a stand-in major finding added when five or more minors stand. That is exact, and takes no rule from the body. (2) Keep the old result when it is a fail or when fewer than five minors stand, and otherwise count the standing majors, add one and compare with `MAX_MAJORS`. That passes only on the guesses that more than `MAX_MAJORS` majors fail and that a waived major is not counted; with `>=` in place of `>` it fails three cases. Read an `outline-1` pass for these two before it is counted.

The check skips one old case, "outcomeOf: minors alone never stop a pass", which the change must alter. `hollow-lost.ts` rounds the half fee of `surveyFee` to the nearest penny, where the file rounds down. `hollow-chain.ts`, `hollow-shared.ts`, `hollow-window.ts` and `hollow-replay.ts` are the reference with one other function changed: `runsOut` follows on into one later certificate only, `addFinding` keeps the caller's own object when a worse finding takes a place, `renewalWindow` takes its end from `runsOut`, and `certificates` cuts the earlier certificates short only after the whole replay. Each fails one case of "survey: what was there is as it was".
