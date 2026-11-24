## changes

I wrote all the changes to /home/build/patch/survey/set/CHANGES.md, one line each with the finding it answers. That file starts with a note that the earlier mender left no CHANGES.md and no change in W: check-tasks ended "22 WRONG" when I began. My lines follow the line "Another mender took over here."

The module files/survey.ts did not change, so no plain.ts changed.

**Regression helper (checks/helpers-survey.ts)**
It went from 99 cases to 109. The new or stronger cases are:
- Checklist titles pinned word for word (PK1 adv-9).
- checklistFor gives back the checklist's own items, not copies (PK3 adv-4).
- outcomeOf: four majors fail as well as three (PK2 adv-3).
- addFinding keeps a copy when a worse finding takes a place (PK2 adv-5).
- waive passes over a finding already waived to the one that stands (PK1 adv-6).
- waive keeps the reason as given, spaces and all (PK3 adv-5).
- summaryLine is not "clean" when every finding is waived (PK1 adv-7).
- certificates: a pass soon after a fail starts on its own day (PK2 adv-7).
- runsOut follows a chain of three certificates (PK2 adv-4).
- renewalWindow goes by the certificate in force (PK2 adv-6).
- dueForSurvey counts cover from an early pass to its end (PK3 adv-3).
- certificateLine for a certificate a fail ended before it started still says when it starts (PK3 adv-2, now in all three checks).
- The started-certificate certificateLine cases also read the line on and after expiry. PK3 skips both cases (PK1 adv-8).
- feeLabel has no comma at a thousand pounds and more (PK3 adv-6).

**PK1 (beside)**
- ask.md now says "the four severities as its keys, and no other key" (81 words) (PK1 adv-3).
- New check cases:
  - two findings on one item count as two (adv-1)
  - the whole result and its own keys are compared (adv-3, adv-4)
  - each call gets a tally of its own (adv-2)
  - untidy codes and notes are left as written (adv-5)
- The adversary's files are renamed, byte for byte: hollow-distinct, hollow-shared, hollow-fifth, hollow-prototype, hollow-tidies, hollow-firstwaived, hollow-allwaived, hollow-expired and hollow-title. The near miss is now hollow-critical.
- where.md names the new wrong answers.

**PK2 (inside): the task is changed** (PK2 "Its kind")
- New ask, "Five minor findings should count as a major one" (120 words). Five or more standing minor findings now count as one major on top of the majors outcomeOf counts, in each of its rules about majors. Ten still count as one. The old result can no longer give the new one: five minors beside one major are conditional, and beside two they fail.
- New reference.ts and reference.edits.md: three edits, all inside outcomeOf, seven lines added.
- check.test.ts is rewritten with 14 cases. Its cases also answer adv-1, adv-2 and adv-3. It still skips only "outcomeOf: minors alone never stop a pass".
- other.ts is the adversary's filter-and-count answer, adjusted to the new rule.
- Every hollow answer is made again on the new reference:
  - the writer's: lost, waived, over, fail, advisory
  - the adversary's, renamed: hollow-distinct, hollow-ten, hollow-three, hollow-chain, hollow-shared, hollow-window, hollow-replay, and the near miss hollow-midloop
  - two new ones: hollow-apart (the old reference, which is what an answer built from the old result does) and hollow-each (ten minors count as two)
- where.md is rewritten.

**PK3 (leans)**
- New check cases:
  - an interim certificate ended early by a second conditional (adv-1)
  - a certificate a fail ended before it started still says when it starts (adv-2)
- The adversary's files are renamed, byte for byte: hollow-interim, hollow-lapsedfirst, hollow-inforce, hollow-copies, hollow-trimmed and hollow-comma. The near miss is now hollow-zero.
- where.md names the new wrong answers. It also has a new paragraph, "A pass that does not show the fact", which answers the adversary's doubt.

**Held texts**
holds.py make was run again after the last change to an ask.

**Checked after the last change**
- Each breach fails at the case written for it.
- The adversary's two batches were run again from my scratch copy. Everything it filed now fails. What still passes is unfiled: listed by it, the same as the module on module-made input, a change of type only, or input nothing here makes. The two exceptions are under "left alone".
- Of my four other-route PK2 answers, the in-place count, the stand-in wrapper and the correct-guess wrapper pass. The wrapper that guesses ">=" fails.

## tsc_last_line

No output, exit 0. It passes the same way for all 46 answer files, each copied to my scratch directory: the 3 reference.ts, the 3 other.ts and the 40 hollow files. Each check also type-checks with the helper against its reference.

## holds_check_last_line

all as they must be (holds.py make: "3 tasks: name, outline, region, whole written for each")

## check_tasks_last_line

window: none; all as they must be

## left_alone

1. **PK2: two right answers still need no body.** Both keep the old body under a new name.
   - One calls the old body with a stand-in major finding added. That answer is exact.
   - The other counts the standing majors, adds one and compares with MAX_MAJORS. It passes only on two guesses the outline does not settle; with ">=" it fails three cases.
   - Neither can be closed while the old body can be called on findings the caller makes up, and that holds for any change to a pure function like this. The fuel, tides and pumpout menders left this route for the run's author to decide across all sixteen inside tasks.
   - The route that needed nothing at all, the old result plus a count, is now closed. PK2/where.md says how to read an outline-1 pass.
2. **PK3: is the natural guess the natural one?** The fact has two values, and the plainest code takes the right one. Changing it would change what the task turns on. I added only a where.md note.
3. **PK3: the body is not needed either.** The adversary says this is not against the brief for a leans task, and I agree.
4. **The grader does no type check.** That is bench/box.py, outside W, and nothing was filed on it.
5. **Wrong answers the adversary passed and did not file.** It judged each to differ only on input the callers do not make, or only in wording. I added no case for them. The one exception is line-startsTodayLE, which the new helper reading now fails anyway.
   - pk1:worseIncludesLower still passes. It drops advisories only when there are more than six findings; it is made up to pass, and no reader would write it.
   - certs-previousInForceOnly is a real gap in the helper that no finding names. Take a conditional and a fail on day 1000, then a conditional on day 1005. The module gives no cover on day 1010, but this answer issues an interim certificate from 1005. I confirmed it by running it. The brief says to mend only what the findings show, so I left it.
6. **PK1: findings whose code is not on the checklist.** An answer that skips them still passes. makeFinding refuses such codes, so the module never makes such a finding, and the ask says nothing about codes.
