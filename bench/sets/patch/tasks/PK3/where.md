# PK3, leans: `certificateLine`

**The right change.** In `certificateLine` (lines 370 to 379 of `src/survey.ts`), the last `return`, which is the line for a certificate that has started. The days left are `cert.expires - today`. When that is above 0 the line ends `, N days left` (`, 1 day left` for 1; the file's `plural` helper does that), and otherwise `, lapsed`. The reference puts two lines in place of the one `return`. The two earlier returns, for no certificate and for one that has not started, stay.

**The other declaration.** `issueCertificate` (lines 278 to 298), which makes every certificate and so decides what `expires` means.

**The fact.** `expires` is the first day the boat may NOT go out: the certificate covers `from` up to, and not on, `expires`. A pass on day 1000 has `expires` 1365 and covers days 1000 to 1364. So on day 1364 one day is left, and on day 1365 the certificate has lapsed.

**The lines that show it.**

- Line 295, a comment in `issueCertificate`: `// expires is the first day the boat may not go out: a pass on day 100 covers days 100 to 464`, and line 296, `const expires = from + COVER_DAYS[record.outcome];` with 365 for a pass (line 88).
- Line 321, in `currentCertificate`: `if (day >= cert.from && day < cert.expires) {`.
- Line 338 in `runsOut` has the same test, and line 353 in `renewalWindow` says `// closes is the first day that is too late` of a value that is `cert.expires`.

**What the first lines leave open.** The outline shows `expires: number` in `Certificate` (line 43) and `issueCertificate(record: SurveyRecord, previous: Certificate | null): Certificate | null` (line 278). Neither says which end is included. No exported function takes one certificate and a day, so the test cannot be borrowed by a call.

**The natural wrong guess.** That a certificate still covers the day it expires, as a dated paper certificate does: `left = cert.expires - today + 1`, lapsed only when `today > cert.expires`. `hollow-guess.ts` is the reference with that. It says `2 days left` on the last day and `1 day left` on the first day the boat may not go out, and every case that counts days fails.

**Other wrong answers.**

- `hollow-flat.ts` writes `1 days left`.
- `hollow-early.ts` puts the ending on the line of a certificate that has not started, by dropping that branch: the old case "a certificate that has not started says in how many days it starts" fails.
- `hollow-lapsedfirst.ts` asks whether the certificate has lapsed before it asks whether it has started. The module can make a certificate that a fail ends before it starts: passes on 1000 and 1340 and a fail on 1350 give `SC-HERON-01365`, from 1365, expiring 1350. On day 1360 its line must still say `starts in 5 days`, as the ask keeps that line as it is; "a certificate that a fail ended before it started still says when it starts" fails.
- `hollow-interim.ts` counts an interim certificate's days from `from` and its 21 days of cover, and not from `expires`. A second conditional ends an interim certificate early, so "an interim certificate that a second conditional ended early" fails.
- Lapsed only when the days left are below 0, so that the first uncovered day reads `0 days left` (`hollow-zero.ts`).
- `hollow-lost.ts` rounds `plannedMinutes` to the nearest quarter of an hour, where the file rounds up. `hollow-inforce.ts` (`dueForSurvey` goes by the certificate in force and not by `runsOut`), `hollow-copies.ts` (`checklistFor` hands back copies of the items), `hollow-trimmed.ts` (`waive` trims the reason) and `hollow-comma.ts` (`feeLabel` puts a comma in a thousand pounds) each fail one case of "survey: what was there is as it was".

**A pass that does not show the fact.** The plainest code, `cert.expires - today` with `lapsed` at 0 or less, is the right answer. So a `region` reader who never asks what `expires` means, and does not stop on "counting today", passes without holding the fact. A pass here shows that the reader wrote the right count; it does not show that the reader knew why. Read each `region` pass for whether it says or tests what `expires` means, and give the count of those that do not beside the score.

The check takes its certificates from `issueCertificate` and `certificates`, and asserts with `isCertified` which days are covered, so it holds an answer to the module's own meaning of `expires`. It skips two old cases, the two that pin the line of a started certificate.
