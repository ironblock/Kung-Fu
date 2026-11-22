# PF1, beside: `WorkLog.partsBySku`

**The right change.** One new method in the class `WorkLog`, anywhere among its members. The reference puts it before `boatSummary` (line 476 of the file). It walks `this.jobs.values()`, skips a job whose `state` is `"dropped"`, and adds each part line's `qty` under the line's `sku`. Nothing else in the file changes.

**What it needs, and where that is.** All of it is in the outline or in the ask:

- `private jobs: Map<number, Job>` is line 376, a member line of the class.
- `Job.parts: PartLine[]` and `Job.state: JobState` are lines 38 and 33. `PartLine.sku` and `PartLine.qty` are lines 15 and 16.
- `"dropped"` is on line 4, in `JobState`.
- That a dropped job is left out, and a part number only dropped jobs have with it, that prices do not split the sum, and that finished jobs count, are in the ask.

No fact from a body is needed. The part numbers are stored trimmed and in capitals by `addPart` (lines 211 to 237, with its comment), but the method only reads what is stored. An answer that trims and capitalises again fails: the ask says "exactly as it is stored", and the case "keys a line put on the job by hand" puts on a line, through `get`, whose sku is `"pin-6 "`.

**What a wrong answer is likely to do.**

- Count the dropped jobs too (`hollow-dropped.ts`). The case "leaves out a dropped job" fails.
- Count only the jobs still open, reading "used" as "in use" (`hollow-open.ts`). The case "counts the jobs that are waiting, done and signed" fails.
- Leave out the frozen jobs, signed and dropped (`hollow-frozen.ts`), or the booked and started ones (`hollow-notbooked.ts`). "Counts the jobs that are waiting, done and signed" fails the first, "counts the jobs that are booked and started" the second.
- Trim and capitalise each sku again (`hollow-rekeyed.ts`). "Keys a line put on the job by hand" fails.
- Sort a job's lines in place while reading them (`hollow-sorted.ts`). "Does not change the log or its jobs" fails: job 4 there holds `ROPE-10` before `EYE-8`.
- Key by sku and unit price, or give one entry for each line. The cases on one job at several prices fail.
- Call a member the class does not have, such as `this.all()` or `this.jobs.forEach` on an array: the file has a `Map`. Every case of the new method then fails with a TypeError.
- Put the method outside the class, or quote a line that is not in the file, so that the patch does not apply.
- Write the whole class or file anew from the outline. `unchanged` then fails, as it does for `hollow-lost.ts`, where `billedMinutes` rounds to the nearest quarter hour and not up. The other hollow answers here each change one more function and fail through `unchanged` too: `formatPence` (`hollow-floor.ts`), `addTime` (`hollow-wrap.ts`), `addPart` (`hollow-wholeprice.ts`), `jobLine` (`hollow-boatkey.ts`), `canMove` (`hollow-urgentdone.ts`) and `WorkLog.usePart` (`hollow-openonly.ts`).
