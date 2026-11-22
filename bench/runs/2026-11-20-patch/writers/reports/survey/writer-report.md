The `survey` module, its regression helper and the three tasks are written in /home/build/patch/survey/set, and every command in the brief ends as it must. No rule of the brief had to be broken. Nothing was committed and nothing under /home/user/Kung-Fu was changed.

## The module

/home/build/patch/survey/set/files/survey.ts has 394 lines (`wc -l`). It has no import, no clock and no random number. It uses four spaces, no line is over 120 columns, and every function header is on one line. The outline shows no first line cut.

**Exports**
- Types: `Severity`, `Outcome`, `Area`, `Boat`, `ChecklistItem`, `Finding`, `SurveyRecord`, `Certificate`, `BoatFile`.
- Constant: `CHECKLIST`, 18 items.
- Functions: `findItem`, `checklistFor`, `plannedMinutes`, `fitsWorkingDay`, `latestStart`, `clockLabel`, `makeFinding`, `sortFindings`, `outcomeOf`, `closeSurvey`, `addFinding`, `waive`, `reinspectList`, `needsSlipway`, `summaryLine`, `fileSurvey`, `lastPassDay`, `surveysBetween`, `passRate`, `issueCertificate`, `certificates`, `currentCertificate`, `isCertified`, `runsOut`, `renewalWindow`, `dueForSurvey`, `certificateLine`, `surveyFee`, `feeLabel`.
- Not exported: the tables `RANK`, `HOURS`, `COVER_DAYS`, `FEES`; the constants `MAX_MAJORS`, `EARLY_DAYS`, `RESURVEY_DAYS`; the helpers `tidyCode`, `plural`, `serialFor`.

**Conventions a guess would get wrong.** Each shows only in a body or a table, never in a first line.
1. A certificate's `expires` is the first day the boat may not go out. It shows in a comment and the sum in `issueCertificate` (lines 295-296), and in the tests in `currentCertificate` (321) and `runsOut` (338).
2. A history is kept newest first, and a second survey on one day goes ahead of the first. `fileSurvey` changes its argument and returns the place taken. `certificates` replays from the back, and `surveyFee` reads `history[0]`.
3. -1 stands for "none" in `lastPassDay`, `passRate` and `runsOut`. Day 0 is a real day.
4. Fees are in pence, in the `FEES` table. A return visit within 14 days (14 counts) is free after a conditional and half price after a fail, rounded down to a penny.
5. Times are minutes from midnight, in the `HOURS` table (480 and 1020). A survey may end exactly at closing. `plannedMinutes` rounds up to a quarter of an hour.
6. `sortFindings` sorts in place, worst first, keeps ties in order and returns the same array. `closeSurvey` keeps its own copies. `addFinding` and `waive` change the record and work its outcome out again.
7. `surveysBetween` includes its first day and not its second, and returns oldest first.
8. A pass in the last 28 days of a full certificate starts where that certificate ends. Any other survey ends earlier certificates on its own day. An interim certificate is never followed by another.
9. `dueForSurvey` puts boats with no cover first and counts the `within` day itself as due. Ties stay in fleet order.
10. A waived finding and an advisory never count towards the outcome. A critical finding cannot be waived.

## The regression helper

/home/build/patch/survey/set/checks/helpers-survey.ts registers 99 named cases, at least two for each exported function. A skip name that matches no case fails a case of its own. I tried it on 117 one-line changes to the module: 116 failed it, and the one that passed behaves the same as the module.

## The tasks

| Id | Kind | Title | What it turns on |
| --- | --- | --- | --- |
| PK1 | beside | Count the standing findings by severity | Adds `openBySeverity(findings: Finding[]): Record<Severity, number>` at the end of the file with an empty SEARCH. It needs only `Severity` and the members of `Finding`, which the outline shows. |
| PK2 | inside | Too many minor findings should hold a certificate back | In `outcomeOf`, five or more minor findings that are not waived make a survey conditional. The rules that must stay are only in the body. Three edits, six lines differ. |
| PK3 | leans | Say how much cover is left on the certificate line | `certificateLine` must end `, N days left` or `, lapsed`. The right count is `cert.expires - today`, which leans on convention 1 in `issueCertificate`. `hollow-guess.ts` treats the expiry day as still covered (`+ 1`). |

- **Hollow answers:** PK1 has `lost`, `waived`, `sparse`, `item`. PK2 has `lost`, `waived`, `over`, `fail`, `advisory`. PK3 has `lost`, `guess`, `flat`, `early`. I read the failing cases of each: every one fails at an assertion for the reason it was written for, and each `hollow-lost.ts` fails only through `unchanged`.
- **Skipped old cases:** PK1 skips none, PK2 one, PK3 two.
- **Asks:** 69, 78 and 126 words.

## Last line of each command

- `tsc` on the module, and on each `reference.ts` copied to a temporary `.ts` file: no output, exit 0. The helper and each check also type-check against their reference.
- `holds.py make`: `3 tasks: name, outline, region, whole written for each`
- `holds.py check`: `all as they must be`
- `box.py check-tasks W --window none`: `window: none; all as they must be`
- `holds.py sizes`: `PK3   leans          394       115      4109      4564     15284   certificateLine`

The texts are 115 bytes for `name`, 4,109 for `outline`, 4,621 (PK2) and 4,564 (PK3) for `region`, and 15,284 for `whole`.

The script that builds the task files from the module is in the scratchpad, at SCRATCH/survey/build.py. W holds only its output.

## Unsure

1. PK3's "natural wrong guess" is a judgement. I take a reader of `expires: number` to assume the certificate still covers its expiry day, as a dated paper certificate does. A reader who assumes the other end passes by luck, so some `region` passes on PK3 may be coin flips and not knowledge. No exported function takes one certificate and a day, so the test cannot be borrowed by a call.
2. The outline prints the one-line constants with their values (`MAX_MAJORS = 2`, `EARLY_DAYS = 28`, `RESURVEY_DAYS = 14`). It prints interface members without their semicolons and with two spaces of indent. An outline-only reader of PK2 sees the 2 but not the rule it belongs to. No reference edit quotes outline text.
3. PK1's region text is the outline text, because its ask names nothing the file declares. `holds.py check` prints this and does not count it wrong.
4. PK2's check has one case that goes through `closeSurvey` and `waive`. The ask does not name them, but both call `outcomeOf`, so a right change to `outcomeOf` alone passes it.
5. PK3's check takes its certificates from `issueCertificate` and `certificates`, and asserts with `isCertified` which days are covered. An answer that also changed what `expires` means would fail through `unchanged`, not there.
6. `survey` is not in the brief's two lists of modules. As told, I treated it as a smaller one: no class, and the `beside` task adds an exported function.
7. The module holds one non-ASCII character, the pound sign in `feeLabel`. No edit quotes it.
8. PK3 and PK1 each have a hollow answer beyond the two the brief asks for, and PK2 has three beyond. They are extra, not required.