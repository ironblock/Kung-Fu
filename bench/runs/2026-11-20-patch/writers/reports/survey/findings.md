ADVERSARY REPORT: module `survey`, W = /home/build/patch/survey/set, tasks PK1 (beside), PK2 (inside), PK3 (leans)

I changed none of the writer's files. I added only `other.ts` and `hollow-adv-<n>.ts` in each task directory. Nothing under /home/user/Kung-Fu was edited and nothing was committed.

State now:
- `python3 bench/box.py check-tasks W --window none` ends `window: none; 22 WRONG`. All 22 are my kept breaches. Every reference, plain, `other` and writer's hollow line is `ok`.
- `python3 bench/holds.py check W` ends `all as they must be`.
- `tsc --strict` passes the module, the three references, my three `other.ts` and every `hollow-adv` file.
- The grader runs vitest only, with no type check. An answer with a type error, or one that widens a type or adds an interface field, passes. I tried both; I filed neither.

For each breach I ran the file beside the task's reference on one input and saw them differ. That input is given below as the witness.

## PK1 (beside): `openBySeverity`

**other.ts passed.** It builds the zero tally from `Object.keys(RANK)` and counts with `reduce`, placed before `closeSurvey`.

**Breaches in the ask's own check: 5.** Root cause of adv-3 and adv-4: the check never looks at the result as an object. It reads four properties, as in check.test.ts line 25: `expect([none.advisory, none.minor, none.major, none.critical]).toEqual([0, 0, 0, 0]);`. One `toEqual({advisory: .., minor: .., major: .., critical: ..})` closes both.

| File | What it gets wrong | Witness |
| --- | --- | --- |
| `hollow-adv-1.ts` | Counts each checklist item once, not each finding. The ask says "counts the findings that are not waived". No list in the check holds two standing findings with one code. | `[ELE-03 minor, ELE-03 minor]` gives minor 1, not 2 |
| `hollow-adv-2.ts` | Every call hands back one module-level object, reset each time. The check reads each result before the next call. | Result of `[FIR-01 major]`, read after `openBySeverity([])`, shows major 0 |
| `hollow-adv-3.ts` | The result has a fifth key, `waived`. The ask says "The result has all four severities as keys" and the signature says `Record<Severity, number>`. | `Object.keys` gives five names |
| `hollow-adv-4.ts` | The zeros are on a prototype, so a severity with no finding has no own key. This is the writer's `hollow-sparse` in a form the check does not see. | `JSON.stringify` of the result for `[FIR-01 major]` is `{"major":1}` |
| `hollow-adv-5.ts` | Changes the findings: upper-cases and trims `code`, trims `note`. The ask says "It must leave the array, and the findings in it, as they were". The case at lines 44 to 52 uses tidy codes and empty notes, so tidying changes nothing there. | `{code: "ele-03", note: " dim "}` comes back as `ELE-03`, `dim` |

**Breaches through `unchanged`: 4.** Each is the reference with one other declaration changed. They would pass PK2 and PK3 as well, except adv-8, which PK3's own cases catch.

| File | What it gets wrong | Witness |
| --- | --- | --- |
| `hollow-adv-6.ts` | `waive` takes the first finding with the code and gives up if it is already waived. The module takes the first one still standing. The helper's two `waive` cases about waived findings hold one finding per item. | Record `[FIR-01 major waived, FIR-01 major standing]`: module returns true and outcome `pass`; hollow returns false, outcome stays `conditional`. The helper builds this very state in "addFinding: a waived finding does not stand..." |
| `hollow-adv-7.ts` | `summaryLine` says `clean` when every finding is waived. | Two findings, both waived: module `Teal day 87 09:30 pass, 2 findings (2 waived)`; hollow `..., clean` |
| `hollow-adv-8.ts` | `certificateLine` adds `, expired` once `today >= cert.expires`. The helper reads a started certificate only on days 1000, 1200 and 1015, all inside its cover. | Certificate 1000 to 1365 read on day 1365 |
| `hollow-adv-9.ts` | A checklist title is changed: `Inlet trips` to `Inlet works`. The helper's only title case is `i.title.length > 0`. | `findItem("ELE-02").title` |

**Kept near miss:** `hollow-adv-10.ts` counts a waived critical finding. The check fails it at "does not count a waived finding".

**Its kind.** It is a true `beside` task. A right answer needs only the `Severity` union (outline line 4) and the fields of `Finding` (lines 24 to 28), and the ask gives the signature. Nothing is needed from a body or a comment. The reference edit has an empty SEARCH. The check is fair: "goes by the finding's own severity, whatever its checklist item says" is the ask's "each under its own severity".

## PK2 (inside): `outcomeOf`

**other.ts passed.** It uses `filter` and a count helper, with no loop.

**Breaches in the ask's own check: 3.**

| File | What it gets wrong | Witness |
| --- | --- | --- |
| `hollow-adv-1.ts` | Counts minor items (a set of codes), not minor findings. The check's `minors()` always uses distinct codes. Unlikely, but it passes. | Five standing minors, two of them on ELE-03: `pass`, not `conditional` |
| `hollow-adv-2.ts` | Adds a rule the ask does not have: ten or more minors fail. The check never has more than seven minors (`CODES` has seven). | Ten minors: `fail`, not `conditional` |
| `hollow-adv-3.ts` | Fails only at exactly three majors (`majors === MAX_MAJORS + 1`). The ask says "unless it fails anyway for the reasons it fails now". The helper and the check have three majors and never four. | Four majors: `conditional`, not `fail` |

**Breaches through `unchanged`: 4.**

| File | What it gets wrong | Witness |
| --- | --- | --- |
| `hollow-adv-4.ts` | `runsOut` follows on into one later certificate only. The helper's chains are two certificates long. | Passes on 1000, 1340, 1710, asked on 1100: module 2095, hollow 1730 |
| `hollow-adv-5.ts` | `addFinding` puts the caller's own object in the record when a worse finding takes a place. The helper tests the copy only for a new item (`expect(record.findings[0]).not.toBe(extra)`). | Change the caller's finding afterwards and the record's note changes |
| `hollow-adv-6.ts` | `renewalWindow` takes its end from `runsOut`, not from the certificate in force. | Passes on 1000 and 1340, asked on 1100: module `{1337, 1365}`, hollow `{1702, 1730}` |
| `hollow-adv-7.ts` | `certificates` cuts earlier certificates short only after the whole replay, so a later survey sees the old expiry. | Pass 1000, fail 1350, pass 1360: module's new certificate runs 1360 to 1725; hollow's runs 1365 to 1730, leaving days 1360 to 1364 uncovered |

**Kept near miss:** `hollow-adv-8.ts` returns `conditional` inside the loop at the fifth minor. The check fails it at "a survey that fails anyway still fails". I also tried "five minors count as one major" (failed at "five minors beside one or two majors...") and sorting in place first (failed by the helper). Counting majors with the minors gives the same outcome everywhere, so it is not wrong.

**Its kind: this is the main fault. The change can be written from the ask and the outline alone, without the body.** WRITER.md says the change "needs its body: it cannot be written from the first line". One edit does it, and its SEARCH is outline line 158 exactly, which is in the file once:

```
<<<<<<< SEARCH
export function outcomeOf(findings: Finding[]): Outcome {
=======
export function outcomeOf(findings: Finding[]): Outcome {
    const before = outcomeBefore(findings);
    const minors = findings.filter((finding) => !finding.waived && finding.severity === "minor").length;
    return before === "pass" && minors >= 5 ? "conditional" : before;
}

function outcomeBefore(findings: Finding[]): Outcome {
>>>>>>> REPLACE
```

I applied it to the module. It passes PK2's check and `tsc --strict`. It works because the new rule only changes the old result after the fact, and the ask supplies every fact the wrapper needs: "A waived finding does not count towards the five", "advisories are not counted with the minors", "unless it fails anyway for the reasons it fails now". So an `outline-1` reader can pass PK2, and a pass there would not show that it held the body. To be `inside`, the change would have to alter something in the middle of the body that cannot be worked out from the old return value.

Otherwise everything a right answer needs is in the ask and `region.md`: the body at lines 158 to 175, and the outline shows `MAX_MAJORS = 2`. I found no second reading of the ask.

## PK3 (leans): `certificateLine`

**other.ts passed.** `left = cert.expires - today`; a count when `left > 0`, else `lapsed`.

**The natural wrong guess, in four more forms: the check fails them all.**
- Lapsed only when `today > expires`, with `expires - today` days. Kept as `hollow-adv-7.ts`; it says `0 days left` on day 1365 and fails three cases.
- An inclusive loop count: fails seven cases.
- Lapsed on the right day but the count one too many: fails six.
- `Math.max(1, expires - today)`: fails three.
- A count from `from + COVER_DAYS` for both kinds of certificate fails at "a certificate that a failed survey ended early".

The check is tight on the fact itself.

**Breaches in the ask's own check: 2.**

| File | What it gets wrong | Witness |
| --- | --- | --- |
| `hollow-adv-1.ts` | For an interim certificate it counts from `cert.from + 21` and ignores `expires`. The check's ended-early case (lines 53 to 61) uses a full certificate only. | Conditionals on 1000 and 1015 leave an interim certificate 1000 to 1015. Day 1012: reference `3 days left`, hollow `9 days left`. Day 1016: reference `lapsed`, hollow `5 days left` |
| `hollow-adv-2.ts` | Tests for lapsed before testing for not started. The ask says the lines "for a certificate that has not started yet, stay as they are". | The module can make a certificate that is ended before it starts: `["SC-HERON-01365", 1365, 1350]`, which the helper pins. Read on 1360: reference `starts in 5 days`, hollow `lapsed`. No case anywhere reads such a certificate's line |

**Breaches through `unchanged`: 4.**

| File | What it gets wrong | Witness |
| --- | --- | --- |
| `hollow-adv-3.ts` | `dueForSurvey` uses the expiry of the certificate in force, not `runsOut`. No boat in the helper's fleet has passed early. | Passes on 1000 and 1338, today 1340, within 30: module `[]`, hollow `["Heron"]` |
| `hollow-adv-4.ts` | `checklistFor` hands back copies of the items. The helper compares codes and lengths only. | `checklistFor(heron)[0] === CHECKLIST[0]` is false |
| `hollow-adv-5.ts` | `waive` trims the reason. | Reason `" fitted today "` |
| `hollow-adv-6.ts` | `feeLabel` uses `toLocaleString`. The helper's largest fee is 14500. | `feeLabel(123456)`: module `£1234.56`, hollow `£1,234.56` |

**Its kind.**
- **The ask does not give the fact away.** "counting today when the boat may go out today" and the examples fit both readings of `expires`. The only code span naming a declaration is `certificateLine`.
- **`region.md` does not show it.** The body of `certificateLine` never reads `cert.expires`. The outline shows `43:   expires: number` and nothing more.
- **The other declaration's first line does not show it.** `issueCertificate(record: SurveyRecord, previous: Certificate | null): Certificate | null` leaves it open.
- **The whole file shows it plainly, four times:** the comment at line 295 (`// expires is the first day the boat may not go out: a pass on day 100 covers days 100 to 464`), the tests at lines 321 and 338, and the comment at line 353.
- **A careful reader of `region.md` would see that something else matters.** The ask needs the last day of cover, and the body shown says nothing about `expires`.
- **My doubt: is the "natural guess" really the natural one?** where.md says the guess is that the certificate still covers the day it expires, giving `expires - today + 1`. But the plainest code a reader would write, `cert.expires - today` with `lapsed` at 0 or less, is the right answer. A `region` reader who does not stop on "counting today" passes without holding the fact. I would put this near a coin toss, so a `region` pass on PK3 does not show the reader knew the fact. The fact has two values, so I do not see how the writer could avoid this. Read the tries for which way they lean.
- **The body is not needed either.** As for PK2, one edit whose SEARCH is outline line 370 wraps the old function and passes the check, once the fact is known. For a `leans` task this is not against the brief.

## The module (/home/build/patch/survey/set/files/survey.ts)

- **Nothing broken, nothing that changes from run to run.** No clock, no random number, no import, no locale call. 394 lines, none over 120 columns, no tab, no trailing space, no line the bench reads as a mark. It passes `tsc --strict`.
- **It reads as real code.** Comments are sparse and useful. The conventions a guess would get wrong are visible only in bodies: `expires` is the first day not covered; history is newest first; -1 stands for "none" in `lastPassDay`, `passRate` and `runsOut`; `sortFindings` sorts in place; `surveysBetween` is half-open and oldest first; the half fee is rounded down; the diary rounds up to a quarter hour; a survey may end on the stroke of closing.
- **One oddity, pinned on purpose:** `certificates` can give a certificate whose `expires` is before its `from`. PK3 adv-2 lives on it.
- **The asks keep the brief's form:** 76, 88 and 137 words, a title line, the file named as `src/survey.ts`, no mention of a test.

**The regression helper is strong against a file written anew, and weak against small slips.** Of about 60 one-place changes, it caught every moved range end, every changed rounding and every changed default I tried in `plannedMinutes`, `fitsWorkingDay`, `latestStart`, `sortFindings`, `surveysBetween`, `passRate`, `fileSurvey`, `issueCertificate`, `currentCertificate` and `surveyFee`. What it misses is filed above, in eleven places: `waive` (twice), `summaryLine`, `certificateLine`, the checklist's titles, `runsOut`, `addFinding`, `renewalWindow`, `certificates`, `dueForSurvey`, `checklistFor` and `feeLabel`.

**Also passed, not filed.** These differ only on inputs the module's own callers do not make, or only in wording:
- `makeFinding`'s error text. `toThrow("no checklist item XX-99")` matches any message that contains those words, and no case has spaces round a bad code.
- `clockLabel` wrapping at 24 hours.
- `addFinding` not working the outcome out again when the new finding is dropped. It differs only if the stored outcome was stale.
- `waive` waiving every standing finding on the item.
- `reinspectList` and `needsSlipway` on codes the checklist does not hold.
- `lastPassDay` taking the largest day. It is the same on a history kept newest first.
- The serial keeping an underscore.
- `renewalWindow` returning null for a full certificate cut to under 28 days.
- PK1: skipping findings whose code is not on the checklist.

## Counts and files

- Breaches: 22. PK1 has 9 (`hollow-adv-1` to `-9`), PK2 has 7 (`hollow-adv-1` to `-7`), PK3 has 6 (`hollow-adv-1` to `-6`).
- Kept near misses that the checks rightly fail: PK1 `hollow-adv-10.ts`, PK2 `hollow-adv-8.ts`, PK3 `hollow-adv-7.ts`.
- `other.ts` failed: 0 of 3.
- Files added, all under /home/build/patch/survey/set/tasks/: `PK1/other.ts` and `PK1/hollow-adv-1.ts` to `hollow-adv-10.ts`; `PK2/other.ts` and `PK2/hollow-adv-1.ts` to `hollow-adv-8.ts`; `PK3/other.ts` and `PK3/hollow-adv-1.ts` to `hollow-adv-7.ts`.
- My working scripts are in SCRATCH/adv-survey/ and may be cleared: the two mutant batches (`mut1.py`, `mut2.py`), the witness runs (`witness.ts`) and the outline-only wrap (`wrap.py`, `wrap-pk2.ts`, `wrap-pk3.ts`). Nothing in this report depends on them.