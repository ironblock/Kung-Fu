# PK1, beside: `openBySeverity`

**The right change.** One new exported function, added at the end of `src/survey.ts` (the reference adds it after `feeLabel`, the last declaration, lines 392 to 394). It starts a tally with all four severities at 0, adds one under `finding.severity` for each finding whose `waived` is false, and returns the tally. Nothing that is there changes.

**What it needs from the file.** Only what the outline shows: `Severity` is `"advisory" | "minor" | "major" | "critical"` (line 4), and a `Finding` has `code`, `severity`, `note` and `waived` (lines 25 to 28). No body and no comment is needed.

**What a wrong answer is likely to do.**

- Count waived findings too (`hollow-waived.ts`): the case "does not count a waived finding" fails.
- Build the result only from the severities that turn up, so that a severity with no finding has no key (`hollow-sparse.ts`): the case "has all four severities as keys" fails with `undefined` where 0 is wanted.
- Look the severity up from the checklist item with `findItem` in place of the finding's own (`hollow-item.ts`): the case "goes by the finding's own severity" fails. A surveyor may book a finding at another severity than its item's.
- Count a waived critical finding, on the idea that a critical one is never waived (`hollow-critical.ts`): "does not count a waived finding" fails.
- Count each checklist item once, not each finding (`hollow-distinct.ts`): "counts every finding, so two on one item count as two" fails.
- Hand back one object that the module keeps and sets to 0 at each call (`hollow-shared.ts`): "gives each call a tally of its own" fails.
- Give the result a fifth key, such as `waived` (`hollow-fifth.ts`), or put the zeros on a prototype so that a severity with no finding is not a key of the result's own (`hollow-prototype.ts`): "has the four severities as its own keys and no other key" fails.
- Sort or filter the array in place: the case "leaves the array and its findings as they were" fails.
- Tidy the codes or the notes on the way (`hollow-tidies.ts`): "leaves a finding as it was written down" fails.
- Write the whole file anew, or change another declaration on the way (`hollow-lost.ts` files a second survey of one day behind the first): a case of "survey: what was there is as it was" fails. So do `hollow-firstwaived.ts` (`waive` gives up at the first finding with the code when that one is waived already), `hollow-allwaived.ts` (`summaryLine` says `clean` when every finding is waived), `hollow-expired.ts` (`certificateLine` adds `, expired` on and after the day a certificate expires) and `hollow-title.ts` (one checklist title changed).
- Put the function in place by an edit whose SEARCH text is not in the file, or is there more than once, such as a lone `}`: the edit is refused, the function is missing, and all nine new cases fail with `openBySeverity is not a function`.
